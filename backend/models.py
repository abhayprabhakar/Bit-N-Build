from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Enum
import enum
import uuid
from datetime import datetime

db = SQLAlchemy()

# Enums
class UserRole(enum.Enum):
    Admin = "Admin"
    DeptHead = "DeptHead"
    ProjectManager = "ProjectManager"

class TransactionStatus(enum.Enum):
    Pending = "Pending"
    Approved = "Approved"
    Rejected = "Rejected"
    Settled = "Settled"

# Models
class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for Firebase users
    role = db.Column(Enum(UserRole), nullable=False)
    firebase_uid = db.Column(db.String(255), unique=True, nullable=True)  # Firebase UID
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    created_transactions = db.relationship('Transaction', foreign_keys='Transaction.created_by_id', backref='creator')
    approved_transactions = db.relationship('Transaction', foreign_keys='Transaction.approved_by_id', backref='approver')
    headed_departments = db.relationship('Department', backref='head_user')
    
    def __repr__(self):
        return f'<User {self.email}>'

class Department(db.Model):
    __tablename__ = 'departments'
    
    dept_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    parent_dept_id = db.Column(db.String(36), db.ForeignKey('departments.dept_id'), nullable=True)
    head_user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=True)
    allocated_budget = db.Column(db.Numeric(19, 4), nullable=False, default=0.00)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    parent_department = db.relationship('Department', remote_side=[dept_id], backref='sub_departments')
    transactions = db.relationship('Transaction', backref='department')
    
    def __repr__(self):
        return f'<Department {self.name}>'

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    transaction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    dept_id = db.Column(db.String(36), db.ForeignKey('departments.dept_id'), nullable=False)
    amount = db.Column(db.Numeric(19, 4), nullable=False)
    purpose = db.Column(db.Text, nullable=False)
    status = db.Column(Enum(TransactionStatus), nullable=False, default=TransactionStatus.Pending)
    created_by_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    approved_by_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=True)
    invoice_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    previous_hash = db.Column(db.String(64), nullable=True)
    current_hash = db.Column(db.String(64), unique=True, nullable=False)
    
    def __repr__(self):
        return f'<Transaction {self.transaction_id}: {self.purpose}>'
