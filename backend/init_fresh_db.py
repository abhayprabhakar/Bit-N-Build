"""
Simple database initialization script for Firebase integration
"""

from flask import Flask
from models import db, User, Department, Transaction, UserRole
from utils import hash_password

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///transparency_ledger.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def init_fresh_database():
    """Initialize a fresh database with Firebase support"""
    
    with app.app_context():
        # Drop all tables and recreate
        print("Dropping existing tables...")
        db.drop_all()
        
        print("Creating new tables with Firebase support...")
        db.create_all()
        
        print("Creating default admin user...")
        admin = User(
            name='System Administrator',
            email='admin@transparency.com',
            password_hash=hash_password('admin123'),
            role=UserRole.Admin,
            firebase_uid=None  # Traditional user, not Firebase
        )
        db.session.add(admin)
        
        # Create a test department
        print("Creating test department...")
        dept = Department(
            name='Finance Department',
            description='Handles financial operations and budget management',
            head_user_id=admin.user_id,
            allocated_budget=100000.00
        )
        db.session.add(dept)
        
        db.session.commit()
        
        print("✓ Database initialized successfully!")
        print("✓ Admin user created: admin@transparency.com / admin123")
        print("✓ Test department created")

if __name__ == "__main__":
    init_fresh_database()
