from fastapi import APIRouter, Depends, HTTPException, Query, Header
from typing import List, Optional
from sqlmodel import Session, select
from pydantic import BaseModel
import jwt
from datetime import datetime
import os
from ..models import Task, TaskCreate, TaskUpdate, TaskRead
from ..db import get_session


router = APIRouter(prefix="/api/{user_id}")

# Secret for JWT decoding
SECRET = os.getenv("BETTER_AUTH_SECRET", "")


class TokenData(BaseModel):
    sub: str


def verify_jwt_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def verify_user_owns_resource(path_user_id: str, token_user_id: str):
    """Verify that the user_id in the path matches the user_id in the token"""
    if path_user_id != token_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")


@router.get("/tasks", response_model=List[TaskRead])
def get_tasks(
    user_id: str,
    status: Optional[str] = Query(None, regex="^(active|completed)$"),
    sort: Optional[str] = Query(None, regex="^(created_at|updated_at)$"),
    session: Session = Depends(get_session),
    authorization: str = Header(..., alias="authorization")
):
    # Extract token from header format "Bearer <token>"
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization
    
    payload = verify_jwt_token(token)
    token_user_id = payload.get("sub")
    
    # Verify user owns the resource
    verify_user_owns_resource(user_id, token_user_id)
    
    # Build query
    query = select(Task).where(Task.user_id == user_id)
    
    # Apply status filter if provided
    if status == "active":
        query = query.where(Task.completed == False)
    elif status == "completed":
        query = query.where(Task.completed == True)
    
    # Apply sorting if provided
    if sort == "created_at":
        query = query.order_by(Task.created_at.desc())
    elif sort == "updated_at":
        query = query.order_by(Task.updated_at.desc())
    
    tasks = session.exec(query).all()
    return tasks


@router.post("/tasks", response_model=TaskRead, status_code=201)
def create_task(
    user_id: str,
    task: TaskCreate,
    session: Session = Depends(get_session),
    authorization: str = Header(..., alias="authorization")
):
    # Extract token from header format "Bearer <token>"
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization
    
    payload = verify_jwt_token(token)
    token_user_id = payload.get("sub")
    
    # Verify user owns the resource
    verify_user_owns_resource(user_id, token_user_id)
    
    # Ensure user_id in task matches the one in the path
    if task.user_id != user_id:
        raise HTTPException(status_code=400, detail="User ID mismatch")
    
    db_task = Task.from_orm(task) if hasattr(Task, 'from_orm') else Task(**task.dict())
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


@router.get("/tasks/{task_id}", response_model=TaskRead)
def get_task(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    authorization: str = Header(..., alias="authorization")
):
    # Extract token from header format "Bearer <token>"
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization
    
    payload = verify_jwt_token(token)
    token_user_id = payload.get("sub")
    
    # Verify user owns the resource
    verify_user_owns_resource(user_id, token_user_id)
    
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    
    return task


@router.put("/tasks/{task_id}", response_model=TaskRead)
def update_task(
    user_id: str,
    task_id: int,
    task_update: TaskUpdate,
    session: Session = Depends(get_session),
    authorization: str = Header(..., alias="authorization")
):
    # Extract token from header format "Bearer <token>"
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization
    
    payload = verify_jwt_token(token)
    token_user_id = payload.get("sub")
    
    # Verify user owns the resource
    verify_user_owns_resource(user_id, token_user_id)
    
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if db_task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
    
    # Update task fields
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    # Update the updated_at timestamp
    db_task.updated_at = datetime.utcnow()
    
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    authorization: str = Header(..., alias="authorization")
):
    # Extract token from header format "Bearer <token>"
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization
    
    payload = verify_jwt_token(token)
    token_user_id = payload.get("sub")
    
    # Verify user owns the resource
    verify_user_owns_resource(user_id, token_user_id)
    
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if db_task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")
    
    session.delete(db_task)
    session.commit()
    return


@router.patch("/tasks/{task_id}/complete", response_model=TaskRead)
def toggle_task_complete(
    user_id: str,
    task_id: int,
    session: Session = Depends(get_session),
    authorization: str = Header(..., alias="authorization")
):
    # Extract token from header format "Bearer <token>"
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization
    
    payload = verify_jwt_token(token)
    token_user_id = payload.get("sub")
    
    # Verify user owns the resource
    verify_user_owns_resource(user_id, token_user_id)
    
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if db_task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
    
    # Toggle the completed status
    db_task.completed = not db_task.completed
    db_task.updated_at = datetime.utcnow()
    
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task