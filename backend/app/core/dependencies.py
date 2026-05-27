from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole

# This reads the Bearer token from request headers
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Extract and verify the JWT token from request
    Returns the current logged-in user
    """
    token = credentials.credentials

    # Decode the token
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # Get user from database
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Only allows admin users"""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_driver(current_user: User = Depends(get_current_user)) -> User:
    """Only allows driver users"""
    if current_user.role != UserRole.driver:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Driver access required"
        )
    return current_user

def require_customer(current_user: User = Depends(get_current_user)) -> User:
    """Only allows customer users"""
    if current_user.role != UserRole.customer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer access required"
        )
    return current_user

def require_admin_or_driver(current_user: User = Depends(get_current_user)) -> User:
    """Allows both admin and driver"""
    if current_user.role not in [UserRole.admin, UserRole.driver]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Driver access required"
        )
    return current_user