#!/usr/bin/env python3
"""
Database initialization script for The Transparency Ledger
This script creates the database tables and sets up initial data.
"""

from app import app, db
from models import User, Department, Transaction, UserRole, TransactionStatus
from utils import hash_password
import uuid

def init_database():
    """Initialize the database with tables and sample data."""
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        
        # Check if admin user already exists
        admin_user = User.query.filter_by(email='admin@transparency.com').first()
        if not admin_user:
            print("Creating default admin user...")
            admin_user = User(
                name='System Administrator',
                email='admin@transparency.com',
                password_hash=hash_password('admin123'),
                role=UserRole.Admin
            )
            db.session.add(admin_user)
            db.session.commit()
            print(f"Admin user created with ID: {admin_user.user_id}")
        else:
            print("Admin user already exists.")
        
        # Create sample department heads
        dept_head1 = User.query.filter_by(email='engineering@transparency.com').first()
        if not dept_head1:
            print("Creating sample department heads...")
            dept_head1 = User(
                name='John Smith',
                email='engineering@transparency.com',
                password_hash=hash_password('password123'),
                role=UserRole.DeptHead
            )
            db.session.add(dept_head1)
        
        dept_head2 = User.query.filter_by(email='finance@transparency.com').first()
        if not dept_head2:
            dept_head2 = User(
                name='Sarah Johnson',
                email='finance@transparency.com',
                password_hash=hash_password('password123'),
                role=UserRole.DeptHead
            )
            db.session.add(dept_head2)
        
        project_manager = User.query.filter_by(email='pm@transparency.com').first()
        if not project_manager:
            project_manager = User(
                name='Mike Davis',
                email='pm@transparency.com',
                password_hash=hash_password('password123'),
                role=UserRole.ProjectManager
            )
            db.session.add(project_manager)
            
        db.session.commit()
        
        # Create sample departments
        engineering_dept = Department.query.filter_by(name='Engineering Department').first()
        if not engineering_dept:
            print("Creating sample departments...")
            engineering_dept = Department(
                name='Engineering Department',
                description='Handles all engineering projects and development',
                parent_dept_id=None,  # Root department
                head_user_id=dept_head1.user_id,
                allocated_budget=1000000.00
            )
            db.session.add(engineering_dept)
            
            finance_dept = Department(
                name='Finance Department',
                description='Manages financial operations and budgets',
                parent_dept_id=None,  # Root department
                head_user_id=dept_head2.user_id,
                allocated_budget=500000.00
            )
            db.session.add(finance_dept)
            
            db.session.commit()
            
            # Create sub-departments
            software_dept = Department(
                name='Software Development',
                description='Software engineering and development team',
                parent_dept_id=engineering_dept.dept_id,
                head_user_id=project_manager.user_id,
                allocated_budget=600000.00
            )
            db.session.add(software_dept)
            
            hardware_dept = Department(
                name='Hardware Engineering',
                description='Hardware design and engineering team',
                parent_dept_id=engineering_dept.dept_id,
                head_user_id=project_manager.user_id,
                allocated_budget=400000.00
            )
            db.session.add(hardware_dept)
            
            db.session.commit()
            print("Sample departments created.")
        else:
            print("Sample departments already exist.")
        
        print("Database initialization completed successfully!")
        
        # Print summary
        user_count = User.query.count()
        dept_count = Department.query.count()
        tx_count = Transaction.query.count()
        
        print(f"\nDatabase Summary:")
        print(f"- Users: {user_count}")
        print(f"- Departments: {dept_count}")
        print(f"- Transactions: {tx_count}")
        
        print(f"\nDefault Login Credentials:")
        print(f"Admin: admin@transparency.com / admin123")
        print(f"Dept Head 1: engineering@transparency.com / password123")
        print(f"Dept Head 2: finance@transparency.com / password123")
        print(f"Project Manager: pm@transparency.com / password123")

if __name__ == '__main__':
    init_database()
