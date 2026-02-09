# Implementation Plan: FastAPI Backend for Multi-User Tasks API

**Branch**: `003-backend-api-tasks` | **Date**: 2026-02-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-backend-api-tasks/spec.md`

## Summary

Build a secure, stateless FastAPI backend that integrates seamlessly with the Next.js frontend using Better Auth JWT tokens. The backend enforces strict user ownership via JWT validation, manages task CRUD operations against Neon Serverless PostgreSQL, and is fully Dockerized for local development and Hugging Face Spaces deployment. All 6 endpoints (GET list, POST create, GET detail, PUT update, PATCH complete, DELETE) require JWT Bearer token validation and user_id path matching, with comprehensive error handling and logging.

---

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.104+, SQLModel 0.0.14+, PyJWT 2.8+, SQLAlchemy 2.0+, psycopg2-binary, python-dotenv, uvicorn
**Storage**: Neon Serverless PostgreSQL (managed, SSL required)
**Testing**: pytest, pytest-asyncio (for integration tests)
**Target Platform**: Linux server (Docker container on local machine and Hugging Face Spaces)
**Project Type**: Web backend (stateless REST API)
**Performance Goals**:
  - GET /tasks: <100ms for typical user (<1000 tasks)
  - POST/PUT/DELETE/PATCH: <50ms
  - JWT validation: <5ms per request
  - Support 100 concurrent users simultaneously

**Constraints**:
  - Stateless: no session storage or global state
  - User_id in path must match JWT sub claim (403 if mismatch)
  - All endpoints require JWT Bearer token (401 if missing/invalid)
  - No SQL injection risk (SQLModel ORM prevents injection)
  - CORS enabled for http://localhost:3000 and http://localhost

**Scale/Scope**:
  - Multi-user SaaS (100+ concurrent users expected)
  - Single backend instance with connection pooling
  - ~10-20 tasks per user average
  - No pagination required (MVP assumes <1000 tasks per user)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Justification |
|-----------|--------|---------------|
| **I. Agent-Driven Development** | ✅ PASS | Backend spec completed by spec-writer; plan via architect; implementation via backend-engineer + integration-tester |
| **II. Monorepo with Clear Separation** | ✅ PASS | `backend/src/` isolated, `frontend/` separate; shared config at root; independently deployable |
| **III. Security-First Auth** | ✅ PASS | JWT validation on every endpoint; user_id path enforcement; shared BETTER_AUTH_SECRET; no cross-user leakage |
| **IV. Frontend Excellence** | ✅ PASS | Not directly applicable to backend; frontend handles UX premium standard; backend provides secure API |
| **V. Test-First Integration** | ⚠️ CONDITIONAL | Spec includes acceptance scenarios; implementation will include pytest fixtures; integration-tester validates isolation |
| **VI. API Contracts Precede** | ✅ PASS | Spec defines all endpoints, request/response shapes, error codes; contracts/ directory will document OpenAPI |
| **VII. Backend Simplicity** | ✅ PASS | Thin FastAPI routers; SQLModel handles schema/validation; explicit JWT dependency; minimal middleware |

**Gate Result**: ✅ PASS — All principles satisfied; no violations requiring justification.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-backend-api-tasks/
├── plan.md                      # This file
├── spec.md                       # Feature requirements (completed)
├── research.md                   # Phase 0 output (to be created)
├── data-model.md                 # Phase 1 output (to be created)
├── quickstart.md                 # Phase 1 output (to be created)
├── contracts/                    # Phase 1 output (to be created)
│   ├── openapi.json             # OpenAPI 3.1 schema
│   ├── tasks-endpoints.md        # Endpoint documentation
│   └── errors.md                 # Error taxonomy
└── checklists/
    └── requirements.md           # Pre-existing requirements checklist
```

### Source Code (repository backend/)

```text
backend/
├── src/
│   ├── __init__.py              # Package init
│   ├── main.py                  # FastAPI app, routes registration, startup/shutdown
│   ├── db.py                    # Database connection, SQLModel setup, engine/session
│   ├── models.py                # SQLModel Task model, Pydantic TaskCreate/Update/Response
│   ├── dependencies.py          # JWT get_current_user, get_db dependencies
│   └── routes/
│       ├── __init__.py
│       └── tasks.py             # All 6 task endpoints (GET list, POST, GET detail, PUT, DELETE, PATCH)
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # pytest fixtures (test DB, test client, JWT tokens)
│   ├── test_auth.py             # JWT validation, ownership enforcement tests
│   ├── test_tasks_crud.py        # CRUD operation tests
│   └── test_integration.py       # End-to-end multi-user isolation tests
├── docs/
│   ├── ARCHITECTURE.md           # High-level design explanation
│   └── DEPLOYMENT.md             # Docker, HF Spaces deployment guide
├── logs/                         # Runtime logs (gitignored)
├── venv/                         # Virtual environment (gitignored)
├── .env                          # Environment variables (gitignored; template: .env.example)
├── .env.example                  # Template with placeholders
├── .gitignore                    # Python, venv, .env, logs
├── requirements.txt              # pip dependencies
├── Dockerfile                    # Multi-stage build for local dev and HF Spaces
├── docker-compose.yml            # Local dev with volume mounts, env_file
└── README.md                     # Setup, run, deploy instructions
```

**Structure Decision**:
Backend is organized as a Python package under `src/` for clarity and testability. Dependencies are explicit and separated into `dependencies.py`. Routes are modularized by resource (`routes/tasks.py`). Tests follow a standard pytest structure with integration tests validating multi-user isolation. Docker supports both local development (port 8000, hot reload) and HF Spaces deployment (port 7860, read-only).

---

## Complexity Tracking

No Constitution violations detected; no complexity justifications required.

---

# 1. Overall Backend Architecture Overview

## High-Level System Diagram

```
┌─────────────────────┐
│   Next.js Frontend  │
│  (Better Auth)      │
└──────────┬──────────┘
           │
           │ 1. User sign in/up → JWT generated (Better Auth)
           │ 2. Bearer <JWT> in Authorization header
           │
           ▼
    ┌──────────────────────────────────────────┐
    │   FastAPI Backend (Python)               │
    │   Host: 0.0.0.0:8000 (or :7860 on HF)   │
    └──────────┬───────────────────────────────┘
               │
               │ 3. Extract user_id from JWT["sub"]
               │ 4. Verify path {user_id} == JWT["sub"]
               │    └─ 403 Forbidden if mismatch
               │
               ▼
    ┌──────────────────────────────────────────┐
    │  JWT Dependency (get_current_user)       │
    │  - Decode token with BETTER_AUTH_SECRET  │
    │  - Extract sub (user_id)                 │
    │  - Return user_id for ownership checks   │
    │  - Raise 401 if missing/invalid/expired  │
    └──────────┬───────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │  Route Handler                           │
    │  - Ownership check: path {user_id} == JWT user_id
    │  - Business logic (filter by user_id)    │
    │  - SQLModel ORM query with parameterized │
    └──────────┬───────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │  SQLModel ORM + SQLAlchemy               │
    │  - Task model with Pydantic validation   │
    │  - Parameterized queries (SQL injection  │
    │    prevention)                           │
    │  - Connection pooling via Engine         │
    └──────────┬───────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │  Neon Serverless PostgreSQL              │
    │  SSL: sslmode=require, channel_binding   │
    │  Tables: tasks (with user_id, completed │
    │  indexes for performance)                │
    └──────────────────────────────────────────┘
               │
               │ 5. Database response
               │
               ▼
    ┌──────────────────────────────────────────┐
    │  HTTP Response                           │
    │  - TaskResponse (Pydantic model)         │
    │  - 200 OK | 201 Created | 204 No Content│
    │  - 400/401/403/404/422/500 on error     │
    └──────────┬───────────────────────────────┘
               │
               ▼
    ┌─────────────────────┐
    │   Frontend (React)  │
    │   Render/handle     │
    └─────────────────────┘
```

## Stateless Auth Flow Explanation

1. **Frontend Sign-In/Sign-Up** (Better Auth manages this):
   - User enters credentials → Better Auth validates → JWT generated
   - JWT contains `sub` (user_id), `exp`, `iat`, other claims
   - JWT signed with BETTER_AUTH_SECRET (shared between frontend and backend)

2. **Frontend Makes API Request**:
   - Includes `Authorization: Bearer <JWT>` header
   - Calls `http://localhost:8000/api/{user_id}/tasks` with {user_id} from JWT
   - No session cookies; every request is independent

3. **Backend Validates Token (Stateless)**:
   - Extract JWT from `Authorization: Bearer` header
   - Decode using PyJWT with BETTER_AUTH_SECRET (no database lookup needed)
   - Extract `sub` claim → user_id
   - Verify path {user_id} matches JWT user_id
   - Token expiry checked; invalid signature rejected
   - All validation is cryptographic and immediate (no state required)

4. **Business Logic**:
   - Query database with `WHERE user_id = <extracted_user_id>` (enforced in code)
   - No data leakage: user can only access own tasks
   - Every endpoint filters by user_id from JWT (defense in depth)

5. **Response**:
   - Return task data as JSON (Pydantic model)
   - Frontend decodes and renders

**Key Benefit**: Stateless design allows horizontal scaling. Each backend instance independently validates JWT; no shared session store needed.

## Integration with Frontend

**How Calls Work**:
- Frontend obtains JWT from Better Auth SDK after successful authentication
- For each API call, frontend includes `Authorization: Bearer <token>` header
- Backend extracts and validates token in <5ms
- Ownership enforced: frontend must provide matching path user_id and JWT user_id (backend rejects 403 if mismatch)
- Responses include task IDs, timestamps, task data in JSON

**Shared Secret Importance**:
- `BETTER_AUTH_SECRET` must be identical on frontend and backend
- If secrets diverge, JWT validation fails (403 or 401)
- Secret is environment-managed (`.env` on backend, `.env.local` on frontend)
- No secret should appear in code repositories
- For HF Spaces, secret is injected as a secret at runtime

**Error Handling Contract**:
- 401 Unauthorized: Missing, malformed, expired, or invalid JWT
- 403 Forbidden: JWT valid but user_id path mismatch
- 404 Not Found: Task doesn't exist for this user
- 422 Unprocessable Entity: Validation error (title too long, etc.)
- 500 Internal Server Error: Database or unexpected failure

---

# 2. Development Phases (8 phases)

## Phase 1: Project Setup & Dependencies

**Duration**: Foundation layer; 2–3 hours total
**Description**: Initialize the backend project structure, set up virtual environment, and install all required Python dependencies. This phase creates the scaffolding for all subsequent development.
**Key Deliverables**:
- `requirements.txt` with pinned versions
- Virtual environment (venv) created
- Directory structure established (`src/`, `tests/`, `docs/`, `logs/`)
- Git ignored configured (.gitignore)

---

## Phase 2: Environment Configuration & Database Connection

**Duration**: Configuration and connectivity; 1–2 hours total
**Description**: Create environment variable files (.env.example, .env), establish connection to Neon PostgreSQL, and implement database engine initialization with connection pooling. Verify SSL/TLS connectivity to remote database.
**Key Deliverables**:
- `.env.example` template with placeholders
- `src/db.py` with SQLAlchemy engine, session factory, and startup/shutdown hooks
- Database connectivity test (logs successful connection)
- Connection pooling configured for concurrent requests

---

## Phase 3: Data Models & Schema Initialization

**Duration**: ORM setup; 1–2 hours total
**Description**: Define SQLModel Task entity with all fields (id, user_id, title, description, completed, created_at, updated_at), implement Pydantic models for request/response bodies (TaskCreate, TaskUpdate, TaskResponse), and set up automatic schema creation on startup.
**Key Deliverables**:
- `src/models.py` with SQLModel Task and Pydantic models
- Validation rules (title 1–200 chars, description max 1000 chars, etc.)
- `created_at` and `updated_at` timestamps with defaults
- Schema indexes on user_id and completed columns
- SQLModel.metadata.create_all() on application startup

---

## Phase 4: JWT Authentication Dependency

**Duration**: Security layer; 1–2 hours total
**Description**: Implement JWT token validation using PyJWT, extract user_id from token sub claim, verify token expiry, and create a FastAPI Dependency for injection. Return 401 for invalid/missing/expired tokens and 403 for user_id path mismatches.
**Key Deliverables**:
- `src/dependencies.py` with `get_current_user()` dependency
- PyJWT decode with BETTER_AUTH_SECRET
- User_id extraction from JWT["sub"]
- HTTPException raising (401 for auth failures)
- Ownership validation integrated into route handlers

---

## Phase 5: API Routes Implementation & Logic

**Duration**: Business logic; 2–3 hours total
**Description**: Implement all 6 API endpoints with CRUD operations, query parameter handling (status, sort), request body validation, and ownership enforcement. Return appropriate status codes and task data.
**Key Deliverables**:
- `src/routes/tasks.py` with 6 endpoints
- GET /api/{user_id}/tasks with filtering and sorting
- POST /api/{user_id}/tasks with task creation
- GET /api/{user_id}/tasks/{task_id} with detail retrieval
- PUT /api/{user_id}/tasks/{task_id} with task updates
- DELETE /api/{user_id}/tasks/{task_id} with task deletion
- PATCH /api/{user_id}/tasks/{task_id}/complete with completion toggle

---

## Phase 6: Error Handling, Validation & Logging

**Duration**: Robustness; 1–2 hours total
**Description**: Implement comprehensive error handling with HTTPException for all error codes (400, 401, 403, 404, 422, 500), add validation error messages, and implement basic logging for errors and auth failures.
**Key Deliverables**:
- Custom error response models
- Validation error messages in 422 responses
- Logging for invalid JWT attempts, database errors, not found scenarios
- 400, 401, 403, 404, 422, 500 error handlers
- Graceful failure modes with user-friendly error messages

---

## Phase 7: Docker Configuration for Local Dev

**Duration**: Containerization; 1–2 hours total
**Description**: Create Dockerfile with multi-stage build for local development, docker-compose.yml with volume mounts for hot reload, environment variables via env_file, and non-root user for security. Backend runs on 0.0.0.0:8000 locally.
**Key Deliverables**:
- `Dockerfile` with Python 3.11 slim base, pip install, uvicorn CMD
- `docker-compose.yml` with volume mounts, env_file, port mapping (8000)
- Non-root user for container execution
- Hot reload enabled (volume mount src/)
- Health check endpoint or container readiness probe

---

## Phase 8: Hugging Face Spaces Deployment Preparation

**Duration**: Deployment readiness; 1 hour total
**Description**: Configure Dockerfile for HF Spaces runtime (port 7860), ensure secrets handling for NEON_DB_URL and BETTER_AUTH_SECRET, and document deployment steps. Build is read-only; no hot reload on HF Spaces.
**Key Deliverables**:
- Dockerfile CMD adapted for port 7860 (HF Spaces requirement)
- Secrets injection documentation (HF Spaces UI)
- Deployment guide in docs/
- Health check endpoint (/health or /api/health)
- README with deployment instructions

---

# 3. Detailed Task List (45 tasks)

## Phase 1 Tasks: Project Setup & Dependencies

### T01: Create Backend Directory Structure
**File(s)**: backend/src/, backend/tests/, backend/docs/, backend/logs/, backend/.gitignore
**Steps**:
- Create directories: src/, tests/, docs/, logs/ inside backend/
- Create `__init__.py` files in src/ and tests/
- Create `.gitignore` with entries: `venv/`, `.env`, `*.pyc`, `__pycache__/`, `.pytest_cache/`, `logs/`, `*.log`
- Verify directory structure matches project standards

**Dependencies**: None (initial task)
**Complexity**: Easy
**Estimated Time**: 5 min
**Frontend Integration**: None

---

### T02: Create Python Virtual Environment
**File(s)**: backend/venv/
**Steps**:
- Navigate to backend/ directory
- Run `python3.11 -m venv venv` (or use system Python if 3.11+)
- Activate venv: `source venv/bin/activate` (or `.venv\Scripts\activate` on Windows)
- Upgrade pip: `pip install --upgrade pip setuptools wheel`
- Verify Python version: `python --version` (ensure 3.11+)

**Dependencies**: None
**Complexity**: Easy
**Estimated Time**: 3 min
**Frontend Integration**: None

---

### T03: Create requirements.txt with Core Dependencies
**File(s)**: backend/requirements.txt
**Steps**:
- Create `requirements.txt` with exact pinned versions:
  ```
  fastapi==0.104.1
  uvicorn[standard]==0.24.0
  sqlmodel==0.0.14
  sqlalchemy==2.0.23
  psycopg2-binary==2.9.9
  pyjwt==2.8.1
  python-dotenv==1.0.0
  pydantic==2.5.0
  ```
- Rationale: FastAPI (web framework), uvicorn (ASGI server), SQLModel (ORM), psycopg2 (PostgreSQL driver), PyJWT (token validation), python-dotenv (env vars)
- Run `pip install -r requirements.txt` to verify installation
- No conflicts should arise

**Dependencies**: T02
**Complexity**: Easy
**Estimated Time**: 5 min
**Frontend Integration**: None

---

### T04: Create .env.example and .env Template
**File(s)**: backend/.env.example, backend/.env
**Steps**:
- Create `.env.example` with placeholders (no secrets):
  ```
  BETTER_AUTH_SECRET=<your-shared-secret-from-better-auth>
  NEON_DB_URL=<your-neon-database-url>
  BETTER_AUTH_URL=http://localhost:3000/
  DEBUG=False
  LOG_LEVEL=INFO
  ```
- Create `.env` by copying `.env.example` and filling in actual values:
  - BETTER_AUTH_SECRET=m3cSkzyIycR8U3c7nAbPgNTe6HyQVnRR
  - NEON_DB_URL=postgresql://neondb_owner:npg_ukfdnO1U6siv@ep-bitter-mountain-a7c5kvdr-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  - BETTER_AUTH_URL=http://localhost:3000/
- Verify `.env` is in `.gitignore`

**Dependencies**: T01
**Complexity**: Easy
**Estimated Time**: 5 min
**Frontend Integration**: CRITICAL: Shared BETTER_AUTH_SECRET must match frontend's .env.local

---

### T05: Initialize FastAPI Application
**File(s)**: backend/src/main.py
**Steps**:
- Create `src/main.py` with FastAPI instance and CORS configuration:
  ```python
  from fastapi import FastAPI
  from fastapi.middleware.cors import CORSMiddleware
  import os

  app = FastAPI(title="Hackathon Todo Backend", version="1.0.0")

  # CORS for frontend
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:3000", "http://localhost"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )

  @app.get("/health")
  def health_check():
      return {"status": "ok"}

  if __name__ == "__main__":
      import uvicorn
      uvicorn.run(app, host="0.0.0.0", port=8000)
  ```
- Verify app starts: `python -m uvicorn src.main:app --reload`
- Test health check: curl http://localhost:8000/health

**Dependencies**: T03, T04
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: CORS origins must include frontend's development URL

---

### T06: Create README with Setup Instructions
**File(s)**: backend/README.md
**Steps**:
- Write README with sections: Project Overview, Prerequisites, Setup, Running Locally, API Documentation, Deployment
- Include instructions: venv activation, pip install, .env setup, running app
- Include example curl commands for API endpoints
- Include troubleshooting section (common errors)

**Dependencies**: T01–T05
**Complexity**: Easy
**Estimated Time**: 15 min
**Frontend Integration**: Reference frontend auth flow and shared secret

---

## Phase 2 Tasks: Environment Configuration & Database Connection

### T07: Implement Database Connection Module
**File(s)**: backend/src/db.py
**Steps**:
- Import SQLAlchemy and SQLModel
- Create engine with NEON_DB_URL from environment:
  ```python
  from sqlalchemy import create_engine
  from sqlmodel import Session, SQLModel

  DATABASE_URL = os.getenv("NEON_DB_URL")
  engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

  def create_db_and_tables():
      SQLModel.metadata.create_all(engine)

  def get_session():
      with Session(engine) as session:
          yield session
  ```
- SSL is handled by psycopg2-binary automatically via sslmode=require in URL
- Connection pooling configured via SQLAlchemy defaults (pool_size=5)

**Dependencies**: T03, T04
**Complexity**: Medium
**Estimated Time**: 15 min
**Frontend Integration**: None (backend-only)

---

### T08: Test Database Connectivity
**File(s)**: backend/tests/test_db_connection.py (or manual test)
**Steps**:
- Create simple script to test connection:
  ```python
  from src.db import engine
  with engine.connect() as conn:
      result = conn.execute("SELECT 1")
      print("Database connected:", result.fetchone())
  ```
- Run script and verify "Database connected" message
- Check for SSL/TLS errors (should not occur with sslmode=require)
- Log connection details (without password) for debugging

**Dependencies**: T07
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: None

---

### T09: Add Startup/Shutdown Hooks to FastAPI App
**File(s)**: backend/src/main.py (update from T05)
**Steps**:
- Add lifespan context manager to FastAPI:
  ```python
  from contextlib import asynccontextmanager
  from src.db import create_db_and_tables

  @asynccontextmanager
  async def lifespan(app: FastAPI):
      # Startup
      create_db_and_tables()
      yield
      # Shutdown (cleanup if needed)

  app = FastAPI(lifespan=lifespan)
  ```
- Verify app starts and tables are created automatically
- Check logs for successful schema creation

**Dependencies**: T07, T05
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: None

---

## Phase 3 Tasks: Data Models & Schema Initialization

### T10: Define SQLModel Task Entity
**File(s)**: backend/src/models.py
**Steps**:
- Create SQLModel Task with all fields:
  ```python
  from sqlmodel import SQLModel, Field
  from datetime import datetime

  class Task(SQLModel, table=True):
      id: int | None = Field(default=None, primary_key=True)
      user_id: str = Field(index=True)  # Foreign key (string UUID from Better Auth)
      title: str = Field(min_length=1, max_length=200)
      description: str | None = Field(default=None, max_length=1000)
      completed: bool = Field(default=False, index=True)
      created_at: datetime = Field(default_factory=datetime.utcnow)
      updated_at: datetime = Field(default_factory=datetime.utcnow)
  ```
- Indexes on user_id and completed for query performance
- Timestamps auto-populated on creation

**Dependencies**: T07
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: Task schema matches frontend expectations (id, title, description, completed, created_at, updated_at)

---

### T11: Create Pydantic Request/Response Models
**File(s)**: backend/src/models.py (extend from T10)
**Steps**:
- Add TaskCreate model:
  ```python
  class TaskCreate(BaseModel):
      title: str = Field(min_length=1, max_length=200)
      description: str | None = Field(default=None, max_length=1000)
  ```
- Add TaskUpdate model:
  ```python
  class TaskUpdate(BaseModel):
      title: str | None = Field(None, min_length=1, max_length=200)
      description: str | None = Field(None, max_length=1000)
  ```
- Add TaskResponse model (for JSON serialization):
  ```python
  class TaskResponse(Task):
      pass  # Inherits from Task SQLModel; FastAPI auto-converts
  ```
- Validation automatically enforced by Pydantic

**Dependencies**: T10
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: TaskResponse JSON matches frontend API expectations

---

### T12: Implement Schema Creation with Indexes
**File(s)**: backend/src/db.py (extend from T07)
**Steps**:
- Ensure SQLModel.metadata.create_all(engine) is called on startup
- Verify indexes are created: user_id (for filtering by user), completed (for status filtering)
- SQLModel/SQLAlchemy automatically creates indexes from Field(index=True)
- Test by checking database schema (psql or GUI tool)

**Dependencies**: T07, T10
**Complexity**: Easy
**Estimated Time**: 5 min
**Frontend Integration**: None

---

## Phase 4 Tasks: JWT Authentication Dependency

### T13: Implement JWT Validation Function
**File(s)**: backend/src/dependencies.py
**Steps**:
- Create `get_current_user()` dependency:
  ```python
  from fastapi import Depends, HTTPException, status
  from fastapi.security import HTTPBearer, HTTPAuthCredentials
  import jwt
  import os

  security = HTTPBearer()

  async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> str:
      token = credentials.credentials
      try:
          payload = jwt.decode(token, os.getenv("BETTER_AUTH_SECRET"), algorithms=["HS256"])
          user_id: str = payload.get("sub")
          if user_id is None:
              raise HTTPException(status_code=401, detail="Invalid token: no sub claim")
          return user_id
      except jwt.ExpiredSignatureError:
          raise HTTPException(status_code=401, detail="Token expired")
      except jwt.InvalidTokenError:
          raise HTTPException(status_code=401, detail="Invalid token")
  ```
- Extracts user_id from JWT["sub"]
- Returns 401 for any auth failure

**Dependencies**: T03, T04
**Complexity**: Medium
**Estimated Time**: 15 min
**Frontend Integration**: JWT["sub"] must match frontend's user_id from Better Auth

---

### T14: Add Ownership Validation Middleware/Decorator
**File(s)**: backend/src/dependencies.py (extend from T13)
**Steps**:
- Create helper to validate path user_id matches JWT user_id:
  ```python
  def validate_ownership(path_user_id: str, current_user_id: str):
      if path_user_id != current_user_id:
          raise HTTPException(status_code=403, detail="Access denied: user_id mismatch")
  ```
- Call this in route handlers before any database query
- Return 403 Forbidden if mismatch
- Prevents users from accessing other users' tasks

**Dependencies**: T13
**Complexity**: Easy
**Estimated Time**: 5 min
**Frontend Integration**: Frontend must always provide matching path user_id and JWT user_id

---

### T15: Test JWT Validation with Mock Tokens
**File(s)**: backend/tests/test_auth.py
**Steps**:
- Create test with valid JWT (signed with BETTER_AUTH_SECRET)
- Create test with expired JWT
- Create test with invalid signature
- Create test with missing sub claim
- Verify correct status codes (401, 403)
- Ensure logging occurs for invalid attempts

**Dependencies**: T13, T14
**Complexity**: Medium
**Estimated Time**: 20 min
**Frontend Integration**: Tests validate contract with frontend JWT generation

---

## Phase 5 Tasks: API Routes Implementation & Logic

### T16: Implement GET /api/{user_id}/tasks Endpoint
**File(s)**: backend/src/routes/tasks.py
**Steps**:
- Create route handler:
  ```python
  @router.get("/api/{user_id}/tasks")
  async def list_tasks(
      user_id: str,
      current_user: str = Depends(get_current_user),
      session: Session = Depends(get_session),
      status: str = Query("all", regex="^(all|pending|completed)$"),
      sort: str = Query("created", regex="^(created|title)$"),
  ):
      validate_ownership(user_id, current_user)
      query = select(Task).where(Task.user_id == current_user)

      if status == "pending":
          query = query.where(Task.completed == False)
      elif status == "completed":
          query = query.where(Task.completed == True)

      if sort == "created":
          query = query.order_by(Task.created_at.asc())
      elif sort == "title":
          query = query.order_by(Task.title.asc())

      tasks = session.exec(query).all()
      return tasks
  ```
- Supports status (all/pending/completed) and sort (created/title) parameters
- Returns 403 if user_id mismatch, 401 if invalid JWT
- Returns empty array if no tasks

**Dependencies**: T10, T13, T14, T07
**Complexity**: Medium
**Estimated Time**: 20 min
**Frontend Integration**: Endpoint supports frontend filtering/sorting UI; returns TaskResponse list

---

### T17: Implement POST /api/{user_id}/tasks Endpoint
**File(s)**: backend/src/routes/tasks.py (extend from T16)
**Steps**:
- Create route handler:
  ```python
  @router.post("/api/{user_id}/tasks", status_code=201)
  async def create_task(
      user_id: str,
      task_create: TaskCreate,
      current_user: str = Depends(get_current_user),
      session: Session = Depends(get_session),
  ):
      validate_ownership(user_id, current_user)
      task = Task(user_id=current_user, **task_create.dict())
      session.add(task)
      session.commit()
      session.refresh(task)
      return task
  ```
- Validates title (1-200 chars) and description (max 1000 chars) via Pydantic
- Returns 201 Created with task details
- Returns 422 for validation errors
- Sets created_at and updated_at automatically

**Dependencies**: T10, T11, T13, T14, T07
**Complexity**: Medium
**Estimated Time**: 15 min
**Frontend Integration**: Response includes task ID and timestamps; frontend displays newly created task

---

### T18: Implement GET /api/{user_id}/tasks/{task_id} Endpoint
**File(s)**: backend/src/routes/tasks.py (extend)
**Steps**:
- Create route handler:
  ```python
  @router.get("/api/{user_id}/tasks/{task_id}")
  async def get_task(
      user_id: str,
      task_id: int,
      current_user: str = Depends(get_current_user),
      session: Session = Depends(get_session),
  ):
      validate_ownership(user_id, current_user)
      task = session.exec(
          select(Task).where(Task.id == task_id, Task.user_id == current_user)
      ).first()
      if not task:
          raise HTTPException(status_code=404, detail="Task not found")
      return task
  ```
- Returns 403 if user_id mismatch, 404 if task not found or not owned
- Returns TaskResponse with task details

**Dependencies**: T10, T13, T14, T07
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: Endpoint used for task detail view; returns full task object

---

### T19: Implement PUT /api/{user_id}/tasks/{task_id} Endpoint
**File(s)**: backend/src/routes/tasks.py (extend)
**Steps**:
- Create route handler:
  ```python
  @router.put("/api/{user_id}/tasks/{task_id}")
  async def update_task(
      user_id: str,
      task_id: int,
      task_update: TaskUpdate,
      current_user: str = Depends(get_current_user),
      session: Session = Depends(get_session),
  ):
      validate_ownership(user_id, current_user)
      task = session.exec(
          select(Task).where(Task.id == task_id, Task.user_id == current_user)
      ).first()
      if not task:
          raise HTTPException(status_code=404, detail="Task not found")

      update_data = task_update.dict(exclude_unset=True)
      for field, value in update_data.items():
          setattr(task, field, value)
      task.updated_at = datetime.utcnow()
      session.add(task)
      session.commit()
      session.refresh(task)
      return task
  ```
- Supports partial updates (title and/or description)
- Updates updated_at on modification
- Returns 422 for validation errors (via Pydantic)
- Idempotent if same data provided

**Dependencies**: T10, T11, T13, T14, T07
**Complexity**: Medium
**Estimated Time**: 15 min
**Frontend Integration**: Frontend sends partial update; response confirms changes

---

### T20: Implement PATCH /api/{user_id}/tasks/{task_id}/complete Endpoint
**File(s)**: backend/src/routes/tasks.py (extend)
**Steps**:
- Create route handler:
  ```python
  @router.patch("/api/{user_id}/tasks/{task_id}/complete")
  async def toggle_task_complete(
      user_id: str,
      task_id: int,
      current_user: str = Depends(get_current_user),
      session: Session = Depends(get_session),
  ):
      validate_ownership(user_id, current_user)
      task = session.exec(
          select(Task).where(Task.id == task_id, Task.user_id == current_user)
      ).first()
      if not task:
          raise HTTPException(status_code=404, detail="Task not found")

      task.completed = not task.completed
      task.updated_at = datetime.utcnow()
      session.add(task)
      session.commit()
      session.refresh(task)
      return task
  ```
- Toggles completed boolean (false→true or true→false)
- Updates updated_at
- Returns updated task with new completed status

**Dependencies**: T10, T13, T14, T07
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: Endpoint used for task completion toggle; returns updated task

---

### T21: Implement DELETE /api/{user_id}/tasks/{task_id} Endpoint
**File(s)**: backend/src/routes/tasks.py (extend)
**Steps**:
- Create route handler:
  ```python
  @router.delete("/api/{user_id}/tasks/{task_id}", status_code=204)
  async def delete_task(
      user_id: str,
      task_id: int,
      current_user: str = Depends(get_current_user),
      session: Session = Depends(get_session),
  ):
      validate_ownership(user_id, current_user)
      task = session.exec(
          select(Task).where(Task.id == task_id, Task.user_id == current_user)
      ).first()
      if not task:
          raise HTTPException(status_code=404, detail="Task not found")

      session.delete(task)
      session.commit()
  ```
- Returns 204 No Content on success (no body)
- Returns 404 if task not found or not owned
- Hard-deletes task (no soft delete for MVP)

**Dependencies**: T10, T13, T14, T07
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: Frontend sends DELETE; receives 204 No Content confirming deletion

---

### T22: Register Routes with FastAPI App
**File(s)**: backend/src/main.py (update from T09)
**Steps**:
- Import and include router in FastAPI app:
  ```python
  from src.routes.tasks import router
  app.include_router(router)
  ```
- Verify all 6 endpoints are registered
- Test with `python -m uvicorn src.main:app --reload`
- Check endpoint documentation at http://localhost:8000/docs (Swagger UI)

**Dependencies**: T16–T21
**Complexity**: Easy
**Estimated Time**: 5 min
**Frontend Integration**: All endpoints now available for frontend consumption

---

## Phase 6 Tasks: Error Handling, Validation & Logging

### T23: Implement Custom Error Response Models
**File(s)**: backend/src/models.py (extend)
**Steps**:
- Add ErrorResponse model:
  ```python
  class ErrorResponse(BaseModel):
      status_code: int
      detail: str
  ```
- Ensure all HTTPExceptions use this format
- FastAPI auto-converts to JSON

**Dependencies**: T10
**Complexity**: Easy
**Estimated Time**: 5 min
**Frontend Integration**: Frontend receives consistent error format

---

### T24: Add Comprehensive Logging
**File(s)**: backend/src/main.py, src/routes/tasks.py
**Steps**:
- Set up Python logging:
  ```python
  import logging
  logging.basicConfig(level=logging.INFO)
  logger = logging.getLogger(__name__)
  ```
- Log JWT validation failures (info level, no sensitive data)
- Log database errors (error level)
- Log task operations (info level: created, updated, deleted)
- Write logs to logs/ directory or stdout

**Dependencies**: T05, T16–T21
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: None (backend operational)

---

### T25: Test Error Handling (All Status Codes)
**File(s)**: backend/tests/test_errors.py
**Steps**:
- Test 400 Bad Request (invalid JSON)
- Test 401 Unauthorized (missing/invalid JWT)
- Test 403 Forbidden (user_id mismatch)
- Test 404 Not Found (task doesn't exist)
- Test 422 Unprocessable Entity (validation error: title too long, etc.)
- Test 500 Internal Server Error (simulated database failure)
- Verify error messages are user-friendly

**Dependencies**: T16–T21, T24
**Complexity**: Medium
**Estimated Time**: 30 min
**Frontend Integration**: Tests validate error contract with frontend error handling

---

### T26: Implement Request/Response Logging Middleware
**File(s)**: backend/src/main.py (extend)
**Steps**:
- Add middleware to log all requests/responses:
  ```python
  from fastapi.middleware import Middleware
  from starlette.middleware.base import BaseHTTPMiddleware

  class LoggingMiddleware(BaseHTTPMiddleware):
      async def dispatch(self, request, call_next):
          logger.info(f"{request.method} {request.url.path}")
          response = await call_next(request)
          logger.info(f"Response: {response.status_code}")
          return response

  app.add_middleware(LoggingMiddleware)
  ```
- Logs all incoming requests and responses
- Sensitive data (tokens, passwords) should not be logged

**Dependencies**: T05, T24
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: None (backend operational)

---

## Phase 7 Tasks: Docker Configuration for Local Dev

### T27: Create Dockerfile for Local Development
**File(s)**: backend/Dockerfile
**Steps**:
- Write Dockerfile:
  ```dockerfile
  FROM python:3.11-slim

  WORKDIR /app

  # Install dependencies
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt

  # Copy source code
  COPY src/ src/
  COPY .env .

  # Non-root user for security
  RUN useradd -m appuser && chown -R appuser:appuser /app
  USER appuser

  EXPOSE 8000

  CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```
- Multi-stage not required for dev (single stage acceptable)
- Non-root user (appuser) for security

**Dependencies**: T03, T05
**Complexity**: Medium
**Estimated Time**: 15 min
**Frontend Integration**: None (backend containerization)

---

### T28: Create docker-compose.yml for Local Dev
**File(s)**: backend/docker-compose.yml
**Steps**:
- Write docker-compose.yml:
  ```yaml
  version: "3.8"

  services:
    backend:
      build: .
      ports:
        - "8000:8000"
      env_file:
        - .env
      volumes:
        - ./src:/app/src  # Hot reload
      command: uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
  ```
- Port mapping: local 8000 → container 8000
- Volume mount for hot reload (src/)
- env_file loads .env

**Dependencies**: T27, T04
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: Frontend can call http://localhost:8000/api/... from host machine

---

### T29: Test Docker Build and Run Locally
**File(s)**: backend/Dockerfile, docker-compose.yml
**Steps**:
- Build image: `docker-compose build`
- Start container: `docker-compose up`
- Test health check: `curl http://localhost:8000/health`
- Test endpoint: `curl -H "Authorization: Bearer <JWT>" http://localhost:8000/api/<user_id>/tasks`
- Verify hot reload works (edit src/main.py, save, app reloads)
- Stop container: `Ctrl+C`, then `docker-compose down`

**Dependencies**: T27, T28
**Complexity**: Easy
**Estimated Time**: 15 min
**Frontend Integration**: Verify frontend can reach backend at http://localhost:8000

---

### T30: Add Health Check to Container
**File(s)**: backend/docker-compose.yml (extend), src/main.py (extend)
**Steps**:
- Add `/health` endpoint to FastAPI (already in T05)
- Add healthcheck to docker-compose.yml:
  ```yaml
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 10s
  ```
- Verify container health status: `docker ps` shows "healthy"

**Dependencies**: T27, T28, T05
**Complexity**: Easy
**Estimated Time**: 5 min
**Frontend Integration**: None (backend operational)

---

## Phase 8 Tasks: Hugging Face Spaces Deployment Preparation

### T31: Adapt Dockerfile for HF Spaces
**File(s)**: backend/Dockerfile (create variant for HF)
**Steps**:
- Create `Dockerfile.spaces` (or modify Dockerfile with comments):
  ```dockerfile
  FROM python:3.11-slim

  WORKDIR /app

  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt

  COPY src/ src/

  # HF Spaces requires port 7860
  EXPOSE 7860

  CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]
  ```
- Port changed from 8000 to 7860 (HF Spaces requirement)
- No hot reload (read-only filesystem on HF Spaces)

**Dependencies**: T27
**Complexity**: Easy
**Estimated Time**: 5 min
**Frontend Integration**: HF Spaces URL will differ from local; frontend must be configured for production URL

---

### T32: Create Deployment Documentation
**File(s)**: backend/docs/DEPLOYMENT.md
**Steps**:
- Write DEPLOYMENT.md with sections:
  - **Local Development**: docker-compose up, accessing http://localhost:8000
  - **Docker Build**: docker build -t hackathon-todo-backend .
  - **Hugging Face Spaces**:
    - Create Space on HF
    - Upload backend/ directory
    - Set secrets in Space settings: BETTER_AUTH_SECRET, NEON_DB_URL
    - Space will auto-build and deploy on https://huggingface.co/spaces/...
  - **Environment Variables**: Document all .env variables
  - **Troubleshooting**: Common issues and solutions

**Dependencies**: T27, T28, T31
**Complexity**: Easy
**Estimated Time**: 20 min
**Frontend Integration**: Document production URL for frontend to use

---

### T33: Test Secrets Injection on HF Spaces (Dry Run)
**File(s)**: backend/src/main.py (extend)
**Steps**:
- Add logging on startup to verify secrets are loaded:
  ```python
  import os
  logger.info(f"BETTER_AUTH_SECRET loaded: {bool(os.getenv('BETTER_AUTH_SECRET'))}")
  logger.info(f"NEON_DB_URL loaded: {bool(os.getenv('NEON_DB_URL'))}")
  ```
- On HF Spaces, secrets are injected as environment variables at runtime
- Verify via logs that secrets are present (do not log actual values)

**Dependencies**: T31, T24
**Complexity**: Easy
**Estimated Time**: 10 min
**Frontend Integration**: None (backend operational)

---

### T34: Create Architecture Documentation
**File(s)**: backend/docs/ARCHITECTURE.md
**Steps**:
- Write ARCHITECTURE.md with sections:
  - **System Overview**: Frontend → Backend flow diagram (text-based)
  - **Stateless Auth**: JWT validation, user_id path enforcement
  - **Data Model**: Task entity, fields, relationships
  - **API Design**: RESTful endpoints, status codes, error handling
  - **Database**: Neon PostgreSQL, indexes, schema
  - **Security**: CORS, JWT validation, ownership enforcement, no SQL injection
  - **Deployment**: Docker, HF Spaces, environment configuration
  - **Performance**: Connection pooling, indexes, query optimization

**Dependencies**: All phases
**Complexity**: Easy
**Estimated Time**: 30 min
**Frontend Integration**: Reference frontend integration points

---

---

# 4. Strict File Creation/Update Order

| Order | File | Reason | Phase |
|-------|------|--------|-------|
| 1 | `backend/requirements.txt` | Install dependencies first; all other tasks depend on this | 1 |
| 2 | `backend/.env.example` | Define environment template before setup | 1 |
| 3 | `backend/.env` | Load actual secrets for local development | 1 |
| 4 | `backend/.gitignore` | Protect secrets before committing | 1 |
| 5 | `backend/src/__init__.py` | Python package initialization | 1 |
| 6 | `backend/src/db.py` | Database connection; needed by models and routes | 2 |
| 7 | `backend/src/models.py` | Data models; needed by routes and API responses | 3 |
| 8 | `backend/src/dependencies.py` | JWT validation; needed by routes | 4 |
| 9 | `backend/src/routes/tasks.py` | Task endpoints; uses models and dependencies | 5 |
| 10 | `backend/src/main.py` | FastAPI app; ties together routes, models, deps | 5 |
| 11 | `backend/tests/conftest.py` | Pytest fixtures; needed by test files | 6 |
| 12 | `backend/tests/test_auth.py` | Auth validation tests | 6 |
| 13 | `backend/tests/test_errors.py` | Error handling tests | 6 |
| 14 | `backend/tests/test_tasks_crud.py` | CRUD operation tests | 6 |
| 15 | `backend/tests/test_integration.py` | End-to-end multi-user isolation tests | 6 |
| 16 | `backend/Dockerfile` | Container build; uses requirements.txt | 7 |
| 17 | `backend/docker-compose.yml` | Local dev orchestration; uses Dockerfile and .env | 7 |
| 18 | `backend/docs/ARCHITECTURE.md` | Design documentation | 8 |
| 19 | `backend/docs/DEPLOYMENT.md` | Deployment guide | 8 |
| 20 | `backend/README.md` | Project overview and setup | 1–8 (last) |

---

# 5. Dependencies & Prerequisites Checklist

## Python Version
- **Required**: Python 3.11 or later
- **Rationale**: FastAPI and SQLModel require 3.10+; 3.11 provides better performance and type hints
- **Verification**: `python --version` should show 3.11+

## Required pip Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | 0.104.1+ | Web framework for building REST API |
| `uvicorn[standard]` | 0.24.0+ | ASGI server for running FastAPI app |
| `sqlmodel` | 0.0.14+ | ORM combining SQLAlchemy + Pydantic for type-safe database access |
| `sqlalchemy` | 2.0.23+ | SQL toolkit and ORM (SQLModel uses this) |
| `psycopg2-binary` | 2.9.9+ | PostgreSQL database driver for Neon connectivity |
| `pyjwt` | 2.8.1+ | JWT token validation and decoding |
| `python-dotenv` | 1.0.0+ | Environment variable loading from .env file |
| `pydantic` | 2.5.0+ | Data validation and serialization (used by FastAPI) |

## Environment Variables

| Variable | Example Value | Purpose |
|----------|---------------|---------|
| `BETTER_AUTH_SECRET` | `m3cSkzyIycR8U3c7nAbPgNTe6HyQVnRR` | Shared secret for JWT validation (must match frontend) |
| `NEON_DB_URL` | `postgresql://neondb_owner:npg_ukfdnO1U6siv@ep-bitter-mountain-a7c5kvdr-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require` | PostgreSQL connection string (includes SSL) |
| `BETTER_AUTH_URL` | `http://localhost:3000/` | Frontend auth URL (backend reference only) |
| `DEBUG` | `False` | Enable debug mode (False for production) |
| `LOG_LEVEL` | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR) |

## Neon Database Prerequisites

1. **Database Setup**:
   - Neon Serverless PostgreSQL instance created
   - Database name: `neondb`
   - SSL enabled: `sslmode=require`, `channel_binding=require`

2. **Connection Pooler**:
   - Neon provides pooler URL (preferred for serverless)
   - URL format: `postgresql://user:password@pooler-host/dbname?sslmode=require&channel_binding=require`

3. **SSL/TLS**:
   - Neon requires SSL for all connections
   - psycopg2-binary handles SSL via Neon's certificate

4. **Testing Connectivity**:
   - Command: `psql "postgresql://user:password@host/dbname?sslmode=require"`
   - Should connect without certificate errors

## Additional Prerequisites

1. **Docker** (for containerization):
   - Docker Desktop installed and running
   - Command: `docker --version` (Docker 20.10+)

2. **Git** (for version control):
   - Initialized repository
   - Branch: `003-backend-api-tasks`

3. **Frontend Integration**:
   - Frontend's BETTER_AUTH_SECRET must match backend's value
   - Frontend must send JWT in `Authorization: Bearer <token>` header

---

# 6. Success Criteria Checklist

## Functional Success

- [ ] All 6 endpoints respond with correct data and status codes
- [ ] GET /api/{user_id}/tasks returns user's tasks (filtered, sorted)
- [ ] POST /api/{user_id}/tasks creates task and returns 201 with task details
- [ ] GET /api/{user_id}/tasks/{task_id} returns task or 404
- [ ] PUT /api/{user_id}/tasks/{task_id} updates task and returns 200
- [ ] PATCH /api/{user_id}/tasks/{task_id}/complete toggles completion and returns 200
- [ ] DELETE /api/{user_id}/tasks/{task_id} deletes task and returns 204
- [ ] All endpoints return 401 without valid JWT
- [ ] All endpoints return 403 if path user_id != JWT user_id
- [ ] All endpoints return 422 for validation errors (title/description length, etc.)
- [ ] Query parameters (status, sort) work correctly and validate input

## Security Success

- [ ] JWT validation passes with correct token, rejects invalid/expired tokens
- [ ] User_id path enforcement prevents cross-user data access (403 on mismatch)
- [ ] Database queries filtered by user_id (defense in depth)
- [ ] No SQL injection via SQLModel ORM parameterized queries
- [ ] CORS restricts to frontend origins (localhost:3000, localhost)
- [ ] No secrets hardcoded in code (all from .env)
- [ ] Error messages are user-friendly; no internal stack traces exposed

## Performance Success

- [ ] GET /tasks responds in <100ms (typical user)
- [ ] POST/PUT/PATCH/DELETE respond in <50ms
- [ ] JWT validation <5ms per request
- [ ] Database indexes on user_id and completed reduce query time
- [ ] Connection pooling handles 100 concurrent users without errors

## Reliability Success

- [ ] Database connection errors return 500 with appropriate message
- [ ] Missing required fields return 422 (Pydantic validation)
- [ ] Invalid JWT returns 401; token refresh handled by frontend
- [ ] Concurrent updates handled (last-write-wins acceptable for MVP)
- [ ] No cascading failures; isolated error handling

## Integration Success

- [ ] Frontend receives JWT from Better Auth and includes in requests
- [ ] Frontend calls http://localhost:8000/api/{user_id}/tasks with correct path
- [ ] Frontend receives TaskResponse with id, timestamps, task data
- [ ] Frontend handles all error responses (401, 403, 404, 422, 500)
- [ ] Multi-user isolation verified: User A cannot see/modify User B's tasks

## Docker Success

- [ ] Dockerfile builds without errors: `docker build -t backend .`
- [ ] Container starts: `docker-compose up` with volume mounts
- [ ] Health check endpoint responds: `curl http://localhost:8000/health`
- [ ] Hot reload works: edit src/, save, app reloads
- [ ] Environment variables loaded from .env_file
- [ ] Non-root user runs app (security)

## Hugging Face Spaces Success

- [ ] Dockerfile.spaces or variant CMD on port 7860
- [ ] Secrets injected at runtime (BETTER_AUTH_SECRET, NEON_DB_URL)
- [ ] Space builds and deploys without errors
- [ ] API endpoints accessible at HF Spaces URL
- [ ] CORS allows frontend origin (will differ from localhost)

## Testing Success

- [ ] Pytest runs all tests: `pytest` (40+ tests)
- [ ] Auth tests validate JWT validation, token expiry, invalid signatures
- [ ] CRUD tests validate all endpoint operations and status codes
- [ ] Error tests validate 400, 401, 403, 404, 422, 500 responses
- [ ] Integration tests validate multi-user isolation (no cross-user data leakage)
- [ ] All tests pass; no failures or warnings
- [ ] Coverage report shows >80% code coverage

## Documentation Success

- [ ] README.md includes setup, run, API documentation, troubleshooting
- [ ] ARCHITECTURE.md documents system design, auth flow, data model
- [ ] DEPLOYMENT.md documents local, Docker, and HF Spaces deployment
- [ ] OpenAPI schema available at http://localhost:8000/docs (Swagger UI)
- [ ] Inline code comments explain complex logic
- [ ] Error messages documented in errors.md

---

# 7. Implementation Notes

## Key Implementation Constraints

1. **No Session Storage**: Backend is stateless; all user context comes from JWT
2. **User_id in Path**: Every endpoint must include {user_id} in path; no global context
3. **Ownership First**: Every database query must filter by user_id extracted from JWT
4. **No Extra Auth Endpoints**: Signup/signin handled by frontend (Better Auth); backend only validates
5. **Idempotent Reads**: GET requests never modify state
6. **Last-Write-Wins**: Concurrent updates acceptable for MVP; no locking required
7. **No Pagination**: MVP assumes <1000 tasks per user
8. **No Caching**: Every request hits database (Neon handles caching)

## Technology Decisions Rationale

| Decision | Why This | Alternatives Rejected |
|----------|----------|----------------------|
| **FastAPI** | Type-safe, automatic API docs, great for REST | Django (heavier), Flask (less type-safe) |
| **SQLModel** | Combines SQLAlchemy + Pydantic; single source of truth | Raw SQLAlchemy (more verbose), ORM-less (SQL injection risk) |
| **PyJWT** | Lightweight, standard library for token validation | python-jose (heavier), rolling own crypto (security risk) |
| **Neon Serverless PostgreSQL** | Managed, auto-scaling, per-request billing | Heroku Postgres (more expensive), local Postgres (not serverless) |
| **Docker for Deployment** | Standard, reproducible, works on HF Spaces | Raw Python (no isolation), systemd (platform-specific) |

---

# 8. Risk Analysis & Mitigation

## Top 3 Risks

| Risk | Blast Radius | Mitigation |
|------|--------------|-----------|
| **JWT Secret Misconfiguration** | High: Auth fails, app unusable | Store in .env, never in code; verify on startup; log if missing |
| **Database Connection Loss** | Medium: Requests fail with 500 | Connection pooling handles transients; logging alerts ops; HF Spaces auto-restarts |
| **User_id Path Mismatch Logic Bug** | High: Cross-user data leakage | Ownership check in route handler before any query; tests validate isolation |

## Guardrails

- **No Cross-User Data Leakage**: Every database query includes `WHERE user_id = current_user_id`; second line of defense after path validation
- **Kill Switch**: Can revert to previous commit; no data migration required for MVP
- **Rollback Strategy**: Stateless design means deployment is atomic; old version can run alongside new version

---

# 9. Next Steps After Plan Approval

1. **Phase 0 Research** (skip—spec is comprehensive)
2. **Phase 1 Design**:
   - Create `research.md` (if needed for any NEEDS CLARIFICATION)
   - Create `data-model.md` (extract from spec)
   - Create `contracts/openapi.json` (API contract)
   - Create `quickstart.md` (quick reference)
3. **Phase 2 Implementation**:
   - Execute tasks T01–T34 in order
   - Run backend-engineer agent for code implementation
   - Integration-tester validates multi-user isolation
4. **Deployment**:
   - Commit to branch `003-backend-api-tasks`
   - Create PR to main
   - Deploy to HF Spaces and local Docker

---

**Plan Status**: ✅ Ready for Implementation | **Approval Date**: [Awaiting User Sign-Off]
