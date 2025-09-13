#!/usr/bin/env python3
"""
Database initialization script for The Transparency Ledger
This script creates the database tables and sets up only the admin user.
"""

from app import app, db
from models import User, UserRole
from utils import hash_password

def init_database():
    """Initialize the database with tables and only the admin user."""
    with app.app_context():
        print("Creating database tables...")
        db.drop_all()  # Drop all tables (remove all data)
        db.create_all()  # Recreate tables

        # Create only the admin user
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

        print("Database initialization completed successfully!")

        # Print summary
        user_count = User.query.count()
        print(f"\nDatabase Summary:")
        print(f"- Users: {user_count}")
        print(f"\nDefault Login Credentials:")
        print(f"Admin: admin@transparency.com / admin123")

if __name__ == '__main__':
    init_database()