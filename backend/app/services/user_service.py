from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.core.security import hash_password
from app.schemas.user import UserCreateRequest, UserUpdateRequest

def get_all_users(
    organization_id: int,
    role: UserRole,
    db: Session
):
    """
    Get all users of a specific role in the organization
    Example: get all drivers, or all customers
    """
    return db.query(User).filter(
        User.organization_id == organization_id,
        User.role == role
    ).all()

def get_user_by_id(
    user_id: int,
    organization_id: int,
    db: Session
):
    """
    Get a specific user — must belong to same organization
    This enforces multi-tenant isolation
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == organization_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in your organization"
        )
    return user

def create_user(
    data: UserCreateRequest,
    organization_id: int,
    db: Session
):
    """Admin creates a driver or customer"""

    # Check email not already taken
    existing = db.query(User).filter(
        User.email == data.email
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Admin cannot create another admin
    if data.role == UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create another admin user"
        )

    new_user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=data.role,
        organization_id=organization_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def update_user(
    user_id: int,
    data: UserUpdateRequest,
    organization_id: int,
    db: Session
):
    """Admin updates a user's details"""
    user = get_user_by_id(user_id, organization_id, db)

    # Only update fields that were provided
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.phone is not None:
        user.phone = data.phone
    if data.is_active is not None:
        user.is_active = str(data.is_active)

    db.commit()
    db.refresh(user)
    return user

def delete_user(
    user_id: int,
    organization_id: int,
    db: Session
):
    """Admin deletes a user"""
    user = get_user_by_id(user_id, organization_id, db)
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}