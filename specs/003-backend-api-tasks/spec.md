# Feature Specification: FastAPI Backend for Multi-User Tasks API

**Feature Branch**: `003-backend-api-tasks`
**Created**: 2026-02-07
**Status**: Draft
**Input**: Expert FastAPI + SQLModel + Docker backend developer for hackathon-todo Phase II multi-user Todo web app. Build COMPLETE backend based on hackathon document requirements, ensuring full integration with frontend (Next.js with Better Auth + JWT).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Creates and Lists Their Tasks (Priority: P1)

An authenticated user can create new tasks with title and optional description, then view all their tasks with filtering by status and sorting options. Each user sees only their own tasks.

**Why this priority**: This is the core MVP functionality—users must be able to create and list tasks. Without this, the app has no value.

**Independent Test**: Can be fully tested by creating a task, retrieving it, and verifying ownership enforcement. Delivers core todo functionality.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** POST /api/{user_id}/tasks with valid title, **Then** task is created with completed=false, timestamps set, and 201 returned with task details
2. **Given** an authenticated user, **When** GET /api/{user_id}/tasks, **Then** all user's tasks returned (not other users' tasks)
3. **Given** user_id mismatch (path vs. JWT), **When** accessing /api/{other_user_id}/tasks, **Then** 403 Forbidden returned
4. **Given** missing or invalid Bearer token, **When** GET /api/{user_id}/tasks, **Then** 401 Unauthorized returned
5. **Given** no tasks exist for user, **When** GET /api/{user_id}/tasks, **Then** empty array returned with 200

---

### User Story 2 - User Manages Individual Tasks (Priority: P1)

An authenticated user can retrieve a specific task, update its title/description, toggle completion status, and delete it. All operations are user-scoped.

**Why this priority**: Full CRUD on individual tasks is essential for core functionality. Users need to manage their tasks completely.

**Independent Test**: Can be fully tested by GET, PUT, PATCH, DELETE on a single task with ownership validation. Delivers individual task management.

**Acceptance Scenarios**:

1. **Given** authenticated user owns a task, **When** GET /api/{user_id}/tasks/{task_id}, **Then** task details returned with 200
2. **Given** authenticated user, **When** PUT /api/{user_id}/tasks/{task_id} with new title, **Then** title updated, updated_at changed, 200 returned
3. **Given** authenticated user, **When** PATCH /api/{user_id}/tasks/{task_id}/complete, **Then** completed toggled (false→true or true→false), 200 returned
4. **Given** authenticated user, **When** DELETE /api/{user_id}/tasks/{task_id}, **Then** task removed, 204 No Content returned
5. **Given** user does not own task, **When** PUT /api/{user_id}/tasks/{other_task_id}, **Then** 404 Not Found returned
6. **Given** invalid task_id format or non-existent ID, **When** GET /api/{user_id}/tasks/{task_id}, **Then** 404 Not Found returned

---

### User Story 3 - User Filters and Sorts Tasks (Priority: P2)

An authenticated user can filter tasks by completion status (all/pending/completed) and sort by creation date or title. This improves task discovery and organization.

**Why this priority**: Secondary feature that enhances UX and productivity but is not blocking. Users can still function without filtering/sorting initially.

**Independent Test**: Can be fully tested by querying /api/{user_id}/tasks with status and sort params, verifying result sets match filter/sort criteria.

**Acceptance Scenarios**:

1. **Given** user has mixed pending/completed tasks, **When** GET /api/{user_id}/tasks?status=pending, **Then** only incomplete tasks returned
2. **Given** user has mixed pending/completed tasks, **When** GET /api/{user_id}/tasks?status=completed, **Then** only completed tasks returned
3. **Given** user has tasks, **When** GET /api/{user_id}/tasks?status=all, **Then** all tasks returned (same as no filter)
4. **Given** user has tasks, **When** GET /api/{user_id}/tasks?sort=created, **Then** tasks sorted by created_at ascending
5. **Given** user has tasks, **When** GET /api/{user_id}/tasks?sort=title, **Then** tasks sorted by title alphabetically
6. **Given** invalid status param, **When** GET /api/{user_id}/tasks?status=invalid, **Then** 422 Unprocessable Entity returned
7. **Given** invalid sort param, **When** GET /api/{user_id}/tasks?sort=invalid, **Then** 422 Unprocessable Entity returned

---

### User Story 4 - Frontend Integrates with Backend (Priority: P2)

The frontend (Next.js + Better Auth) successfully authenticates users, receives JWT tokens, includes them in API requests, and handles responses/errors gracefully.

**Why this priority**: Integration validation ensures frontend-backend contract works. Without this, the system cannot function end-to-end.

**Independent Test**: Can be fully tested by frontend making authenticated requests and verifying successful responses and proper error handling.

**Acceptance Scenarios**:

1. **Given** frontend obtains JWT from Better Auth, **When** frontend includes "Authorization: Bearer <JWT>" in request, **Then** backend accepts and verifies token
2. **Given** JWT contains sub (user_id), **When** backend extracts user_id and compares to path, **Then** ownership check passes for matching IDs
3. **Given** frontend sends invalid/expired JWT, **When** backend validates token, **Then** 401 Unauthorized returned
4. **Given** successful task creation, **When** frontend receives response, **Then** response contains task ID and timestamps
5. **Given** API error occurs, **When** frontend receives error response, **Then** response includes status code and error message

---

### Edge Cases

- What happens when task title is empty or exceeds 200 characters? → 422 Unprocessable Entity with validation error
- What happens when description exceeds 1000 characters? → 422 Unprocessable Entity with validation error
- What happens when user_id in path does not match user_id extracted from JWT? → 403 Forbidden (authorization failure, not 401)
- What happens when task_id doesn't exist for the authenticated user? → 404 Not Found
- What happens when updating a task with no fields changed (PUT with same data)? → 200 OK with updated_at unchanged (idempotent)
- What happens when database connection fails? → 500 Internal Server Error with appropriate message
- What happens when token is missing entirely vs. malformed? → Both return 401 Unauthorized (distinguish in logs if needed)
- What happens during concurrent updates to the same task? → Last write wins; no locking required (acceptable for MVP)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a FastAPI application with CORS enabled for frontend requests from http://localhost:3000 and http://localhost
- **FR-002**: System MUST create and manage PostgreSQL database schema automatically on startup (users, tasks tables with indexes)
- **FR-003**: System MUST validate JWT tokens using PyJWT with BETTER_AUTH_SECRET (shared key from Better Auth)
- **FR-004**: System MUST extract user_id (sub claim) from JWT and enforce ownership (path user_id must match JWT sub)
- **FR-005**: System MUST return 401 Unauthorized for missing or invalid JWT tokens
- **FR-006**: System MUST return 403 Forbidden when path user_id does not match authenticated user_id
- **FR-007**: System MUST enforce that users can only see, create, update, and delete their own tasks
- **FR-008**: System MUST support GET /api/{user_id}/tasks to list tasks with query params: status (all|pending|completed), sort (created|title)
- **FR-009**: System MUST support POST /api/{user_id}/tasks to create tasks with required title (1-200 chars) and optional description (max 1000 chars)
- **FR-010**: System MUST support GET /api/{user_id}/tasks/{task_id} to retrieve a single task (404 if not owned or not found)
- **FR-011**: System MUST support PUT /api/{user_id}/tasks/{task_id} to update title and/or description (422 for validation errors, 404 if not owned)
- **FR-012**: System MUST support PATCH /api/{user_id}/tasks/{task_id}/complete to toggle completed status (200 with updated task)
- **FR-013**: System MUST support DELETE /api/{user_id}/tasks/{task_id} returning 204 No Content (404 if not owned)
- **FR-014**: System MUST return 422 Unprocessable Entity for invalid request payloads (Pydantic validation)
- **FR-015**: System MUST use timestamps (created_at, updated_at) on all tasks; created_at immutable, updated_at set on creation/update
- **FR-016**: System MUST index tasks on user_id and completed columns for query performance
- **FR-017**: System MUST run on 0.0.0.0:8000 inside Docker container with hot reload support in development
- **FR-018**: System MUST connect to Neon Serverless PostgreSQL using provided NEON_DB_URL
- **FR-019**: System MUST use SQLModel (SQL + Pydantic) for ORM and schema definition
- **FR-020**: System MUST include comprehensive error handling with HTTPException and appropriate status codes (400, 401, 403, 404, 422, 500)

### Key Entities

- **Task**: Represents a single todo item owned by a user. Attributes: id (int PK, auto-increment), user_id (str FK to users.id), title (str, required, 1-200 chars), description (str, optional, max 1000 chars), completed (bool, default false), created_at (timestamp, immutable), updated_at (timestamp, auto-update). Indexes on user_id and completed for filtering.
- **User**: Minimal reference entity managed by Better Auth. Attributes: id (str/UUID PK), name (optional), email (optional). Backend does not create/modify users; references them via user_id in JWT.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 API endpoints (GET list, POST create, GET detail, PUT update, PATCH complete, DELETE) respond within 200ms under normal load
- **SC-002**: JWT validation and ownership checks execute in <10ms per request
- **SC-003**: Frontend can authenticate, receive JWT, and successfully call all endpoints with correct responses
- **SC-004**: Multi-user isolation verified: User A cannot access/modify User B's tasks (ownership enforced at database query level)
- **SC-005**: System handles 100 concurrent users creating/listing/updating tasks simultaneously without errors
- **SC-006**: All validation (title length, description length, status/sort params, JWT claims) produces 422 or 401 errors (no 500 for input errors)
- **SC-007**: Database auto-creates on startup and migrations/schema changes are idempotent
- **SC-008**: Docker container builds, starts, and connects to Neon PostgreSQL within 30 seconds
- **SC-009**: 100% of Pydantic request/response models are type-safe and documented
- **SC-010**: All error responses include descriptive messages (e.g., "Task not found", "Invalid token")

## Non-Functional Requirements

### Performance

- List endpoint (GET /api/{user_id}/tasks) returns results in <100ms for typical user (< 1000 tasks)
- Create/Update/Delete endpoints execute in <50ms
- JWT decode and validation occurs in <5ms per request
- Database indexes on user_id and completed ensure O(1) or O(log n) lookups

### Security

- JWT tokens validated with BETTER_AUTH_SECRET; no token reuse or storage in backend
- Ownership checks prevent cross-user data access (mandatory on all endpoints)
- No SQL injection: SQLModel ORM prevents injection via parameterized queries
- No hardcoded secrets in code; use .env for NEON_DB_URL and BETTER_AUTH_SECRET
- CORS restricted to frontend origins (http://localhost:3000, http://localhost)
- All error messages are user-friendly; internal errors logged but not exposed to client

### Reliability

- Database connectivity errors result in 500 Internal Server Error with retry guidance
- Missing required fields return 422 Unprocessable Entity (clear validation messages)
- Invalid JWT returns 401 Unauthorized; token refresh handled by frontend (Better Auth)
- No cascading task deletes affecting other users (tasks are isolated by user_id)

### Scalability

- Support for multiple concurrent users without global state
- Stateless API: each request is independent
- Database connection pooling via SQLAlchemy to handle concurrent requests
- Neon serverless handles scaling; backend ensures efficient queries

## Data Model & Storage

- **Database**: Neon Serverless PostgreSQL (managed, no backend migration responsibility)
- **Schema**: tasks table (id, user_id, title, description, completed, created_at, updated_at), users referenced via FK
- **Indexes**: tasks(user_id), tasks(completed) for filter performance
- **Relationships**: Tasks belong to users; users can own multiple tasks
- **Constraints**: user_id not null, title not null and 1-200 chars, description max 1000 chars, completed not null (default false)

## API Contracts

### Request/Response Models (Pydantic)

**TaskCreate** (POST request body):
- title: str (required, 1-200 chars)
- description: str (optional, max 1000 chars)

**TaskUpdate** (PUT request body):
- title: str (optional, 1-200 chars if provided)
- description: str (optional, max 1000 chars if provided)

**TaskResponse** (all GET endpoints, POST response):
- id: int
- user_id: str
- title: str
- description: str or null
- completed: bool
- created_at: datetime (ISO format)
- updated_at: datetime (ISO format)

**Query Params**:
- status: "all" | "pending" | "completed" (default: "all")
- sort: "created" | "title" (default: "created")

**Error Response**:
- status_code: int
- detail: str (human-readable error message)

### Status Codes

- **200 OK**: GET/PUT/PATCH successful
- **201 Created**: POST successful
- **204 No Content**: DELETE successful
- **400 Bad Request**: Malformed request (e.g., invalid JSON)
- **401 Unauthorized**: Missing, invalid, or expired JWT
- **403 Forbidden**: JWT valid but user_id mismatch
- **404 Not Found**: Task doesn't exist or not owned by user
- **422 Unprocessable Entity**: Validation error (title/description length, invalid query params)
- **500 Internal Server Error**: Unexpected server error (database failure, etc.)

## Assumptions

1. **Better Auth Shared Secret**: BETTER_AUTH_SECRET is shared and immutable; no rotation logic required for MVP
2. **JWT Format**: Token is standard JWT (Bearer scheme); frontend handles refresh before expiry
3. **User Creation**: Users are created exclusively by Better Auth; backend never creates users
4. **No Rate Limiting**: MVP does not require rate limiting; can be added post-launch
5. **No Soft Deletes**: Tasks are hard-deleted; no archival or recovery mechanism
6. **Database Availability**: Neon PostgreSQL is the source of truth; no read replicas or caching layer
7. **Time Zone**: All timestamps in UTC; frontend converts for display
8. **Idempotency**: POST creates new task each time (no idempotency key); idempotent for PUT/PATCH with same data
9. **Pagination**: Not required for MVP; assumes typical user has <1000 tasks
10. **Concurrent Updates**: Last-write-wins for simultaneous updates (acceptable for personal task manager)

## Dependencies & Constraints

### External Dependencies

- **Neon PostgreSQL**: Serverless database; backend must handle connection pooling and SSL/TLS
- **Better Auth**: Frontend auth system; backend only validates JWT (no auth server integration)
- **PyJWT Library**: For JWT decoding and verification

### Internal Dependencies

- **FastAPI**: Web framework
- **SQLModel**: ORM combining SQLAlchemy + Pydantic
- **python-dotenv**: Environment variable loading

### Constraints

- Backend is stateless (no session storage)
- User_id must be consistent between JWT (sub) and path
- Tasks cannot be shared between users (no multi-user collaboration)
- No background jobs or async task processing for MVP
- No webhook/pub-sub; frontend polls for updates

## Out of Scope

- User management (registration, password reset, account deletion) - handled by Better Auth
- WebSocket real-time updates - frontend polls API
- Task tagging/categories - MVP supports only basic title/description
- Recurring/recurring tasks
- Task priorities or due dates
- Task history/audit logs
- Analytics or reporting
- Email notifications
- Rate limiting or throttling
- API versioning
- Caching layer (Redis, in-memory)
- Backup/recovery mechanisms

## In Scope

- All 6 API endpoints with full CRUD
- JWT validation and ownership enforcement
- Database schema auto-creation
- Docker containerization
- Input validation (title, description constraints)
- Error handling and appropriate HTTP status codes
- Multi-user isolation
- Query filtering and sorting
- SQLModel ORM with Pydantic validation
