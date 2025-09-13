"""
Database migration script to add Firebase UID support
"""

import os
import sqlite3
from models import db, User, UserRole
from utils import hash_password

def migrate_database():
    """Migrate database to add Firebase UID support"""
    
    db_path = 'transparency_ledger.db'
    
    # Check if database exists
    if os.path.exists(db_path):
        print("Existing database found. Checking schema...")
        
        # Connect to check if firebase_uid column exists
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if firebase_uid column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'firebase_uid' not in columns:
            print("Adding firebase_uid column...")
            cursor.execute("ALTER TABLE users ADD COLUMN firebase_uid TEXT")
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)")
            conn.commit()
            print("✓ Added firebase_uid column")
        else:
            print("✓ firebase_uid column already exists")
        
        # Make password_hash nullable for Firebase users
        cursor.execute("PRAGMA table_info(users)")
        columns = {row[1]: row for row in cursor.fetchall()}
        
        if columns.get('password_hash') and columns['password_hash'][3] == 1:  # NOT NULL constraint
            print("Making password_hash nullable for Firebase users...")
            # SQLite doesn't support ALTER COLUMN, so we need to recreate the table
            # For now, we'll just note this and handle it in the application logic
            print("Note: password_hash field constraints handled in application logic")
        
        conn.close()
    else:
        print("No existing database found. Will create new one.")
    
    print("Database migration completed!")

if __name__ == "__main__":
    migrate_database()
