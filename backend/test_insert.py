import asyncio
from datetime import datetime
from src.db import get_session, engine
from src.models import Task, TaskCreate
from sqlmodel import SQLModel

async def test_insert_task():
    print("Testing inserting a new task...")
    
    # Create tables if they don't exist
    SQLModel.metadata.create_all(bind=engine)
    print("Tables verified")
    
    # Insert a test task
    try:
        with next(get_session()) as session:
            # Create a new task
            new_task = Task(
                title="Test Task from Script",
                description="This task was added via the test script",
                user_id="test-user-123",
                completed=False
            )
            
            session.add(new_task)
            session.commit()
            session.refresh(new_task)
            
            print(f"New task created with ID: {new_task.id}")
            print(f"Title: {new_task.title}")
            print(f"User ID: {new_task.user_id}")
            print(f"Created at: {new_task.created_at}")
            
            # Verify by querying it back
            from sqlmodel import select
            statement = select(Task).where(Task.id == new_task.id)
            result = session.exec(statement).first()
            if result:
                print(f"Verified: Task retrieved from DB with ID: {result.id}")
            
    except Exception as e:
        print(f"Error inserting/querying task: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_insert_task())