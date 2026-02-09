"""Pytest configuration and fixtures for backend tests"""

import os
import pytest
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool
from fastapi.testclient import TestClient
import jwt

from src.main import app
from src.db import get_session
from src.models import Task

# Test database setup (in-memory SQLite for fast testing)
@pytest.fixture(name="session")
def session_fixture():
    """Create in-memory test database session"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    from src.models import SQLModel
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create test client with mocked database session"""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="valid_jwt_token")
def valid_jwt_token_fixture():
    """Generate valid JWT token for testing"""
    secret = os.getenv("BETTER_AUTH_SECRET", "test-secret")
    payload = {
        "sub": "test-user-id",
        "exp": 9999999999,
        "iat": 1234567890,
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    return token


@pytest.fixture(name="invalid_jwt_token")
def invalid_jwt_token_fixture():
    """Generate invalid JWT token for testing"""
    return "invalid.jwt.token"


@pytest.fixture(name="expired_jwt_token")
def expired_jwt_token_fixture():
    """Generate expired JWT token for testing"""
    secret = os.getenv("BETTER_AUTH_SECRET", "test-secret")
    payload = {
        "sub": "test-user-id",
        "exp": 1,  # Expired (year 1970)
        "iat": 1234567890,
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    return token


@pytest.fixture(name="test_task")
def test_task_fixture(session: Session):
    """Create a test task in database"""
    task = Task(
        user_id="test-user-id",
        title="Test Task",
        description="This is a test task",
        completed=False,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
