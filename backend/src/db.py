from sqlmodel import create_engine, SQLModel, Session
import os
from dotenv import load_dotenv

load_dotenv()

# Use Neon PostgreSQL database
database_url = os.getenv("NEON_DB_URL", "sqlite:///./todo.db")

# Create engine with the database URL
engine = create_engine(database_url, echo=False, pool_pre_ping=True)

def create_db_and_tables():
    """Create database tables from SQLModel definitions"""
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session