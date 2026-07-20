from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.core.security import hash_password, verify_password, create_access_token
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, UserUpdate, Token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email atau password salah")

    token = create_access_token(subject=str(user.id))
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    """Info user yang sedang login, berdasarkan token JWT yang dikirim.
    Dipakai frontend untuk cek status login begitu halaman dibuka/refresh."""
    return user


@router.patch("/me", response_model=UserOut)
async def update_me(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update profil (nama dan/atau foto) user yang sedang login.
    Field yang tidak dikirim (None) tidak akan diubah."""
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.foto_url is not None:
        user.foto_url = payload.foto_url

    await db.commit()
    await db.refresh(user)
    return user
