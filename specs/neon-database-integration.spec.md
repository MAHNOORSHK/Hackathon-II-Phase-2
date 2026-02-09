# Neon Database Integration Specification

## Overview
This document specifies the Neon PostgreSQL database integration for the Todo Web Application. The system uses Neon as the primary database for storing user accounts and task data with secure, scalable cloud infrastructure.

## Database Configuration

### Connection Details
- **Database Provider**: Neon PostgreSQL
- **Connection URL Format**: `postgresql://username:password@endpoint/database?sslmode=require&channel_binding=require`
- **Environment Variable**: `NEON_DB_URL`
- **Example**: `postgresql://neondb_owner:password@ep-bitter-mountain-a7c5kvdr-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

### Security Configuration
- SSL Mode: `require`
- Channel Binding: `require`
- Connection Pooling: Enabled
- Connection Timeout: 30 seconds

## Database Schema

### User Table
```sql
CREATE TABLE user (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    emailVerified TIMESTAMP,
    image TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) DEFAULT 'user',
    banned BOOLEAN DEFAULT false,
    banReason TEXT,
    banExpires TIMESTAMP
);
```

### Task Table
```sql
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

### Indexes
- Index on `user.id` (Primary Key)
- Index on `task.user_id` (Foreign Key)
- Index on `task.completed` (Query Optimization)
- Index on `task.created_at` (Sorting)

## API Integration

### Authentication Flow
1. User authenticates via Better Auth
2. JWT token contains user ID in `sub` claim
3. Backend validates JWT using `BETTER_AUTH_SECRET`
4. Path user ID must match JWT user ID (`user_id` in URL matches `payload["sub"]`)
5. Database operations restricted to authenticated user's data only

### Task Operations
- **GET /api/{user_id}/tasks**: Retrieve user's tasks
- **POST /api/{user_id}/tasks**: Create new task for user
- **GET /api/{user_id}/tasks/{task_id}**: Get specific task
- **PUT /api/{user_id}/tasks/{task_id}**: Update task
- **DELETE /api/{user_id}/tasks/{task_id}**: Delete task
- **PATCH /api/{user_id}/tasks/{task_id}/complete**: Toggle completion

## Data Flow

### Creating a Task
1. Frontend sends POST request to `/api/{user_id}/tasks`
2. Authorization header contains JWT token
3. Backend validates JWT and user ownership
4. Task is inserted into Neon database with user_id
5. Response returns created task with assigned ID

### Retrieving Tasks
1. Frontend sends GET request to `/api/{user_id}/tasks`
2. Authorization header contains JWT token
3. Backend validates JWT and user ownership
4. Database query filters by user_id
5. Response returns user's tasks

## Security Measures

### Data Isolation
- Each user can only access their own tasks
- Foreign key constraints enforce user-task relationships
- API endpoints validate user_id matches JWT token
- No cross-user data access permitted

### Connection Security
- All connections use SSL encryption
- Credentials stored in environment variables
- No hardcoded database credentials in code
- Connection pooling with secure parameters

## Error Handling

### Database Errors
- Connection failures return 500 status
- Query timeouts return 500 status
- Constraint violations return 400 status
- Authentication failures return 401 status
- Authorization failures return 403 status

### Retry Logic
- Connection retry attempts: 3
- Retry delay: 1 second between attempts
- Failover: None (single Neon endpoint)

## Monitoring & Maintenance

### Connection Monitoring
- Active connection count
- Query response times
- Error rate tracking
- Slow query detection

### Backup Strategy
- Neon automatic daily backups
- Point-in-time recovery enabled
- Retention period: 7 days

## Performance Considerations

### Query Optimization
- Proper indexing on foreign keys
- Efficient filtering by user_id
- Pagination for large result sets
- Connection pooling for efficiency

### Scalability
- Neon serverless compute scaling
- Automatic connection pooling
- Read replicas (if needed)
- Horizontal partitioning (future consideration)

## Environment Variables

### Required Variables
```env
NEON_DB_URL=postgresql://username:password@endpoint/database?sslmode=require
BETTER_AUTH_SECRET=your-jwt-secret-key
```

### Optional Variables
```env
DB_POOL_SIZE=10
DB_POOL_TIMEOUT=30
DB_STATEMENT_TIMEOUT=30000
```

## Testing Strategy

### Unit Tests
- Database connection tests
- Model validation tests
- Query execution tests
- Transaction tests

### Integration Tests
- Full CRUD operations
- Authentication flow
- User isolation validation
- Error condition tests

## Deployment Notes

### Production Deployment
- Use Neon production branch
- Enable connection pooling
- Set up monitoring alerts
- Configure backup retention

### Development Deployment
- Use Neon development branch
- Lower connection limits
- Query logging enabled
- Less restrictive timeouts

## Troubleshooting

### Common Issues
- SSL connection problems
- Authentication failures
- Connection pool exhaustion
- Query performance issues

### Diagnostic Steps
1. Check NEON_DB_URL validity
2. Verify SSL certificate trust
3. Test direct database connection
4. Review application logs
5. Monitor connection metrics