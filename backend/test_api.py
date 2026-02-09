import requests
import json

# Test the API endpoints directly
BASE_URL = "http://localhost:8000/api"

# Try to get tasks for a test user
test_user_id = "test-user-123"

headers = {
    "Content-Type": "application/json",
    # Using a fake token for testing purposes
    "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"  # This is a fake token with sub=test-user-123
}

try:
    # Try to get tasks
    response = requests.get(f"{BASE_URL}/{test_user_id}/tasks", headers=headers)
    print(f"GET /api/{test_user_id}/tasks - Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Try to create a test task
    task_data = {
        "title": "API Test Task",
        "description": "This is a test task created via direct API call",
        "user_id": test_user_id
    }
    
    response = requests.post(f"{BASE_URL}/{test_user_id}/tasks", headers=headers, json=task_data)
    print(f"\nPOST /api/{test_user_id}/tasks - Status: {response.status_code}")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"Error testing API: {str(e)}")