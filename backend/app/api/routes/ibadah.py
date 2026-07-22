import calendar
from datetime import date as date_type

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.ibadah_log import (
    IbadahLog, JENIS_SHOLAT_WAJIB, JENIS_RAWATIB, JENIS_SUNNAH_LAIN,
    RAWATIB_INDUK, JENIS_PUASA, JENIS_TILAWAH, JENIS_HAFALAN,
)
from app.models.quran_ayat import QuranAyat
from app.models.user import User
from app.schemas.ibadah import (
    IbadahLogUpsert, IbadahLogOut, IbadahHarianSummary, IbadahBulananSummary,
    SholatItem, RawatibItem, AyatRefInfo,
)

router = APIRouter(prefix="/ibadah-log", tags=["ibadah-tracking"])


async def _get_surah_nama(db: AsyncSession, surah_nomor: int | None) -> str | None:
    if not surah_nomor:
        return None
    nama = await db.scalar(
        select(QuranAyat.surah_nama).where(QuranAyat.surah_nomor == surah_nomor).limit(1)
    )
    return nama


@router.post("", response_model=IbadahLogOut)
async def upsert_ibadah_log(
    payload: IbadahLogUpsert,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Catat/perbarui status ibadah untuk satu tanggal + jenis tertentu (upsert)."""
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
        existing.surah_nomor = payload.surah_nomor
        existing.ayat_mulai = payload.ayat_mulai
        existing.ayat_akhir = payload.ayat_akhir
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
    d = tanggal or date_type.today()

    result = await db.execute(
        select(IbadahLog).where(IbadahLog.user_id == user.id, IbadahLog.tanggal == d)
    )
    logs = {log.jenis_ibadah: log for log in result.scalars().all()}

    sholat_wajib = {}
    for jenis in JENIS_SHOLAT_WAJIB:
        log = logs.get(jenis)
        sholat_wajib[jenis] = SholatItem(
            selesai=log.selesai if log else False,
            catatan=log.catatan if log else None,
        )

    rawatib = {}
    for jenis in JENIS_RAWATIB:
        log = logs.get(jenis)
        rawatib[jenis] = RawatibItem(selesai=log.selesai if log else False)

    sunnah_lain = {}
    for jenis in JENIS_SUNNAH_LAIN:
        log = logs.get(jenis)
        sunnah_lain[jenis] = SholatItem(
            selesai=log.selesai if log else False,
            catatan=log.catatan if log else None,
        )

    puasa_log = logs.get(JENIS_PUASA)
    puasa = SholatItem(
        selesai=puasa_log.selesai if puasa_log else False,
        catatan=puasa_log.catatan if puasa_log else None,
    )

    tilawah_log = logs.get(JENIS_TILAWAH)
    tilawah = AyatRefInfo(
        surah_nomor=tilawah_log.surah_nomor if tilawah_log else None,
        surah_nama=await _get_surah_nama(db, tilawah_log.surah_nomor if tilawah_log else None),
        ayat_mulai=tilawah_log.ayat_mulai if tilawah_log else None,
        ayat_akhir=tilawah_log.ayat_akhir if tilawah_log else None,
        catatan=tilawah_log.catatan if tilawah_log else None,
    )

    hafalan_log = logs.get(JENIS_HAFALAN)
    hafalan = AyatRefInfo(
        surah_nomor=hafalan_log.surah_nomor if hafalan_log else None,
        surah_nama=await _get_surah_nama(db, hafalan_log.surah_nomor if hafalan_log else None),
        ayat_mulai=hafalan_log.ayat_mulai if hafalan_log else None,
        ayat_akhir=hafalan_log.ayat_akhir if hafalan_log else None,
        catatan=hafalan_log.catatan if hafalan_log else None,
    )

    return IbadahHarianSummary(
        tanggal=d, sholat_wajib=sholat_wajib, rawatib=rawatib, sunnah_lain=sunnah_lain,
        puasa=puasa, tilawah=tilawah, hafalan=hafalan,
    )


@router.get("/bulanan", response_model=list[IbadahBulananSummary])
async def get_ibadah_bulanan(
    year: int = Query(default=None),
    month: int = Query(default=None, ge=1, le=12),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
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

        jumlah_sholat = sum(1 for l in day_logs if l.jenis_ibadah in JENIS_SHOLAT_WAJIB and l.selesai)
        puasa = any(l.jenis_ibadah == JENIS_PUASA and l.selesai for l in day_logs)
        tilawah = any(l.jenis_ibadah == JENIS_TILAWAH and l.selesai for l in day_logs)
        hafalan = any(l.jenis_ibadah == JENIS_HAFALAN and l.selesai for l in day_logs)

        summaries.append(IbadahBulananSummary(
            tanggal=d, jumlah_sholat_wajib_selesai=jumlah_sholat,
            puasa=puasa, tilawah=tilawah, hafalan=hafalan,
        ))

    return summaries
