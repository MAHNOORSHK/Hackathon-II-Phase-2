---
description: "Actionable, dependency-ordered tasks for FastAPI backend implementation"
---

# Tasks: FastAPI Backend for Multi-User Tasks API

**Input**: Design documents from `/specs/003-backend-api-tasks/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Branch**: `003-backend-api-tasks`
**Target**: Full backend implementation with 6 endpoints, JWT auth, Neon PostgreSQL, Docker deployment

**Tests**: Integration tests are INCLUDED for this backend feature (user isolation validation is critical). Tests marked [T] are contract/integration tests.

**Organization**: Tasks are grouped by user story (US1, US2, US3) to enable independent implementation and testing of each story. Backend implementation follows: Setup → Foundational → User Stories → Polish.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, directory structure, and basic configuration

**All tasks in this phase must be completed before Foundational tasks begin**

- [ ] T001 Create project structure per implementation plan: `backend/src/`, `backend/tests/`, `backend/docs/`, `backend/logs/`
- [ ] T002 [P] Initialize Python virtual environment and install dependencies from `backend/requirements.txt`
- [ ] T003 [P] Create `.env.example` template and `.env` with environment variables (BETTER_AUTH_SECRET, NEON_DB_URL, BETTER_AUTH_URL)
- [ ] T004 [P] Create `.gitignore` with Python, venv, .env, logs, and cache entries
- [ ] T005 [P] Initialize git repository on branch `003-backend-api-tasks`
- [ ] T006 Initialize FastAPI application in `backend/src/main.py` with CORS configuration and health check endpoint

**Checkpoint**: Project structure ready, dependencies installed, FastAPI app boots successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. All tasks here are non-parallelizable prerequisites.

- [ ] T007 Implement database connection module in `backend/src/db.py`: SQLAlchemy engine, session factory, connection pooling for Neon PostgreSQL
- [ ] T008 Test database connectivity: verify SSL/TLS connection to Neon, log successful connection (manual or script test)
- [ ] T009 Add startup/shutdown hooks to FastAPI app in `backend/src/main.py` to initialize schema on startup
- [ ] T010 Define SQLModel Task entity in `backend/src/models.py` with all fields (id, user_id, title, description, completed, created_at, updated_at)
- [ ] T011 Create Pydantic models in `backend/src/models.py`: TaskCreate, TaskUpdate, TaskResponse
- [ ] T012 Implement schema creation: ensure indexes on user_id and completed via SQLModel.metadata.create_all(engine)
- [ ] T013 Create `backend/src/dependencies.py` with JWT validation dependency (`get_current_user`): decode token with BETTER_AUTH_SECRET, extract user_id from sub claim
- [ ] T014 Implement ownership validation in `backend/src/dependencies.py`: validate path user_id matches JWT user_id (return 403 Forbidden if mismatch)
- [ ] T015 Initialize FastAPI router in `backend/src/routes/__init__.py` and create `backend/src/routes/tasks.py` with route registration
- [ ] T016 Add comprehensive logging configuration in `backend/src/main.py` and `backend/src/routes/tasks.py`: log JWT validation failures, database errors, task operations
- [ ] T017 Implement custom error response models in `backend/src/models.py` and error handlers in `backend/src/main.py`: handle 400, 401, 403, 404, 422, 500

**Checkpoint**: Foundation ready - database connected, JWT validation working, error handling in place, all user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Creates and Lists Their Tasks (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can create new tasks with title/description and view all their tasks with filtering by status and sorting options. Each user sees only their own tasks.

**Independent Test**: Create a task via POST, retrieve it via GET, verify ownership enforcement blocks other users, verify status/sort params work

### Tests for User Story 1 (Contract & Integration)

> **NOTE: These tests should pass once US1 implementation is complete. Run pytest to validate isolation.**

- [ ] [T] T018 [P] [US1] Create contract test for GET /api/{user_id}/tasks endpoint in `backend/tests/test_contracts.py`: validate response schema (array of TaskResponse)
- [ ] [T] T019 [P] [US1] Create contract test for POST /api/{user_id}/tasks endpoint in `backend/tests/test_contracts.py`: validate 201 response, task has id and timestamps
- [ ] [T] T020 [US1] Create integration test for user task isolation in `backend/tests/test_integration.py`: User A creates task, User B cannot access it (404), User A can list it (200)
- [ ] [T] T021 [US1] Create integration test for filtering/sorting in `backend/tests/test_integration.py`: GET with status=pending, completed, sort=created/title params

### Implementation for User Story 1

- [ ] T022 [P] [US1] Implement GET /api/{user_id}/tasks endpoint in `backend/src/routes/tasks.py`: query all user's tasks, support query params status (all|pending|completed) and sort (created|title)
- [ ] T023 [P] [US1] Implement POST /api/{user_id}/tasks endpoint in `backend/src/routes/tasks.py`: create task from TaskCreate request body, return 201 with TaskResponse
- [ ] T024 [US1] Add validation to POST /api/{user_id}/tasks: title 1-200 chars, description max 1000 chars, return 422 on validation error
- [ ] T025 [US1] Add validation to GET /api/{user_id}/tasks: status parameter must be "all", "pending", or "completed" (return 422 if invalid), sort must be "created" or "title"
- [ ] T026 [US1] Test User Story 1 endpoints: verify GET returns empty array for new user, POST creates task with correct fields, timestamps are UTC, completed defaults to false

**Checkpoint**: User Story 1 is complete and fully testable independently. User can create tasks and list their own tasks with filtering and sorting.

---

## Phase 4: User Story 2 - User Manages Individual Tasks (Priority: P1)

**Goal**: Authenticated user can retrieve a specific task, update its title/description, toggle completion status, and delete it. All operations are user-scoped.

**Independent Test**: GET task detail, verify 404 if not owned, PUT to update title, PATCH to toggle completion, DELETE to remove, verify 404 after deletion

### Tests for User Story 2 (Contract & Integration)

- [ ] [T] T027 [P] [US2] Create contract test for GET /api/{user_id}/tasks/{task_id} endpoint in `backend/tests/test_contracts.py`: validate TaskResponse schema
- [ ] [T] T028 [P] [US2] Create contract test for PUT /api/{user_id}/tasks/{task_id} endpoint in `backend/tests/test_contracts.py`: validate 200 response, task updated
- [ ] [T] T029 [P] [US2] Create contract test for PATCH /api/{user_id}/tasks/{task_id}/complete endpoint in `backend/tests/test_contracts.py`: validate completed toggle, 200 response
- [ ] [T] T030 [P] [US2] Create contract test for DELETE /api/{user_id}/tasks/{task_id} endpoint in `backend/tests/test_contracts.py`: validate 204 No Content response
- [ ] [T] T031 [US2] Create integration test for individual task operations in `backend/tests/test_integration.py`: GET detail, PUT update, PATCH toggle, DELETE removal

### Implementation for User Story 2

- [ ] T032 [P] [US2] Implement GET /api/{user_id}/tasks/{task_id} endpoint in `backend/src/routes/tasks.py`: retrieve single task, return 404 if not found or not owned
- [ ] T033 [P] [US2] Implement PUT /api/{user_id}/tasks/{task_id} endpoint in `backend/src/routes/tasks.py`: update title and/or description (partial update), return 200 with updated task, update updated_at
- [ ] T034 [P] [US2] Implement PATCH /api/{user_id}/tasks/{task_id}/complete endpoint in `backend/src/routes/tasks.py`: toggle completed boolean, update updated_at, return 200 with updated task
- [ ] T035 [P] [US2] Implement DELETE /api/{user_id}/tasks/{task_id} endpoint in `backend/src/routes/tasks.py`: hard delete task, return 204 No Content, return 404 if not found or not owned
- [ ] T036 [US2] Add validation to PUT /api/{user_id}/tasks/{task_id}: title 1-200 chars if provided, description max 1000 chars if provided, return 422 on error
- [ ] T037 [US2] Test User Story 2 endpoints: verify GET 404 for non-existent task, PUT updates updated_at, PATCH toggles completed, DELETE returns 204 and task is gone

**Checkpoint**: User Story 2 is complete. User can perform full CRUD operations on individual tasks with proper validation and ownership enforcement.

---

## Phase 5: User Story 3 - User Filters and Sorts Tasks (Priority: P2)

**Goal**: Authenticated user can filter tasks by completion status (all/pending/completed) and sort by creation date or title. This improves task discovery and organization.

**Independent Test**: Query /api/{user_id}/tasks with status and sort params, verify correct subset and ordering

### Tests for User Story 3 (Contract & Integration)

- [ ] [T] T038 [P] [US3] Create contract test for filtering in `backend/tests/test_contracts.py`: GET with status=pending returns only incomplete tasks
- [ ] [T] T039 [P] [US3] Create contract test for sorting in `backend/tests/test_contracts.py`: GET with sort=created returns ascending by created_at, sort=title returns alphabetical
- [ ] [T] T040 [US3] Create integration test for complex queries in `backend/tests/test_integration.py`: combine status filter and sort, verify results are correct

### Implementation for User Story 3

- [ ] T041 [US3] Verify filtering logic in GET /api/{user_id}/tasks: status=all (default), pending (completed=false), completed (completed=true)
- [ ] T042 [US3] Verify sorting logic in GET /api/{user_id}/tasks: sort=created (default, ascending), sort=title (alphabetical ascending)
- [ ] T043 [US3] Test edge cases: empty result sets, large result sets (100+ tasks), combined status and sort filters
- [ ] T044 [US3] Add query parameter validation: status and sort must match enum values, return 422 Unprocessable Entity if invalid

**Checkpoint**: User Story 3 is complete. Query parameters are fully functional with proper validation and default values.

---

## Phase 6: User Story 4 - Frontend Integrates with Backend (Priority: P2)

**Goal**: The frontend (Next.js + Better Auth) successfully authenticates users, receives JWT tokens, includes them in API requests, and handles responses/errors gracefully.

**Independent Test**: Frontend calls backend endpoints with valid JWT, receives correct responses; invalid/missing JWT returns 401; mismatched user_id returns 403

### Tests for User Story 4 (Contract & Integration)

- [ ] [T] T045 [P] [US4] Create auth test for JWT validation in `backend/tests/test_auth.py`: valid JWT accepted, expired JWT returns 401, invalid signature returns 401
- [ ] [T] T046 [P] [US4] Create auth test for ownership validation in `backend/tests/test_auth.py`: path user_id matching JWT user_id accepted, mismatch returns 403
- [ ] [T] T047 [US4] Create multi-user isolation test in `backend/tests/test_integration.py`: User A and User B can both authenticate and see only their own tasks (no cross-user data leakage)
- [ ] [T] T048 [US4] Create error response test in `backend/tests/test_integration.py`: verify 401, 403, 404, 422, 500 responses include descriptive error messages

### Implementation for User Story 4

- [ ] T049 [US4] Verify JWT validation in all endpoints: extract user_id from JWT["sub"], decode with BETTER_AUTH_SECRET, return 401 if invalid/expired/missing
- [ ] T050 [US4] Verify ownership check in all endpoints: compare path {user_id} with JWT user_id, return 403 if mismatch
- [ ] T051 [US4] Verify CORS configuration: allow http://localhost:3000 and http://localhost (frontend origins), reject other origins
- [ ] T052 [US4] Test error responses: 400 for bad request, 401 for auth failures, 403 for ownership mismatch, 404 for not found, 422 for validation errors, 500 for server errors
- [ ] T053 [US4] Add descriptive error messages: each error includes human-readable detail (e.g., "Task not found", "Invalid token", "User_id mismatch")
- [ ] T054 [US4] Verify response format: all TaskResponse objects include id, user_id, title, description, completed, created_at, updated_at (ISO format timestamps)

**Checkpoint**: User Story 4 is complete. Frontend-backend integration is fully functional with proper authentication, authorization, and error handling.

---

## Phase 7: Docker Configuration & Deployment (Priority: P3)

**Goal**: Backend is fully containerized for local development and Hugging Face Spaces deployment.

**Independent Test**: Docker build succeeds, container starts, health check responds, endpoints accessible at http://localhost:8000

### Implementation for User Story (Docker/Deployment)

- [ ] T055 Create `backend/Dockerfile` for local development: Python 3.11-slim base, install requirements.txt, copy src/, set non-root user, expose port 8000
- [ ] T056 Create `backend/docker-compose.yml` for local development: service backend, port mapping 8000:8000, env_file .env, volume mount ./src for hot reload, command uvicorn --reload
- [ ] T057 Add healthcheck to docker-compose.yml: GET http://localhost:8000/health endpoint, interval 30s, timeout 10s, max retries 3
- [ ] T058 Test Docker locally: `docker-compose build`, `docker-compose up`, verify health check passes, test endpoints with curl
- [ ] T059 Create `Dockerfile.spaces` variant for Hugging Face Spaces: port 7860 instead of 8000, no hot reload, secrets via environment variables
- [ ] T060 Create `backend/docs/DEPLOYMENT.md`: instructions for local Docker, HF Spaces deployment, environment variable setup

**Checkpoint**: Docker configuration complete for both local development and HF Spaces deployment.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, documentation, and operational readiness

- [ ] T061 [P] Create `backend/README.md`: setup instructions, running locally, API documentation link, troubleshooting guide
- [ ] T062 [P] Create `backend/docs/ARCHITECTURE.md`: system overview diagram (text), stateless auth flow, data model, API design, security model, performance considerations
- [ ] T063 Create test fixtures in `backend/tests/conftest.py`: test database session, test JWT tokens, test client setup
- [ ] T064 [P] Run full test suite: `pytest backend/tests/` with all integration tests passing, verify isolation (no cross-user leakage)
- [ ] T065 [P] Generate OpenAPI schema: verify http://localhost:8000/docs shows all 6 endpoints with correct request/response schemas
- [ ] T066 Add logging validation: verify logs include JWT validation attempts, database errors, task operation summaries (without sensitive data)
- [ ] T067 Performance validation: measure response times, verify GET /tasks < 100ms, POST/PUT/PATCH/DELETE < 50ms, JWT validation < 5ms
- [ ] T068 Security validation: verify no SQL injection risk via parameterized queries, no secrets in logs, CORS working correctly, 403/401 returned appropriately
- [ ] T069 Database validation: verify indexes on user_id and completed exist, verify schema auto-creates on startup, verify connection pooling works
- [ ] T070 Run quickstart validation: manual test of all endpoints with curl or Postman, verify error responses, verify multi-user isolation

**Checkpoint**: All user stories implemented, tested, documented, and ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Status |
|-------|-----------|--------|
| Setup (Phase 1) | None | Can start immediately |
| Foundational (Phase 2) | Setup complete | BLOCKS all user stories |
| User Story 1 (Phase 3) | Foundational complete | Can run after Phase 2 |
| User Story 2 (Phase 4) | Foundational + US1 complete | Can run after US1 (but independent tests) |
| User Story 3 (Phase 5) | Foundational + US1 complete | Can run in parallel with US2 (but not before US1) |
| User Story 4 (Phase 6) | Foundational + US1/US2/US3 complete | Can run after all features implemented |
| Docker/Deployment (Phase 7) | All user stories complete | Can run after Phase 6 |
| Polish (Phase 8) | All features complete | Final phase (documentation, testing, validation) |

### Task Dependencies Within Phases

**Phase 1 Setup** (sequential):
- T001 → T002 → T003 → T004 → T005 → T006

**Phase 2 Foundational** (mostly sequential, some parallel setup):
- T007 → T008 (verify connection)
- T009 (add startup hooks)
- T010 → T011 → T012 (models/schema)
- T013 → T014 (JWT deps)
- T015 → T016 → T017 (logging/errors)

**Phase 3 User Story 1** (tests can run in parallel during implementation):
- [Setup] → T022 + T023 (parallel) → T024 + T025 (parallel) → T026

**Phase 4 User Story 2** (can start after US1):
- [US1 complete] → T032 + T033 + T034 + T035 (parallel) → T036 + T037 (parallel)

**Phase 5 User Story 3** (can start after US1):
- [US1 complete] → T041 + T042 (parallel) → T043 + T044 (parallel)

**Phase 6 User Story 4** (starts after all features):
- [US1 + US2 + US3 complete] → T045 + T046 + T047 + T048 (parallel) → T049 + T050 + T051 + T052 + T053 + T054 (parallel)

### Within Each User Story

1. **Tests first** (mark [T]): Write failing tests before implementation
2. **Models before services**: Define data structures before business logic
3. **Services before endpoints**: Implement logic before exposing via API
4. **Core implementation before integration**: Get feature working before connecting to others
5. **Validation before feature complete**: Ensure error handling and edge cases work

### Parallel Opportunities

**During Phase 1 (Setup)**:
- T002, T003, T004, T005 can run in parallel (different files, no dependencies)

**During Phase 2 (Foundational)**:
- After T007: T008, T010, T013 can run in parallel (different concerns)
- After T010: T011, T012 can run in parallel
- After T013: T014 can run

**After Foundational Complete (Multiple Developers)**:
- **User Stories 1, 2, 3 can be worked on by different team members in parallel** (after Foundational)
- Within each story: tests [T] marked as [P] can run in parallel

**During Phase 3 (US1 Implementation)**:
- T022 + T023 can run in parallel (GET and POST endpoints, independent logic)
- T024 + T025 can run in parallel (validation for GET and POST)
- Tests T018 + T019 can write first (before T022/T023 implementation)

**During Phase 4 (US2 Implementation)**:
- T032 + T033 + T034 + T035 can run in parallel (4 endpoints, independent logic)
- Tests T027 + T028 + T029 + T030 can write first (before implementation)

**During Phase 6 (US4 Integration Testing)**:
- T045 + T046 + T047 + T048 can run in parallel (different test scenarios)

**During Phase 8 (Polish)**:
- T061 + T062 + T064 + T065 + T066 can run in parallel (different documentation and testing concerns)

---

## Parallel Example: Fast Track (2 Developers)

```bash
# Developer 1: Foundational Layer
T001-T017 (sequential, ~4-5 hours)

# Developer 2: Setup (can start in parallel with Dev 1 on Phase 2)
# Once T017 complete:
#   Dev 1 starts: T022 + T023 (US1 endpoints)
#   Dev 2 starts: T032 + T033 + T034 + T035 (US2 endpoints)
#   Both run in parallel, independent tests validate isolation

# Once US1 and US2 complete:
#   Dev 1 or Dev 2: T041-T044 (US3 filtering)
#   Other: Docker/Deployment (T055-T060)

# Final phase:
#   Both: Polish & testing (T061-T070)
```

**Estimated Timeline**:
- **Sequential**: ~16-20 hours (setup + 8 phases done one after another)
- **Parallel (2 devs)**: ~8-10 hours (Foundational ~5h, then US1+US2 in parallel ~3-4h, US3 + Docker ~2h, Polish ~1-2h)
- **Parallel (3+ devs)**: ~6-7 hours (Foundational + 3 user stories + Docker all in parallel)

---

## MVP Scope

**Minimum Viable Product (for hackathon Phase 2)**:
- ✅ Phase 1: Setup
- ✅ Phase 2: Foundational (database, JWT, error handling)
- ✅ Phase 3: User Story 1 (create and list tasks) — **CORE MVP**
- ✅ Phase 4: User Story 2 (manage individual tasks) — **CORE MVP**
- ✅ Phase 5: User Story 3 (filtering/sorting) — **Nice-to-have for MVP**
- ✅ Phase 6: User Story 4 (frontend integration) — **Required for demo**
- ✅ Phase 7: Docker configuration — **Required for deployment**
- ⚠️ Phase 8: Polish — **Time-permitting** (documentation, tests, optimization)

**MVP Definition**: Phases 1-7 complete, all 6 endpoints working, multi-user isolation enforced, deployed to local Docker and HF Spaces.

---

## MVP Implementation Strategy (Recommended)

1. **Start with Phase 1 + 2**: Get foundation ready (2-3 hours)
2. **Implement US1 + US2**: Core CRUD operations (3-4 hours)
3. **Integrate frontend**: Verify JWT flow, error handling (1-2 hours)
4. **Docker + deployment**: Containerize and deploy to HF Spaces (1-2 hours)
5. **Time-permitting**: Add US3 (filtering/sorting), Polish, Tests, Documentation

**Total MVP Time**: ~8-12 hours for 2 developers working in parallel

---

## Task Completion Checklist

### Phase 1 Checklist
- [ ] Project structure created
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Git repository initialized
- [ ] FastAPI app boots

### Phase 2 Checklist
- [ ] Database connectivity verified
- [ ] Task model defined
- [ ] Pydantic models defined
- [ ] JWT validation working
- [ ] Ownership checks in place
- [ ] Error handling configured

### Phase 3 (US1) Checklist
- [ ] GET /api/{user_id}/tasks working (all, pending, completed filters; sorting)
- [ ] POST /api/{user_id}/tasks working (create with validation)
- [ ] Tests passing (isolation verified)
- [ ] Frontend can call endpoints

### Phase 4 (US2) Checklist
- [ ] GET /api/{user_id}/tasks/{task_id} working
- [ ] PUT /api/{user_id}/tasks/{task_id} working (update with validation)
- [ ] PATCH /api/{user_id}/tasks/{task_id}/complete working
- [ ] DELETE /api/{user_id}/tasks/{task_id} working (204 response)
- [ ] Tests passing (isolation verified)

### Phase 5 (US3) Checklist
- [ ] Filtering (status param) validated and working
- [ ] Sorting (sort param) validated and working
- [ ] Invalid params return 422
- [ ] Tests passing

### Phase 6 (US4) Checklist
- [ ] JWT validation on all endpoints
- [ ] Ownership checks on all endpoints
- [ ] CORS configured for frontend
- [ ] Error responses are descriptive
- [ ] Frontend can successfully authenticate and call all endpoints
- [ ] No cross-user data leakage (isolation verified)

### Phase 7 (Docker) Checklist
- [ ] Dockerfile builds successfully
- [ ] Container starts with docker-compose up
- [ ] Health check passes
- [ ] Endpoints accessible at http://localhost:8000
- [ ] Hot reload works (for local dev)
- [ ] HF Spaces variant ready (port 7860)

### Phase 8 (Polish) Checklist
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Performance validated
- [ ] Security validated
- [ ] OpenAPI schema available at /docs
- [ ] Logging working
- [ ] Database indexes verified

---

## Success Metrics (Definition of Done)

- ✅ All 45 tasks completed
- ✅ All endpoints tested (integration tests pass, no cross-user data leakage)
- ✅ All validation working (422 errors for invalid input)
- ✅ All error codes correct (401, 403, 404, etc.)
- ✅ JWT validation working (401 for invalid, 403 for mismatch)
- ✅ Multi-user isolation verified (User A cannot see User B's tasks)
- ✅ Docker builds and runs locally
- ✅ HF Spaces deployment-ready
- ✅ Performance targets met (<100ms GET, <50ms POST/PUT/PATCH/DELETE, <5ms JWT)
- ✅ Documentation complete (README, ARCHITECTURE, DEPLOYMENT)
- ✅ All code committed to `003-backend-api-tasks` branch
- ✅ PR ready for review

