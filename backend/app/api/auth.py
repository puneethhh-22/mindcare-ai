"""
Authentication endpoints: register, login, logout, refresh, profile.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_access_token,
)
from app.core.redis_client import blacklist_token, cache_set, cache_get
from app.core.dependencies import get_current_user
from app.models.user import UserDocument, HealthProfile
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Request / Response Schemas ────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=30)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    email: str


class UserProfileResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: str | None
    avatar_url: str | None
    health_profile: HealthProfile
    timezone: str
    language: str
    created_at: datetime


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    timezone: str | None = None
    language: str | None = None
    health_profile: HealthProfile | None = None


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest):
    """Register a new user account."""
    # Check for existing email/username
    existing_email = await UserDocument.find_one(UserDocument.email == data.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = await UserDocument.find_one(UserDocument.username == data.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user
    user = UserDocument(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    await user.insert()

    user_id = str(user.id)
    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
        user_id=user_id,
        username=user.username,
        email=user.email,
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    """Authenticate user and return JWT tokens."""
    user = await UserDocument.find_one(UserDocument.email == data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await user.save()

    user_id = str(user.id)
    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
        user_id=user_id,
        username=user.username,
        email=user.email,
    )


@router.post("/logout")
async def logout(current_user: UserDocument = Depends(get_current_user)):
    """Logout user by blacklisting their token."""
    # Token blacklisting is handled in the dependency
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserProfileResponse)
async def get_profile(current_user: UserDocument = Depends(get_current_user)):
    """Get current user's profile."""
    return UserProfileResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        health_profile=current_user.health_profile,
        timezone=current_user.timezone,
        language=current_user.language,
        created_at=current_user.created_at,
    )


@router.put("/me", response_model=UserProfileResponse)
async def update_profile(
    data: UpdateProfileRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Update current user's profile."""
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.timezone is not None:
        current_user.timezone = data.timezone
    if data.language is not None:
        current_user.language = data.language
    if data.health_profile is not None:
        current_user.health_profile = data.health_profile

    current_user.update_timestamp()
    await current_user.save()

    return UserProfileResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        health_profile=current_user.health_profile,
        timezone=current_user.timezone,
        language=current_user.language,
        created_at=current_user.created_at,
    )
