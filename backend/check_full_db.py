import asyncio
from sqlmodel import select
from src.db import get_session, engine
from src.models import Task
from sqlmodel import SQLModel
from datetime import datetime, timedelta

async def check_recent_entries():
    print("Checking recent entries in both user and task tables...")
    
    # Create tables if they don't exist
    SQLModel.metadata.create_all(bind=engine)
    print("Connected to database successfully")
    
    # Check recent users
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # Get recent users
            user_result = conn.execute(text("SELECT id, name, email, created_at FROM \"user\" ORDER BY created_at DESC LIMIT 5"))
            users = user_result.fetchall()
            print(f"\nRecent users ({len(users)} found):")
            for user in users:
                print(f"  ID: {user[0]}, Name: {user[1]}, Email: {user[2]}, Created: {user[3]}")
            
            # Get recent tasks
            task_result = conn.execute(text("SELECT id, title, user_id, created_at, completed FROM task ORDER BY created_at DESC LIMIT 10"))
            tasks = task_result.fetchall()
            print(f"\nRecent tasks ({len(tasks)} found):")
            for task in tasks:
                print(f"  ID: {task[0]}, Title: '{task[1][:50]}...', User: {task[2]}, Created: {task[3]}, Completed: {task[4]}")
            
            # Count total records
            user_count = conn.execute(text("SELECT COUNT(*) FROM \"user\"")).fetchone()[0]
            task_count = conn.execute(text("SELECT COUNT(*) FROM task")).fetchone()[0]
            print(f"\nTotal records - Users: {user_count}, Tasks: {task_count}")
            
    except Exception as e:
        print(f"Error querying database: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_recent_entries())