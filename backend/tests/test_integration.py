"""Integration tests for multi-user isolation and complete workflows"""

import pytest
import os
from fastapi.testclient import TestClient


def test_multi_user_isolation(client: TestClient, valid_jwt_token: str):
    """Test that User A cannot see User B's tasks (critical isolation test)"""
    # User A creates a task
    response = client.post(
        "/api/test-user-a/tasks",
        json={"title": "User A Task", "description": "Only for User A"},
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 201
    task_id = response.json()["id"]
    
    # User B tries to access User A's task - should get 403
    response = client.get(
        f"/api/test-user-b/tasks/{task_id}",
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 403
    assert "user_id mismatch" in response.json()["detail"]


def test_jwt_validation_missing_token(client: TestClient):
    """Test that missing JWT returns 401 Unauthorized"""
    response = client.get("/api/test-user/tasks")
    assert response.status_code == 403  # HTTPBearer returns 403 for missing credentials


def test_jwt_validation_invalid_token(client: TestClient, invalid_jwt_token: str):
    """Test that invalid JWT returns 401 Unauthorized"""
    response = client.get(
        "/api/test-user/tasks",
        headers={"Authorization": f"Bearer {invalid_jwt_token}"}
    )
    assert response.status_code == 401
    assert "Invalid token" in response.json()["detail"]


def test_create_and_list_tasks(client: TestClient, valid_jwt_token: str):
    """Test complete workflow: create multiple tasks and list with filters"""
    user_id = "test-user-id"
    
    # Create 3 tasks
    for i in range(3):
        response = client.post(
            f"/api/{user_id}/tasks",
            json={"title": f"Task {i+1}", "description": f"Description {i+1}"},
            headers={"Authorization": f"Bearer {valid_jwt_token}"}
        )
        assert response.status_code == 201
    
    # List all tasks
    response = client.get(
        f"/api/{user_id}/tasks",
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 3
    
    # Mark one as completed
    task_id = tasks[0]["id"]
    response = client.patch(
        f"/api/{user_id}/tasks/{task_id}/complete",
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 200
    assert response.json()["completed"] == True
    
    # Filter by pending
    response = client.get(
        f"/api/{user_id}/tasks?status=pending",
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 2
    
    # Filter by completed
    response = client.get(
        f"/api/{user_id}/tasks?status=completed",
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_update_task(client: TestClient, valid_jwt_token: str):
    """Test updating task title and description"""
    user_id = "test-user-id"
    
    # Create task
    response = client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Original Title", "description": "Original Desc"},
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 201
    task_id = response.json()["id"]
    
    # Update title
    response = client.put(
        f"/api/{user_id}/tasks/{task_id}",
        json={"title": "Updated Title"},
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"
    assert response.json()["description"] == "Original Desc"


def test_delete_task(client: TestClient, valid_jwt_token: str):
    """Test deleting a task"""
    user_id = "test-user-id"
    
    # Create task
    response = client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Task to Delete"},
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 201
    task_id = response.json()["id"]
    
    # Delete task
    response = client.delete(
        f"/api/{user_id}/tasks/{task_id}",
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 204
    
    # Verify deletion
    response = client.get(
        f"/api/{user_id}/tasks/{task_id}",
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 404


def test_validation_title_too_long(client: TestClient, valid_jwt_token: str):
    """Test that title longer than 200 chars returns 422"""
    user_id = "test-user-id"
    long_title = "x" * 201
    
    response = client.post(
        f"/api/{user_id}/tasks",
        json={"title": long_title},
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 422


def test_validation_description_too_long(client: TestClient, valid_jwt_token: str):
    """Test that description longer than 1000 chars returns 422"""
    user_id = "test-user-id"
    long_description = "x" * 1001
    
    response = client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Valid Title", "description": long_description},
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 422


def test_invalid_status_filter(client: TestClient, valid_jwt_token: str):
    """Test that invalid status filter returns 422"""
    user_id = "test-user-id"
    
    response = client.get(
        f"/api/{user_id}/tasks?status=invalid",
        headers={"Authorization": f"Bearer {valid_jwt_token}"}
    )
    assert response.status_code == 422


def test_health_check(client: TestClient):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
