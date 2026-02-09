import os
from dotenv import load_dotenv
import psycopg2
from urllib.parse import urlparse

# Load environment variables
load_dotenv()

# Get the database URL
db_url = os.getenv('NEON_DB_URL')
print(f"NEON_DB_URL: {db_url}")

if db_url:
    print("Attempting to connect to database...")
    
    # Parse the database URL
    parsed = urlparse(db_url)
    
    try:
        # Connect to the database
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port,
            database=parsed.path[1:],  # Remove leading '/'
            user=parsed.username,
            password=parsed.password,
            sslmode='require'
        )
        
        cur = conn.cursor()
        
        # Check if tables exist
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
        tables = cur.fetchall()
        print(f"Tables in database: {[table[0] for table in tables]}")
        
        # Check all tables and their row counts
        for table_name in [table[0] for table in tables]:
            try:
                cur.execute(f"SELECT COUNT(*) FROM \"{table_name}\";")
                count = cur.fetchone()[0]
                print(f"Table '{table_name}' has {count} rows")
                
                # If it's user or task table and has data, show some sample data
                if table_name in ['user', 'task'] and count > 0:
                    if table_name == 'user':
                        cur.execute("SELECT id, email, createdat FROM \"user\" ORDER BY createdat DESC LIMIT 5;")
                        users = cur.fetchall()
                        print(f"  Sample users:")
                        for user in users:
                            print(f"    ID: {user[0]}, Email: {user[1]}, Created: {user[2]}")
                    
                    elif table_name == 'task':
                        cur.execute("SELECT id, title, user_id, created_at FROM task ORDER BY created_at DESC LIMIT 5;")
                        tasks = cur.fetchall()
                        print(f"  Sample tasks:")
                        for task in tasks:
                            print(f"    ID: {task[0]}, Title: {task[1][:30]}..., User: {task[2]}, Created: {task[3]}")
                            
            except Exception as e:
                print(f"  Error querying table {table_name}: {str(e)}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error connecting to database: {str(e)}")
        import traceback
        traceback.print_exc()
else:
    print("NEON_DB_URL environment variable not found")