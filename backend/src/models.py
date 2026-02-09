from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    user_id: str
    completed: bool = False


class Task(TaskBase, table=True):
    __tablename__ = "task"

    id: int = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskCreate(TaskBase):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None


class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    completed: Optional[bool] = None


class TaskRead(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime