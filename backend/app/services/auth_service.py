from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterRequest, LoginRequest

def register_organization(data: RegisterRequest, db: Session):
    """
    Register a new organization with an admin user
    This is how a new company joins the platform
    """

    # Check if organization email already exists
    existing_org = db.query(Organization).filter(
        Organization.email == data.org_email
    ).first()
    if existing_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization with this email already exists"
        )

    # Check if user email already exists
    existing_user = db.query(User).filter(
        User.email == data.email
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Step 1: Create the organization
    organization = Organization(
        name=data.org_name,
        email=data.org_email,
        phone=data.org_phone,
        address=data.org_address
    )
    db.add(organization)
    db.flush()  # flush to get the organization id without committing

    # Step 2: Create the admin user for this organization
    admin_user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=UserRole.admin,
        organization_id=organization.id
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    return {
        "message": f"Organization '{organization.name}' registered successfully",
        "user_id": admin_user.id,
        "org_id": organization.id
    }

def login_user(data: LoginRequest, db: Session):
    """
    Login with email and password
    Returns JWT token on success
    """

    # Find user by email
    user = db.query(User).filter(User.email == data.email).first()

    # Check if user exists and password is correct
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Create JWT token with user info
    token = create_access_token(data={
        "sub": user.email,           # subject = who this token belongs to
        "role": user.role.value,     # their role
        "org_id": user.organization_id,  # their organization
        "user_id": user.id
    })

    return {
    "access_token": token,
    "token_type": "bearer",
    "user": {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "organization_id": user.organization_id
    }
}
    }

def create_user_by_admin(
    data,
    organization_id: int,
    db: Session
):
    """
    Admin creates a new driver or customer in their organization
    """

    # Check if email already taken
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
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