from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from datetime import datetime
from typing import Optional

class UserCreateRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: UserRole

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    organization_id: int
    is_active: str
    created_at: datetime

    class Config:
        from_attributes = True