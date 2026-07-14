import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.user import User

# HTTPBearer membuat dialog "Authorize" di Swagger cuma minta 1 kotak
# token (bukan form username/password ala OAuth2 standar, yang tidak
# cocok dengan endpoint /auth/login kita yang menerima JSON).
bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kedaluwarsa",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    user_id = decode_access_token(token)
    if user_id is None:
        raise unauthorized

    try:
        user = await db.get(User, uuid.UUID(user_id))
    except ValueError:
        raise unauthorized

    if user is None:
        raise unauthorized

    return user
