import asyncio
from sqlmodel import select
from src.db import get_session, engine
from src.models import Task
from sqlmodel import SQLModel
from datetime import datetime, timedelta

async def check_raw_data():
    print("Checking raw data from user and task tables...")
    
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # Get all users with all columns
            user_result = conn.execute(text("SELECT * FROM \"user\" ORDER BY createdAt DESC LIMIT 10"))
            users = user_result.fetchall()
            print(f"Total users found: {len(users)}")
            
            # Get column names for user table
            user_columns = [desc[0] for desc in user_result.cursor.description]
            print(f"User table columns: {user_columns}")
            
            for i, user in enumerate(users):
                print(f"\nUser {i+1}:")
                for j, col_name in enumerate(user_columns):
                    print(f"  {col_name}: {user[j]}")
            
            print("\n" + "="*50)
            
            # Get all tasks with all columns
            task_result = conn.execute(text("SELECT * FROM task ORDER BY created_at DESC LIMIT 10"))
            tasks = task_result.fetchall()
            print(f"\nTotal tasks found: {len(tasks)}")
            
            # Get column names for task table
            task_columns = [desc[0] for desc in task_result.cursor.description]
            print(f"Task table columns: {task_columns}")
            
            for i, task in enumerate(tasks):
                print(f"\nTask {i+1}:")
                for j, col_name in enumerate(task_columns):
                    print(f"  {col_name}: {task[j]}")
            
    except Exception as e:
        print(f"Error querying database: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_raw_data())