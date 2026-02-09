import asyncio
from sqlmodel import select
from src.db import get_session, engine
from src.models import Task
from sqlmodel import SQLModel

async def check_all_tables():
    print("Checking all tables in the database...")
    
    try:
        from sqlalchemy import inspect
        insp = inspect(engine)
        table_names = insp.get_table_names()
        print(f"Available tables: {table_names}")
        
        # Check if there's a user table
        if 'user' in table_names or 'users' in table_names:
            print("\nUser table exists. Let's check its contents...")
            from sqlalchemy import text
            with engine.connect() as conn:
                result = conn.execute(text("SELECT * FROM information_schema.columns WHERE table_name = 'user' OR table_name = 'users'"))
                columns = result.fetchall()
                print("User table columns:", [col[3] for col in columns])
                
                # Try to get user data
                if 'user' in table_names:
                    user_result = conn.execute(text("SELECT * FROM \"user\" LIMIT 5"))
                    users = user_result.fetchall()
                    print(f"Sample users: {users}")
                elif 'users' in table_names:
                    user_result = conn.execute(text("SELECT * FROM users LIMIT 5"))
                    users = user_result.fetchall()
                    print(f"Sample users: {users}")
        
        # Also check the task table structure
        if 'task' in table_names:
            from sqlalchemy import text
            with engine.connect() as conn:
                result = conn.execute(text("SELECT * FROM information_schema.columns WHERE table_name = 'task'"))
                columns = result.fetchall()
                print("\nTask table columns:", [col[3] for col in columns])
                
                # Check foreign key constraints
                result = conn.execute(text("""
                    SELECT 
                        tc.table_name, 
                        tc.constraint_name, 
                        tc.constraint_type,
                        kcu.column_name,
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name
                    FROM 
                        information_schema.table_constraints AS tc
                        JOIN information_schema.key_column_usage AS kcu
                          ON tc.constraint_name = kcu.constraint_name
                          AND tc.table_schema = kcu.table_schema
                        JOIN information_schema.constraint_column_usage AS ccu
                          ON ccu.constraint_name = tc.constraint_name
                          AND ccu.table_schema = tc.table_schema
                    WHERE tc.table_name = 'task' AND tc.constraint_type = 'FOREIGN KEY'
                """))
                fks = result.fetchall()
                print("\nForeign key constraints on task table:", fks)
                
    except Exception as e:
        print(f"Error checking tables: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_all_tables())