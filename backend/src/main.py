from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import engine, create_db_and_tables
from .routes.tasks import router as tasks_router
from .routes.auth import router as auth_router
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the FastAPI app
app = FastAPI(title="Todo API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers
app.include_router(auth_router)
app.include_router(tasks_router)

@app.on_event("startup")
def on_startup():
    # Create database tables
    logger.info("Creating database tables...")
    create_db_and_tables()
    logger.info("Database tables created/verified")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 7860)),
        reload=True
    )