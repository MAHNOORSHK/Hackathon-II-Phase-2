# Backend Architecture

## System Overview

Frontend (Next.js + Better Auth) sends JWT in Authorization header.
Backend validates JWT, extracts user_id from "sub" claim.
Verifies path user_id matches JWT user_id (403 if mismatch).
Queries database filtered by user_id (no cross-user data access).
Returns TaskResponse in JSON format.

## Stateless Authentication Flow

1. Frontend Sign-In: Better Auth generates JWT with sub=user_id
2. Frontend API Call: Includes Authorization: Bearer <JWT> header
3. Backend Validation: Decode JWT, extract user_id, verify signature
4. Ownership Check: Path {user_id} must match JWT["sub"]
5. Business Logic: Query tasks WHERE user_id = current_user_id
6. Response: Return task data as JSON

Key: Each backend instance validates JWT independently (stateless).

## Data Model

Task Entity:
- id: int (primary key, auto-increment)
- user_id: str (index, no foreign key to Better Auth)
- title: str (1-200 chars)
- description: str (optional, max 1000 chars)
- completed: bool (default false, indexed)
- created_at: datetime (default now(), immutable)
- updated_at: datetime (default now(), auto-update)

Indexes:
- tasks(user_id): Fast filtering by user
- tasks(completed): Fast filtering by status

## API Endpoints (6 total)

GET    /api/{user_id}/tasks                  - List tasks (with filtering/sorting)
POST   /api/{user_id}/tasks                  - Create task
GET    /api/{user_id}/tasks/{task_id}        - Get task detail
PUT    /api/{user_id}/tasks/{task_id}        - Update task
PATCH  /api/{user_id}/tasks/{task_id}/complete - Toggle completion
DELETE /api/{user_id}/tasks/{task_id}        - Delete task

All endpoints require JWT Bearer token and path user_id verification.

## Security Model

- JWT Validation: PyJWT decode + signature check on every request
- Ownership Check: Path {user_id} == JWT["sub"] (403 if mismatch)
- Data Isolation: WHERE user_id = current_user_id on all queries
- SQL Injection Prevention: SQLModel ORM with parameterized queries
- CORS: Allow localhost:3000 and localhost
- Error Messages: User-friendly, no internal details exposed

## Performance

- GET /tasks: <100ms (typical user)
- POST/PUT/PATCH/DELETE: <50ms
- JWT validation: <5ms
- Connection pooling: 5 connections, 10 overflow
- Indexes on user_id and completed for fast queries

## Error Codes

- 400: Bad Request (malformed JSON)
- 401: Unauthorized (missing/invalid/expired JWT)
- 403: Forbidden (user_id path mismatch)
- 404: Not Found (task not found or not owned)
- 422: Unprocessable Entity (validation error)
- 500: Internal Server Error (database error)

## Database

Neon Serverless PostgreSQL with SSL/TLS:
- NEON_DB_URL: postgresql://user:pwd@host/dbname?sslmode=require
- Auto-schema creation on startup via SQLModel.metadata.create_all()
- Connection pooling handles concurrent requests
- No migrations required for MVP

## Logging

- INFO: Task operations, successful API calls
- WARNING: JWT failures, task not found, ownership mismatches
- ERROR: Database errors, unexpected exceptions
- Never log: Tokens, passwords, credentials

## Deployment

Local: docker-compose up (port 8000, hot reload)
HF Spaces: Port 7860, secrets via Space settings, read-only filesystem

Both use same database (Neon PostgreSQL) and authentication (JWT).
