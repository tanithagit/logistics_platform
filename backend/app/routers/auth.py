from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    CreateUserRequest,
    TokenResponse,
    UserResponse,
    MessageResponse
)
from app.services.auth_service import (
    register_organization,
    login_user,
    create_user_by_admin
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new company (organization) with an admin user
    No authentication required - this is how you join the platform
    """
    return register_organization(data, db)

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password
    Returns a JWT token to use in future requests
    """
    return login_user(data, db)

@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user = Depends(get_current_user)):
    """
    Get currently logged in user's profile
    Requires: any authenticated user
    """
    return current_user

@router.post("/users", response_model=UserResponse)
def create_user(
    data: CreateUserRequest,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin creates a new driver or customer in their organization
    Requires: admin role
    """
    return create_user_by_admin(data, current_user.organization_id, db)