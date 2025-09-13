from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Department, Transaction, UserRole, TransactionStatus
from utils import compute_transaction_hash, hash_password, verify_password
from local_auth import jwt_required, get_current_user, generate_token
import uuid
from datetime import datetime, timedelta
from functools import wraps
import logging
import re
import requests

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///transparency_ledger.db'  # Using SQLite for simplicity
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'

db.init_app(app)
CORS(app)

# Initialize database tables
with app.app_context():
    db.create_all()
    # Create default admin user if doesn't exist
    try:
        existing_admin = User.query.filter_by(email='admin@transparency.com').first()
        if not existing_admin:
            admin = User(
                name='System Administrator',
                email='admin@transparency.com',
                password_hash=hash_password('admin123'),
                role=UserRole.Admin
            )
            db.session.add(admin)
            db.session.commit()
    except Exception as e:
        # If there's an error (like missing columns), just create tables and continue
        print(f"Warning: Could not create default admin user: {e}")
        pass

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"success": False, "message": "Email already exists"}), 400
        
        user = User(
            name=data['name'],
            email=data['email'],
            password_hash=hash_password(data['password']),
            role=UserRole[data.get('role', 'ProjectManager')]
        )
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "user_id": str(user.user_id),
            "message": "User registered successfully"
        }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user and verify_password(data['password'], user.password_hash):
            # Generate JWT token
            token = generate_token(str(user.user_id), user.email)
            if not token:
                return jsonify({"success": False, "message": "Failed to generate token"}), 500
            
            return jsonify({
                "success": True, 
                "user_id": str(user.user_id), 
                "role": user.role.value,
                "name": user.name,
                "email": user.email,
                "token": token,
                "message": "Login successful"
            }), 200
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Public Routes (No authentication required)
@app.route('/api/public/transactions', methods=['GET'])
def get_public_transactions():
    """
    Get all transactions for public view (read-only)
    """
    try:
        transactions = Transaction.query.order_by(Transaction.created_at.desc()).all()
        result = []
        
        for trans in transactions:
            # Get department info
            department = Department.query.get(trans.dept_id) if trans.dept_id else None

            # Get fromDept and toDept
            # You already set fromDept and toDept when creating the transaction on the blockchain,
            # so you should store them in your Transaction model.
            # If not, you can reconstruct them here as below:
            creator = User.query.get(trans.created_by_id)
            if creator and creator.role == UserRole.Admin:
                from_dept = "Admin"
            elif creator and creator.role == UserRole.DeptHead:
                headed_dept = Department.query.filter_by(head_user_id=creator.user_id).first()
                from_dept = headed_dept.name if headed_dept else creator.name
            else:
                from_dept = creator.name if creator else "Unknown"
            to_dept = department.name if department else "Unknown"

            result.append({
                "transaction_id": str(trans.transaction_id),
                "amount": float(trans.amount),
                "purpose": trans.purpose,
                "fromDept": from_dept,
                "toDept": to_dept,
                "status": trans.status.value,
                "created_at": trans.created_at.isoformat(),
                "transaction_hash": trans.blockchain_hash
            })
        
        return jsonify({
            "success": True,
            "transactions": result,
            "total_count": len(result)
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
# Protected User Profile Route
@app.route('/api/profile', methods=['GET'])
@jwt_required
def get_user_profile():
    """
    Get authenticated user profile
    """
    try:
        current_user_info = get_current_user()
        user = User.query.get(current_user_info['user_id'])
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        return jsonify({
            "success": True,
            "user": {
                "user_id": str(user.user_id),
                "name": user.name,
                "email": user.email,
                "role": user.role.value,
                "created_at": user.created_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Department Management Routes
@app.route('/api/departments', methods=['POST'])
@jwt_required
def create_department():
    try:
        data = request.get_json()
        current_user_info = get_current_user()
        admin_user = User.query.get(current_user_info['user_id'])
        if not admin_user or admin_user.role != UserRole.Admin:
            return jsonify({"success": False, "message": "Only admin can create departments"}), 403

        # Validate required fields
        name = data.get('name')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        if not name or not password or not confirm_password:
            return jsonify({"success": False, "message": "All fields are required"}), 400
        if password != confirm_password:
            return jsonify({"success": False, "message": "Passwords do not match"}), 400
        if len(password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

        # Enforce department name is a valid email
        email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(email_regex, name):
            return jsonify({"success": False, "message": "Department name must be a valid email address"}), 400

        dept_email = name.strip().lower()
        if User.query.filter_by(email=dept_email).first():
            return jsonify({"success": False, "message": "Department user already exists"}), 400

        dept_head = User(
            name=f"{dept_email.split('@')[0].replace('.', ' ').title()} Head",
            email=dept_email,
            password_hash=hash_password(password),
            role=UserRole.DeptHead
        )
        db.session.add(dept_head)
        db.session.commit()

        dept = Department(
            name=dept_email.split('@')[0].replace('.', ' ').title(),
            description=data.get('description', ''),
            parent_dept_id=data.get('parent_dept_id'),
            head_user_id=dept_head.user_id,
            allocated_budget=data.get('allocated_budget', 0.00)
        )
        db.session.add(dept)
        db.session.commit()

        return jsonify({
            "success": True,
            "dept_id": str(dept.dept_id),
            "head_user_email": dept_head.email,
            "message": "Department and user created successfully"
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    

@app.route('/api/departments', methods=['GET'])
@jwt_required
def get_departments():
    try:
        departments = Department.query.all()
        result = []
        for dept in departments:
            head_user = User.query.get(dept.head_user_id) if dept.head_user_id else None
            result.append({
                "dept_id": str(dept.dept_id),
                "name": dept.name,
                "description": dept.description,
                "parent_dept_id": str(dept.parent_dept_id) if dept.parent_dept_id else None,
                "head_user_id": str(dept.head_user_id) if dept.head_user_id else None,
                "head_user_name": head_user.name if head_user else None,
                "allocated_budget": float(dept.allocated_budget),
                "created_at": dept.created_at.isoformat()
            })
        # FIX: Return as {departments: [...]}
        return jsonify({"departments": result, "success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
@app.route('/api/departments/<dept_id>', methods=['GET'])
def get_department(dept_id):
    try:
        dept = Department.query.get(dept_id)
        if not dept:
            return jsonify({"success": False, "message": "Department not found"}), 404
        
        head_user = User.query.get(dept.head_user_id) if dept.head_user_id else None
        
        # Get sub-departments
        sub_departments = Department.query.filter_by(parent_dept_id=dept.dept_id).all()
        sub_dept_list = []
        for sub_dept in sub_departments:
            sub_head = User.query.get(sub_dept.head_user_id) if sub_dept.head_user_id else None
            sub_dept_list.append({
                "dept_id": str(sub_dept.dept_id),
                "name": sub_dept.name,
                "head_user_name": sub_head.name if sub_head else None,
                "allocated_budget": float(sub_dept.allocated_budget)
            })
        
        result = {
            "dept_id": str(dept.dept_id),
            "name": dept.name,
            "description": dept.description,
            "parent_dept_id": str(dept.parent_dept_id) if dept.parent_dept_id else None,
            "head_user_id": str(dept.head_user_id) if dept.head_user_id else None,
            "head_user_name": head_user.name if head_user else None,
            "allocated_budget": float(dept.allocated_budget),
            "created_at": dept.created_at.isoformat(),
            "sub_departments": sub_dept_list
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Transaction Management Routes
@app.route('/api/transactions', methods=['POST'])
@jwt_required
def create_transaction():
    try:
        data = request.get_json()
        current_user_info = get_current_user()
        created_by_id = current_user_info['user_id']

        dept_id = data.get('dept_id')
        if not dept_id:
            return jsonify({"success": False, "message": "Department ID is required"}), 400

        dept = Department.query.get(dept_id)
        if not dept:
            return jsonify({"success": False, "message": "Department not found"}), 400

        creator = User.query.get(created_by_id)
        if not creator:
            return jsonify({"success": False, "message": "Creator user not found"}), 400

        # Prepare blockchain transaction data
        if creator.role == UserRole.Admin:
            fromDept = "Admin"
        elif creator.role == UserRole.DeptHead:
            # Find the department this user heads
            headed_dept = Department.query.filter_by(head_user_id=creator.user_id).first()
            fromDept = headed_dept.name if headed_dept else creator.name
        else:
            fromDept = creator.name  # fallback

        toDept = dept.name
        amount = float(data['amount'])
        purpose = data['purpose']

        # Call blockchain API
        blockchain_api_url = "http://localhost:3001/api/transactions"
        payload = {
            "fromDept": fromDept,
            "toDept": toDept,
            "amount": str(amount),
            "purpose": purpose
        }
        bc_response = requests.post(blockchain_api_url, json=payload)
        bc_data = bc_response.json()
        if not bc_data.get("success"):
            return jsonify({"success": False, "message": "Blockchain error: " + bc_data.get("error", "Unknown error")}), 500

        transaction_hash = bc_data.get("transactionHash")

        # Save to local DB (status is now always Settled/Completed)
        last_tx = Transaction.query.order_by(Transaction.created_at.desc()).first()
        previous_hash = last_tx.current_hash if last_tx else ""

        tx_data = {
            "dept_id": str(dept_id),
            "amount": str(amount),
            "purpose": purpose,
            "status": "Completed",
            "created_by_id": str(created_by_id),
            "approved_by_id": "",
            "invoice_url": "",
            "created_at": datetime.utcnow().isoformat()
        }
        current_hash = compute_transaction_hash(tx_data, previous_hash)

        transaction = Transaction(
            dept_id=dept_id,
            amount=amount,
            purpose=purpose,
            status=TransactionStatus.Settled,
            created_by_id=created_by_id,
            approved_by_id=None,
            invoice_url=None,
            previous_hash=previous_hash,
            current_hash=current_hash,
            blockchain_hash=transaction_hash  # Add this field to your model if not present
        )

        db.session.add(transaction)
        db.session.commit()

        return jsonify({
            "success": True,
            "transaction_id": transaction.transaction_id,
            "current_hash": current_hash,
            "blockchain_hash": transaction_hash,
            "message": "Transaction created and added to blockchain"
        }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
# Public Ledger Routes
@app.route('/api/ledger', methods=['GET'])
def get_public_ledger():
    try:
        transactions = Transaction.query.order_by(Transaction.created_at.asc()).all()
        result = []
        
        for tx in transactions:
            dept = Department.query.get(tx.dept_id)
            creator = User.query.get(tx.created_by_id)
            approver = User.query.get(tx.approved_by_id) if tx.approved_by_id else None
            
            result.append({
                "transaction_id": tx.transaction_id,
                "dept_id": str(tx.dept_id),
                "dept_name": dept.name if dept else "Unknown",
                "amount": float(tx.amount),
                "purpose": tx.purpose,
                "status": tx.status.value,
                "created_by": creator.name if creator else "Unknown",
                "approved_by": approver.name if approver else None,
                "created_at": tx.created_at.isoformat(),
                "current_hash": tx.current_hash
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/ledger/verify', methods=['GET'])
def verify_ledger_integrity():
    try:
        transactions = Transaction.query.order_by(Transaction.created_at.asc()).all()
        
        if not transactions:
            return jsonify({"success": True, "message": "No transactions to verify", "is_valid": True}), 200
        
        for i, tx in enumerate(transactions):
            if i == 0:
                # First transaction should have no previous hash or genesis hash
                expected_previous = None
            else:
                expected_previous = transactions[i-1].current_hash
            
            if tx.previous_hash != expected_previous:
                return jsonify({
                    "success": False, 
                    "message": f"Chain broken at transaction {tx.transaction_id}",
                    "is_valid": False
                }), 200
            
            # Recalculate hash to verify integrity
            tx_data = {
                "dept_id": str(tx.dept_id),
                "amount": str(tx.amount),
                "purpose": tx.purpose,
                "status": tx.status.value,
                "created_by_id": str(tx.created_by_id),
                "approved_by_id": str(tx.approved_by_id) if tx.approved_by_id else None,
                "invoice_url": tx.invoice_url,
                "created_at": tx.created_at.isoformat()
            }
            
            expected_hash = compute_transaction_hash(tx_data, tx.previous_hash)
            if tx.current_hash != expected_hash:
                return jsonify({
                    "success": False,
                    "message": f"Hash mismatch at transaction {tx.transaction_id}",
                    "is_valid": False
                }), 200
        
        return jsonify({
            "success": True, 
            "message": "Ledger integrity verified", 
            "is_valid": True,
            "total_transactions": len(transactions)
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Reporting Routes
@app.route('/api/reports/department/<dept_id>/budget', methods=['GET'])
def get_department_budget_report(dept_id):
    try:
        dept = Department.query.get(dept_id)
        if not dept:
            return jsonify({"success": False, "message": "Department not found"}), 404
        
        # Get all transactions for this department
        transactions = Transaction.query.filter_by(dept_id=dept_id).all()
        
        total_spent = sum(float(tx.amount) for tx in transactions if tx.status == TransactionStatus.Approved and tx.amount < 0)
        total_received = sum(float(tx.amount) for tx in transactions if tx.status == TransactionStatus.Approved and tx.amount > 0)
        
        # Get sub-departments spending
        sub_departments = Department.query.filter_by(parent_dept_id=dept_id).all()
        sub_dept_spending = {}
        
        for sub_dept in sub_departments:
            sub_transactions = Transaction.query.filter_by(dept_id=sub_dept.dept_id).all()
            sub_spent = sum(float(tx.amount) for tx in sub_transactions if tx.status == TransactionStatus.Approved and tx.amount < 0)
            sub_dept_spending[sub_dept.name] = abs(sub_spent)
        
        result = {
            "dept_id": str(dept.dept_id),
            "dept_name": dept.name,
            "allocated_budget": float(dept.allocated_budget),
            "total_received": total_received,
            "total_spent": abs(total_spent),
            "remaining_budget": float(dept.allocated_budget) + total_received + total_spent,
            "sub_department_spending": sub_dept_spending,
            "transaction_count": len(transactions)
        }
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        result = []
        for user in users:
            result.append({
                "user_id": str(user.user_id),
                "name": user.name,
                "email": user.email,
                "role": user.role.value,
                "created_at": user.created_at.isoformat()
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
