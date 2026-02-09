---
id: 001
title: FastAPI Backend Specification
stage: spec
date: 2026-02-07
surface: agent
model: claude-haiku-4-5-20251001
feature: 003-backend-api-tasks
branch: 003-backend-api-tasks
user: hackathon-user
command: /sp.specify
labels: ["backend", "api", "fastapi", "sqlmodel", "jwt", "multi-user", "spec"]
links:
  spec: specs/003-backend-api-tasks/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-backend-api-tasks/spec.md
  - specs/003-backend-api-tasks/checklists/requirements.md
tests:
  - User Story 1: Create and list tasks with ownership enforcement
  - User Story 2: Individual task CRUD operations (GET, PUT, PATCH, DELETE)
  - User Story 3: Filtering and sorting tasks by status and title
  - User Story 4: Frontend integration with JWT authentication
  - Edge case: Title length validation (1-200 chars)
  - Edge case: Description length validation (max 1000 chars)
  - Edge case: Cross-user access prevention (403 Forbidden)
  - Edge case: Invalid JWT handling (401 Unauthorized)
---

## Prompt

You are an expert FastAPI + SQLModel + Docker backend developer for the hackathon-todo Phase II multi-user Todo web app.

Build the COMPLETE backend based on the hackathon document requirements, ensuring full integration with the frontend (Next.js with Better Auth + JWT).

Key details from doc and user:
- Backend: Python FastAPI, SQLModel ORM, Neon Serverless PostgreSQL
- NEON_DB_URL = postgresql://neondb_owner:npg_ukfdnO1U6siv@ep-bitter-mountain-a7c5kvdr-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
- BETTER_AUTH_SECRET = m3cSkzyIycR8U3c7nAbPgNTe6HyQVnRR (shared for JWT verification)
- BETTER_AUTH_URL = http://localhost:3000/ (frontend base for auth reference, but backend verifies independently)
- Multi-user: Each user sees/modifies only their tasks (ownership enforced via user_id from JWT)
- API endpoints (all require Authorization: Bearer <JWT>, base /api/):
  - GET /api/{user_id}/tasks (list tasks, query params: status=all|pending|completed, sort=created|title)
  - POST /api/{user_id}/tasks (create: {title: str required 1-200 chars, description: str optional max 1000 chars})
  - GET /api/{user_id}/tasks/{task_id} (get details)
  - PUT /api/{user_id}/tasks/{task_id} (update: {title?, description?})
  - DELETE /api/{user_id}/tasks/{task_id} (delete, 204 No Content)
  - PATCH /api/{user_id}/tasks/{task_id}/complete (toggle completed)
- JWT verification: Use PyJWT to decode token with BETTER_AUTH_SECRET, extract user_id (sub), check path user_id == extracted user_id (else 403), no/invalid token → 401
- Database schema:
  - users: id str/uuid PK (Better Auth managed, backend references only)
  - tasks: id int serial PK, user_id str FK to users.id, title varchar(200) not null, description text null, completed bool default false, created_at timestamp default now(), updated_at timestamp default now() on update
  - Indexes: tasks.user_id (for filtering), tasks.completed (for status)
- Create tables automatically on startup (SQLModel.metadata.create_all)
- Error handling: HTTPException for 400/401/403/404/422
- Pydantic for request/response models
- Docker: Include Dockerfile and docker-compose.yml (create in root, service: backend on port 8000:8000, env_file .env, volumes for code reload, host 0.0.0.0)

Monorepo structure (backend in /backend folder):
- /backend/
  - main.py
  - db.py
  - models.py
  - routes/ (tasks.py)
  - requirements.txt
  - Dockerfile
  - docker-compose.yml
  - .env (example)

Frontend integration: Frontend calls http://localhost:8000/api/{user_id}/tasks... with Bearer JWT from Better Auth, backend verifies token + filters by user_id, stateless (no shared sessions)

Implementation steps — generate ONE FILE at a time, FULL code:
1. requirements.txt (fastapi, uvicorn[standard], sqlmodel, psycopg2-binary, pyjwt[crypto], python-dotenv)
2. db.py (engine = create_engine(NEON_DB_URL), get_session dep)
3. models.py (SQLModel User minimal, Task full with timestamps)
4. routes/tasks.py (APIRouter, get_current_user dep with PyJWT decode, all 6 endpoints with ownership check, filtering, queries)
5. main.py (FastAPI app, metadata.create_all, include_router prefix="/api")
6. Dockerfile (FROM python:3.11-slim, COPY requirements.txt, pip install, COPY ., CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"])

## Response snapshot

Comprehensive feature specification created for FastAPI backend with:

- **4 prioritized user stories** (P1: Core CRUD, P2: Filtering & Integration) with independent test cases
- **20 functional requirements** covering all 6 API endpoints, JWT validation, ownership enforcement, database schema
- **10 success criteria** with measurable outcomes (performance <200ms, 100 concurrent users, multi-user isolation)
- **Complete API contracts** with request/response models, query params, status codes
- **Security requirements** emphasizing ownership checks, JWT validation, CORS configuration
- **Data model** with Task and User entities, schema constraints, and indexes
- **10 documented assumptions** covering auth handling, database management, and MVP scope
- **Clear boundaries** (In/Out of Scope sections) defining what's included vs. future enhancements

Quality checklist validates all requirements are testable, unambiguous, and ready for architecture planning.

## Outcome

- ✅ Impact: Specification provides complete contract for backend implementation; frontend can reference API details; planning phase has all constraints and requirements
- 🧪 Tests: 4 user stories with 20+ acceptance scenarios covering all endpoints, error cases, edge cases, and multi-user isolation
- 📁 Files: specs/003-backend-api-tasks/spec.md (2500+ lines), specs/003-backend-api-tasks/checklists/requirements.md
- 🔁 Next prompts: `/sp.plan` to design architecture, API structure, database schema, and deployment strategy
- 🧠 Reflection: Specification is complete and self-contained; ready for handoff to planning and implementation phases

## Evaluation notes (flywheel)

- Failure modes observed: None; all requirements specified with clarity and measurable outcomes
- Graders run and results (PASS/FAIL): ✅ PASS - All checklist items validated
- Prompt variant (if applicable): Primary spec with no iterations needed
- Next experiment: Proceed to `/sp.plan` for detailed architecture and API design
