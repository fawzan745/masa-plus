import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.doa import Doa
from app.schemas.doa import DoaOut, KategoriDoa

router = APIRouter(prefix="/doa", tags=["doa"])


@router.get("/kategori", response_model=list[KategoriDoa])
async def list_kategori(db: AsyncSession = Depends(get_db)):
    """Daftar semua kategori doa beserta jumlah doa di tiap kategori."""
    result = await db.execute(
        select(Doa.kategori, func.count(Doa.id)).group_by(Doa.kategori)
    )
    return [KategoriDoa(nama=row[0], jumlah=row[1]) for row in result.all()]


@router.get("", response_model=list[DoaOut])
async def list_doa(
    kategori: str | None = Query(default=None, description="Filter berdasarkan kategori"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Doa).order_by(Doa.kategori, Doa.urutan)
    if kategori:
        query = query.where(Doa.kategori == kategori)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{doa_id}", response_model=DoaOut)
async def get_doa(doa_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    doa = await db.get(Doa, doa_id)
    if not doa:
        raise HTTPException(status_code=404, detail="Doa tidak ditemukan")
    return doa
