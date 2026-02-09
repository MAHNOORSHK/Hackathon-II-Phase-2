import asyncio
from sqlmodel import select
from src.db import get_session, engine
from src.models import Task
from sqlmodel import SQLModel
from datetime import datetime, timedelta

async def check_simple_query():
    print("Checking simple queries on user and task tables...")
    
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # Get all column names for user table
            user_columns = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'user' ORDER BY ordinal_position")).fetchall()
            print(f"User table columns: {[col[0] for col in user_columns]}")
            
            # Get all column names for task table
            task_columns = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'task' ORDER BY ordinal_position")).fetchall()
            print(f"Task table columns: {[col[0] for col in task_columns]}")
            
            # Simple count queries
            user_count = conn.execute(text("SELECT COUNT(*) FROM \"user\"")).fetchone()[0]
            task_count = conn.execute(text("SELECT COUNT(*) FROM task")).fetchone()[0]
            print(f"\nTotal records - Users: {user_count}, Tasks: {task_count}")
            
            # Get recent users with available columns
            user_result = conn.execute(text("SELECT id, email, \"name\", createdAt FROM \"user\" ORDER BY createdAt DESC LIMIT 5"))
            users = user_result.fetchall()
            print(f"\nRecent users ({len(users)} found):")
            for user in users:
                print(f"  ID: {user[0]}, Email: {user[1]}, Name: {user[2]}, Created: {user[3]}")
            
            # Get recent tasks
            task_result = conn.execute(text("SELECT id, title, user_id, created_at, completed FROM task ORDER BY created_at DESC LIMIT 10"))
            tasks = task_result.fetchall()
            print(f"\nRecent tasks ({len(tasks)} found):")
            for task in tasks:
                print(f"  ID: {task[0]}, Title: '{task[1][:30]}...', User: {task[2]}, Created: {task[3]}, Completed: {task[4]}")
            
    except Exception as e:
        print(f"Error querying database: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_simple_query())