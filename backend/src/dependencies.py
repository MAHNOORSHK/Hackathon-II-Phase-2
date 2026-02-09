"""Dependency injection for FastAPI: JWT validation, database session, current user"""

import os
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import jwt

logger = logging.getLogger(__name__)
security = HTTPBearer()

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")

if not BETTER_AUTH_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable not set")


async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> str:
    """
    JWT validation dependency: decode token, extract user_id from 'sub' claim.
    Returns user_id if token is valid, raises HTTPException (401) if invalid/expired.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("JWT token missing 'sub' claim")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID (sub claim)"
            )
        return user_id
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"JWT validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        logger.error(f"Unexpected error in JWT validation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def validate_ownership(path_user_id: str, current_user_id: str):
    """
    Ownership validation: verify path user_id matches JWT user_id.
    Raises HTTPException (403) if mismatch.
    """
    if path_user_id != current_user_id:
        logger.warning(f"Ownership check failed: path={path_user_id}, jwt={current_user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )
