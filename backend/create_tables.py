"""
Script quick-start untuk membuat semua tabel di database
berdasarkan model-model yang ada di app/models/.

Cara pakai:
    python create_tables.py
"""

import asyncio

from app.db.database import engine, Base
from app.models.user import User  # noqa: F401 -- import supaya modelnya terdaftar ke Base


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Semua tabel berhasil dibuat.")


if __name__ == "__main__":
    asyncio.run(create_tables())