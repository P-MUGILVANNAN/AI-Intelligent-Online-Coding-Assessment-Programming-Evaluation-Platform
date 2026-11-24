from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User, Role, Institution
from app.schemas.user import UserResponse, UserCreate, UserUpdate, RoleResponse, InstitutionResponse, InstitutionCreate
from app.api.deps import get_current_user, require_admin, require_instructor_or_admin

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("", response_model=List[UserResponse])
def get_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor_or_admin)
):
    query = db.query(User)
    if role:
        query = query.join(Role).filter(Role.name == role)
    if search:
        query = query.filter((User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")))
    return query.offset(offset).limit(limit).all()

@router.get("/roles", response_model=List[RoleResponse])
def get_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()

@router.get("/institutions", response_model=List[InstitutionResponse])
def get_institutions(db: Session = Depends(get_db)):
    return db.query(Institution).all()

@router.post("/institutions", response_model=InstitutionResponse)
def create_institution(
    req: InstitutionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing = db.query(Institution).filter(Institution.code == req.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Institution code already exists")
    inst = Institution(name=req.name, code=req.code, description=req.description)
    db.add(inst)
    db.commit()
    db.refresh(inst)
    return inst

@router.get("/{id}", response_model=UserResponse)
def get_user_by_id(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Check permission
    is_admin = current_user.role and current_user.role.name == "Administrator"
    if current_user.id != id and not is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    return user

@router.put("/{id}", response_model=UserResponse)
def update_user(
    id: str,
    req: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    is_admin = current_user.role and current_user.role.name == "Administrator"
    if current_user.id != id and not is_admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    if req.full_name is not None:
        user.full_name = req.full_name
    if req.bio is not None:
        user.bio = req.bio
    if req.avatar_url is not None:
        user.avatar_url = req.avatar_url
    if req.institution_id is not None:
        user.institution_id = req.institution_id
    if req.password is not None and req.password.strip():
        user.password_hash = get_password_hash(req.password)
    
    # Admin-only fields
    if is_admin:
        if req.is_active is not None:
            user.is_active = req.is_active
        if req.role is not None:
            r = db.query(Role).filter(Role.name == req.role).first()
            if r:
                user.role_id = r.id

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{id}")
def delete_user(id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own administrative account")
    
    # Soft delete (deactivate) or hard delete
    user.is_active = False
    db.commit()
    return {"message": "User account deactivated successfully"}
