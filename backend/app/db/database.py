from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# Engine = koneksi utama ke database
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)

# Session factory = dipakai tiap request untuk buat transaksi baru
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class untuk semua model (User, IbadahLog, dll akan inherit dari ini)
Base = declarative_base()


async def get_db():
    """Dependency yang dipakai di tiap endpoint yang butuh akses database.

    Contoh pemakaian di endpoint:
        async def some_route(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        yield session
