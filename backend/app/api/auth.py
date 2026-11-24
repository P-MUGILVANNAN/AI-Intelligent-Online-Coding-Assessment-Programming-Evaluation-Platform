from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.models.user import User, Role, RefreshToken, Institution
from app.models.analytics import ActivityLog
from app.schemas.auth import (
    LoginRequest, RegisterRequest, Token, RefreshTokenRequest,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.schemas.user import UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Resolve role
    role = db.query(Role).filter(Role.name == req.role).first()
    if not role:
        role = db.query(Role).filter(Role.name == "Student").first()
        if not role:
            role = Role(name="Student", description="Default Student Role")
            db.add(role)
            db.commit()
            db.refresh(role)

    new_user = User(
        full_name=req.full_name,
        email=req.email.lower(),
        password_hash=get_password_hash(req.password),
        role_id=role.id,
        institution_id=req.institution_id,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Activity log
    log = ActivityLog(user_id=new_user.id, action="USER_REGISTER", details={"email": new_user.email, "role": role.name})
    db.add(log)
    db.commit()

    access_token = create_access_token(subject=new_user.id, role=role.name)
    refresh_token = create_refresh_token(subject=new_user.id, role=role.name)

    # Store refresh token
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    rt = RefreshToken(user_id=new_user.id, token=refresh_token, expires_at=expires_at)
    db.add(rt)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": role.name,
            "institution_id": new_user.institution_id
        }
    }

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password combination."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator."
        )

    role_name = user.role.name if user.role else "Student"
    access_token = create_access_token(subject=user.id, role=role_name)
    refresh_token = create_refresh_token(subject=user.id, role=role_name)

    # Store refresh token
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    rt = RefreshToken(user_id=user.id, token=refresh_token, expires_at=expires_at)
    db.add(rt)

    # Activity log
    log = ActivityLog(user_id=user.id, action="USER_LOGIN", details={"email": user.email, "role": role_name})
    db.add(log)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": role_name,
            "institution_id": user.institution_id
        }
    }

@router.post("/refresh", response_model=Token)
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == req.refresh_token,
        RefreshToken.is_revoked == False
    ).first()
    if not db_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has been revoked or expired")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is inactive or no longer exists")

    # Rotate token
    db_token.is_revoked = True
    role_name = user.role.name if user.role else "Student"
    new_access = create_access_token(subject=user.id, role=role_name)
    new_refresh = create_refresh_token(subject=user.id, role=role_name)
    new_rt = RefreshToken(
        user_id=user.id,
        token=new_refresh,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    db.add(new_rt)
    db.commit()

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": role_name,
            "institution_id": user.institution_id
        }
    }

@router.post("/logout")
def logout(req: RefreshTokenRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_token = db.query(RefreshToken).filter(RefreshToken.token == req.refresh_token).first()
    if db_token:
        db_token.is_revoked = True
        db.commit()
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if user:
        # In development/demo, generate a secure reset token
        reset_token = create_access_token(subject=user.id, role="ResetPassword", expires_delta=timedelta(hours=1))
        return {
            "message": "Password reset token generated (in demo environment, returned directly for convenience).",
            "reset_token": reset_token
        }
    return {"message": "If this email exists in our system, a password reset link has been dispatched."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.password_hash = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully. You may now log in with your new credentials."}
