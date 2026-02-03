"""
Database Models and Connection
SQLAlchemy setup for PostgreSQL
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime

# Database URL from environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/pacify_admin"
)

# Fix Railway's postgres:// to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Models ---

class Event(Base):
    """Analytics events table"""
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    page_path = Column(String(255))
    project_name = Column(String(100))
    referrer = Column(String(500))
    country = Column(String(100))
    city = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class AdminUser(Base):
    """Admin authentication table"""
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Database Dependency ---

def get_db():
    """Dependency for FastAPI routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Database Initialization ---

def init_db():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

def create_admin_user(username: str, password: str):
    """Helper to create initial admin user"""
    from auth import hash_password
    
    db = SessionLocal()
    
    # Check if user exists
    existing = db.query(AdminUser).filter(AdminUser.username == username).first()
    if existing:
        print(f"Admin user '{username}' already exists")
        db.close()
        return
    
    # Create new admin
    hashed = hash_password(password)
    admin = AdminUser(username=username, password_hash=hashed)
    db.add(admin)
    db.commit()
    print(f"Admin user '{username}' created successfully")
    db.close()

if __name__ == "__main__":
    # Initialize database when run directly
    init_db()
    
    # Create default admin (change this password!)
    import sys
    if len(sys.argv) > 2:
        create_admin_user(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python database.py <username> <password>")
        print("Example: python database.py admin SecurePassword123!")
