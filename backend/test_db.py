import asyncio
from sqlmodel import select
from src.db import get_session, engine
from src.models import Task
from sqlmodel import SQLModel

async def test_connection():
    print("Testing database connection...")
    
    # Create tables if they don't exist
    SQLModel.metadata.create_all(bind=engine)
    print("Tables created successfully")
    
    # Try to get all tasks
    try:
        with next(get_session()) as session:
            statement = select(Task)
            results = session.exec(statement)
            tasks = results.all()
            print(f"Number of tasks in database: {len(tasks)}")
            
            for task in tasks:
                print(f"Task ID: {task.id}, Title: {task.title}, User ID: {task.user_id}")
                
    except Exception as e:
        print(f"Error querying tasks: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_connection())