# Hackathon Todo Backend

FastAPI-based multi-user task management API with JWT authentication, Neon PostgreSQL, and Docker deployment.

## Quick Start

### Prerequisites
- Python 3.11+
- Docker & Docker Compose (optional, for containerized setup)
- Neon PostgreSQL account with database URL

### Local Setup (Without Docker)

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   # Copy and update .env with actual credentials
   cp .env.example .env
   # Edit .env: set NEON_DB_URL with your database connection
   ```

4. **Run application**
   ```bash
   python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **Access API**
   - API Docs: http://localhost:8000/docs (Swagger UI)
   - ReDoc: http://localhost:8000/redoc
   - Health: http://localhost:8000/health

### Docker Setup (Recommended for Development)

```bash
# Build and start container with hot reload
docker-compose up --build

# Access API at http://localhost:8000
```

## API Endpoints

### Authentication
All endpoints require `Authorization: Bearer <JWT>` header with token from Better Auth.

### Task Endpoints

#### List Tasks
```
GET /api/{user_id}/tasks?status=all|pending|completed&sort=created|title
```
- Query params:
  - `status`: Filter by completion status (default: "all")
  - `sort`: Sort order (default: "created")
- Returns: Array of tasks

#### Create Task
```
POST /api/{user_id}/tasks
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Optional description"
}
```
- Returns: 201 Created with task object
- Validation: title 1-200 chars, description max 1000 chars

#### Get Task Detail
```
GET /api/{user_id}/tasks/{task_id}
```
- Returns: 200 OK with task object, 404 if not found

#### Update Task
```
PUT /api/{user_id}/tasks/{task_id}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```
- Partial update allowed (send only fields to update)
- Returns: 200 OK with updated task

#### Toggle Task Completion
```
PATCH /api/{user_id}/tasks/{task_id}/complete
```
- Toggles completed boolean (false → true or true → false)
- Returns: 200 OK with updated task

#### Delete Task
```
DELETE /api/{user_id}/tasks/{task_id}
```
- Returns: 204 No Content

## Error Handling

| Status | Meaning |
|--------|---------|
| 400 | Bad Request (malformed JSON) |
| 401 | Unauthorized (missing/invalid JWT) |
| 403 | Forbidden (user_id path mismatch) |
| 404 | Not Found (task doesn't exist) |
| 422 | Unprocessable Entity (validation error) |
| 500 | Internal Server Error (database issue) |

## Testing

```bash
# Run all tests
pytest backend/tests/

# Run with coverage
pytest --cov=src backend/tests/

# Run specific test file
pytest backend/tests/test_integration.py

# Run with verbose output
pytest -v backend/tests/
```

## Project Structure

```
backend/
├── src/
│   ├── main.py           # FastAPI app, CORS, routes registration
│   ├── db.py             # Database engine, session management
│   ├── models.py         # SQLModel Task, Pydantic models
│   ├── dependencies.py   # JWT validation, ownership checks
│   └── routes/
│       └── tasks.py      # All 6 task endpoints
├── tests/
│   ├── conftest.py       # pytest fixtures
│   └── test_integration.py # Integration tests
├── docs/
│   ├── ARCHITECTURE.md   # System design
│   └── DEPLOYMENT.md     # Deployment guide
├── Dockerfile            # Container image
├── docker-compose.yml    # Local dev orchestration
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (gitignored)
└── .env.example          # Environment template
```

## Environment Variables

```
BETTER_AUTH_SECRET=<shared-jwt-secret>
NEON_DB_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require
BETTER_AUTH_URL=http://localhost:3000/
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000
```

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX (user_id),
  INDEX (completed)
);
```

## Security

- ✅ JWT validation on every endpoint
- ✅ User ownership enforcement (user_id from JWT must match path)
- ✅ Multi-user isolation (no cross-user data access)
- ✅ SQLModel ORM prevents SQL injection
- ✅ CORS configured for frontend origins
- ✅ No secrets in code (all from .env)
- ✅ Non-root user in Docker

## Performance

- GET /tasks: <100ms (typical user)
- POST/PUT/PATCH/DELETE: <50ms
- JWT validation: <5ms
- Connection pooling: 5 connections, 10 overflow

## Deployment

### Local Development
```bash
docker-compose up
```

### Hugging Face Spaces
1. Create Space on HuggingFace
2. Upload `backend/` directory
3. Set secrets in Space settings:
   - `BETTER_AUTH_SECRET`
   - `NEON_DB_URL`
4. Space auto-builds and deploys on port 7860

See `docs/DEPLOYMENT.md` for detailed instructions.

## Troubleshooting

### "NEON_DB_URL not set"
- Verify `.env` file exists and contains `NEON_DB_URL`
- Ensure database credentials are correct

### "Database connection failed"
- Check SSL/TLS settings in NEON_DB_URL
- Verify Neon database is online
- Test connection: `psql "postgresql://..."`

### Tests failing
- Ensure all dependencies installed: `pip install -r requirements.txt`
- Check JWT secret matches: `BETTER_AUTH_SECRET` in `.env`
- Run with verbose output: `pytest -v`

## Support

For issues, check:
1. `docs/ARCHITECTURE.md` - System design
2. `docs/DEPLOYMENT.md` - Deployment guide
3. API docs at `/docs` endpoint
