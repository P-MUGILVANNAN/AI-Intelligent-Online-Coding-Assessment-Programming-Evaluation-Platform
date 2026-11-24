from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

class RoleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class InstitutionResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InstitutionCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    institution_id: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: str = "Student"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    institution_id: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_active: bool
    role: Optional[RoleResponse] = None
    institution: Optional[InstitutionResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
