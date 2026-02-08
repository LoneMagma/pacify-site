#!/usr/bin/env python3
"""
Quick Admin User Creator for Railway
Upload this to your backend folder and run: railway run python create_admin.py
"""

import sys
import os

# Add backend directory to path if needed
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, create_admin_user

if __name__ == "__main__":
    print("🚀 Pacify Admin Creator")
    print("=" * 40)
    
    # Initialize database
    print("\n📊 Creating database tables...")
    init_db()
    
    # Create admin user with default credentials
    username = "LoneMagma"
    password = "LoneMagma_29"
    
    print(f"\n👤 Creating admin user: {username}")
    create_admin_user(username, password)
    
    print("\n✅ Setup complete!")
    print(f"\nYou can now login at:")
    print(f"  https://pacify.site/admin.html")
    print(f"\nCredentials:")
    print(f"  Username: {username}")
    print(f"  Password: {password}")
    print(f"\n🔐 IMPORTANT: Change your password after first login!")
