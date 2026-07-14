import calendar
from datetime import date as date_type

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.ibadah_log import IbadahLog, JENIS_SHOLAT
from app.models.user import User
from app.schemas.ibadah import (
    IbadahLogUpsert, IbadahLogOut, IbadahHarianSummary, IbadahBulananSummary,
)

router = APIRouter(prefix="/ibadah-log", tags=["ibadah-tracking"])


@router.post("", response_model=IbadahLogOut)
async def upsert_ibadah_log(
    payload: IbadahLogUpsert,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Catat/perbarui status ibadah untuk satu tanggal + jenis tertentu.
    Kalau catatan untuk kombinasi tanggal+jenis itu sudah ada, akan
    ditimpa (upsert), bukan membuat duplikat baru."""

    existing = await db.scalar(
        select(IbadahLog).where(
            IbadahLog.user_id == user.id,
            IbadahLog.tanggal == payload.tanggal,
            IbadahLog.jenis_ibadah == payload.jenis_ibadah,
        )
    )

    if existing:
        existing.selesai = payload.selesai
        existing.nilai_numerik = payload.nilai_numerik
        existing.catatan = payload.catatan
        log = existing
    else:
        log = IbadahLog(user_id=user.id, **payload.model_dump())
        db.add(log)

    await db.commit()
    await db.refresh(log)
    return log


@router.get("/harian", response_model=IbadahHarianSummary)
async def get_ibadah_harian(
    tanggal: date_type = Query(default=None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Ringkasan ibadah untuk satu hari tertentu (default: hari ini)."""
    d = tanggal or date_type.today()

    result = await db.execute(
        select(IbadahLog).where(IbadahLog.user_id == user.id, IbadahLog.tanggal == d)
    )
    logs = result.scalars().all()

    sholat = {jenis: False for jenis in JENIS_SHOLAT}
    puasa = False
    tilawah_halaman = None
    lainnya = []

    for log in logs:
        if log.jenis_ibadah in JENIS_SHOLAT:
            sholat[log.jenis_ibadah] = log.selesai
        elif log.jenis_ibadah == "puasa":
            puasa = log.selesai
        elif log.jenis_ibadah == "tilawah":
            tilawah_halaman = log.nilai_numerik
        else:
            lainnya.append(log)

    return IbadahHarianSummary(
        tanggal=d, sholat=sholat, puasa=puasa,
        tilawah_halaman=tilawah_halaman, lainnya=lainnya,
    )


@router.get("/bulanan", response_model=list[IbadahBulananSummary])
async def get_ibadah_bulanan(
    year: int = Query(default=None),
    month: int = Query(default=None, ge=1, le=12),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Ringkasan ibadah per hari untuk satu bulan penuh -- cocok untuk
    ditampilkan sebagai kalender/heatmap progres di frontend."""
    today = date_type.today()
    y = year or today.year
    m = month or today.month
    days_in_month = calendar.monthrange(y, m)[1]

    result = await db.execute(
        select(IbadahLog).where(
            IbadahLog.user_id == user.id,
            IbadahLog.tanggal >= date_type(y, m, 1),
            IbadahLog.tanggal <= date_type(y, m, days_in_month),
        )
    )
    logs = result.scalars().all()

    by_date: dict[date_type, list[IbadahLog]] = {}
    for log in logs:
        by_date.setdefault(log.tanggal, []).append(log)

    summaries = []
    for day_num in range(1, days_in_month + 1):
        d = date_type(y, m, day_num)
        day_logs = by_date.get(d, [])

        jumlah_sholat = sum(1 for l in day_logs if l.jenis_ibadah in JENIS_SHOLAT and l.selesai)
        puasa = any(l.jenis_ibadah == "puasa" and l.selesai for l in day_logs)
        tilawah = next((l.nilai_numerik for l in day_logs if l.jenis_ibadah == "tilawah"), None)

        summaries.append(IbadahBulananSummary(
            tanggal=d, jumlah_sholat_selesai=jumlah_sholat,
            puasa=puasa, tilawah_halaman=tilawah,
        ))

    return summaries
