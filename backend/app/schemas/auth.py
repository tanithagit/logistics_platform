from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

# --- Request Schemas (data coming IN) ---

class RegisterRequest(BaseModel):
    """Data needed to register a new organization + admin user"""
    # Organization details
    org_name: str
    org_email: EmailStr
    org_phone: str = None
    org_address: str = None

    # Admin user details
    full_name: str
    email: EmailStr
    password: str
    phone: str = None

class LoginRequest(BaseModel):
    """Data needed to login"""
    email: EmailStr
    password: str

class CreateUserRequest(BaseModel):
    """Admin creates a driver or customer"""
    full_name: str
    email: EmailStr
    password: str
    phone: str = None
    role: UserRole  # driver or customer

# --- Response Schemas (data going OUT) ---

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    organization_id: int

    class Config:
        from_attributes = True  # allows reading from SQLAlchemy models

class TokenResponse(BaseModel):
    """Returned after successful login"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class MessageResponse(BaseModel):
    message: str