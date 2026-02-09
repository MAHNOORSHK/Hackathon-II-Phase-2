import asyncio
from sqlmodel import select
from src.db import get_session, engine
from src.models import Task
from sqlmodel import SQLModel

async def check_recent_tasks():
    print("Checking for recent tasks in the database...")
    
    # Create tables if they don't exist
    SQLModel.metadata.create_all(bind=engine)
    print("Connected to database successfully")
    
    # Try to get all tasks ordered by creation date
    try:
        with next(get_session()) as session:
            statement = select(Task).order_by(Task.created_at.desc())
            results = session.exec(statement)
            tasks = results.all()
            print(f"Total tasks in database: {len(tasks)}")
            
            print("\nRecent tasks:")
            for i, task in enumerate(tasks[:5]):  # Show last 5 tasks
                print(f"{i+1}. ID: {task.id}, Title: '{task.title}', User ID: '{task.user_id}', Completed: {task.completed}, Created: {task.created_at}")
                
    except Exception as e:
        print(f"Error querying tasks: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_recent_tasks())