import uuid

from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """Bentuk data User yang aman dikirim ke frontend (tanpa password)."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    foto_url: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    foto_url: str | None = None  # data URL base64, mis. "data:image/jpeg;base64,..."


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
