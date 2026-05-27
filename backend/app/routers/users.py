from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import require_admin, get_current_user
from app.models.user import UserRole
from app.schemas.user import (
    UserCreateRequest,
    UserUpdateRequest,
    UserResponse
)
from app.services import user_service

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("/drivers", response_model=List[UserResponse])
def get_drivers(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all drivers in admin's organization
    Requires: admin role
    """
    return user_service.get_all_users(
        current_user.organization_id,
        UserRole.driver,
        db
    )

@router.get("/customers", response_model=List[UserResponse])
def get_customers(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all customers in admin's organization
    Requires: admin role
    """
    return user_service.get_all_users(
        current_user.organization_id,
        UserRole.customer,
        db
    )

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get a specific user by ID"""
    return user_service.get_user_by_id(
        user_id,
        current_user.organization_id,
        db
    )

@router.post("/", response_model=UserResponse)
def create_user(
    data: UserCreateRequest,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin creates a new driver or customer
    Requires: admin role
    """
    return user_service.create_user(
        data,
        current_user.organization_id,
        db
    )

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdateRequest,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin updates a user"""
    return user_service.update_user(
        user_id,
        data,
        current_user.organization_id,
        db
    )

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin deletes a user"""
    return user_service.delete_user(
        user_id,
        current_user.organization_id,
        db
    )