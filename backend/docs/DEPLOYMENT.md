# Deployment Guide

## Local Development Setup

### Prerequisites
- Python 3.11+
- Docker & Docker Compose (recommended)
- Neon PostgreSQL account with database URL

### Option 1: Docker (Recommended)

1. Build and start container:
```bash
cd backend
docker-compose up --build
```

2. Access API:
- Health check: http://localhost:8000/health
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

3. Hot reload: Edit src/ files, changes auto-reload in container

### Option 2: Native Python

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure .env:
```bash
cp .env.example .env
# Edit .env with actual NEON_DB_URL and BETTER_AUTH_SECRET
```

4. Run application:
```bash
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

5. Access API at http://localhost:8000

## Hugging Face Spaces Deployment

### Step 1: Create Space on HuggingFace
1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Select Docker as the space SDK
4. Name it (e.g., "hackathon-todo-backend")
5. Choose private or public

### Step 2: Upload Backend Code
1. Clone or download the Space repository
2. Copy backend/ directory contents to Space root
3. Ensure Dockerfile is at root level (not in subdirectory)
4. Push to HF repository:
```bash
git add .
git commit -m "Initial backend setup"
git push
```

### Step 3: Set Secrets
1. In Space settings, click "Repository secrets"
2. Add two secrets:
   - `BETTER_AUTH_SECRET`: Copy exact value from backend/.env
   - `NEON_DB_URL`: Copy exact PostgreSQL connection string

### Step 4: Deploy
1. HF Spaces automatically builds Docker image on push
2. Container starts on port 7860 (HF requirement)
3. Secrets injected at runtime via environment variables
4. Space URL: https://huggingface.co/spaces/<username>/<space-name>

### Step 5: Update Frontend
Frontend must call HF Space URL instead of localhost:
- Local dev: http://localhost:8000/api/{user_id}/tasks
- Production: https://huggingface.co/spaces/<username>/<space-name>/api/{user_id}/tasks

## Testing Deployment

### Health Check
```bash
curl http://localhost:8000/health
# Response: {"status": "ok"}
```

### Create Task (with valid JWT)
```bash
curl -X POST http://localhost:8000/api/test-user/tasks \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task"}'
```

### List Tasks
```bash
curl http://localhost:8000/api/test-user/tasks \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Run Tests
```bash
cd backend
pytest tests/ -v
```

## Docker Configuration

### Dockerfile Breakdown
- Base: python:3.11-slim (lightweight, secure)
- Install: gcc (for psycopg2), postgresql-client (for debugging)
- Copy: requirements.txt, src/, .env
- Non-root user: appuser (security)
- Expose: Port 8000 (local) or 7860 (HF Spaces)
- Healthcheck: GET /health every 30s
- Command: uvicorn src.main:app --host 0.0.0.0 --port 8000

### docker-compose.yml Breakdown
- Service: backend (builds from Dockerfile)
- Port mapping: 8000:8000 (local)
- Environment: .env file loaded
- Volumes: ./src:/app/src (hot reload)
- Healthcheck: curl http://localhost:8000/health
- Restart: unless-stopped

### Environment Variables for HF Spaces
HF Spaces supports "Secrets" (environment variables):
- Stored securely (not in repository)
- Injected at runtime
- Accessible as os.getenv("SECRET_NAME")

## Production Considerations

### Database
- Neon PostgreSQL: Managed serverless database
- SSL/TLS: sslmode=require in connection string
- Connection pooling: Handled by SQLAlchemy
- No migrations: Schema auto-created on startup

### Security
- JWT validation: On every request (stateless)
- User isolation: Database query filters by user_id
- CORS: Configured for frontend origins
- No secrets in code: All from environment

### Scaling
- Stateless API: Multiple instances can run in parallel
- JWT validation: Independent per instance (no shared state)
- Database: Single Neon PostgreSQL for all instances
- Load balancer: Can route requests to any instance

### Monitoring
- Healthcheck: /health endpoint for deployment monitoring
- Logging: INFO/WARNING/ERROR to stdout
- Errors: Descriptive but user-friendly messages
- Metrics: Track response times, error rates

## Troubleshooting

### "NEON_DB_URL not set"
- Verify .env file exists in backend/ directory
- Check that NEON_DB_URL is not commented out
- For HF Spaces, verify secret is set in Space settings

### "Database connection failed"
- Test connection manually: psql "postgresql://..."
- Check SSL mode: sslmode=require in URL
- Verify Neon database is online
- Check firewall/network access to Neon

### "JWT validation failed"
- Verify BETTER_AUTH_SECRET matches frontend's value
- Check token format: Bearer <TOKEN> in header
- Verify token is not expired (exp claim)
- Enable logging to debug: LOG_LEVEL=DEBUG

### "Container fails to build"
- Check Dockerfile syntax
- Verify all files copied exist (src/, requirements.txt, .env)
- Review docker-compose.yml for typos
- Run docker-compose up --build -v for verbose output

### "Hot reload not working"
- Verify volume mount in docker-compose.yml: ./src:/app/src
- Ensure code changes are saved to disk
- Check that container is running: docker ps
- Restart container: docker-compose restart

## Rollback Strategy

### Local Development
- Git branch: Revert to previous commit
- Docker: Build previous image or use docker-compose down

### HF Spaces
- Git: Revert commit and push
- HF auto-rebuilds and deploys new image
- Space URL remains same but runs previous code

## Next Steps

1. ✅ Backend code implemented
2. ✅ Tests passing (multi-user isolation verified)
3. ✅ Docker configured (local + HF Spaces)
4. ⏳ Deploy to HF Spaces
5. ⏳ Frontend integration testing
6. ⏳ End-to-end validation

For issues or questions, refer to:
- README.md: Setup and API reference
- ARCHITECTURE.md: System design and security
- docs/: Additional documentation
