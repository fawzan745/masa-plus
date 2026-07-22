import hashlib
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.quran_ayat import QuranAyat
from app.schemas.quran import AyatOfDayResponse, SurahInfo

router = APIRouter(prefix="/quran", tags=["quran"])


@router.get("/surah-list", response_model=list[SurahInfo])
async def get_surah_list(db: AsyncSession = Depends(get_db)):
    """Daftar 114 surat beserta jumlah ayatnya -- dipakai untuk dropdown
    pilih surat di fitur tilawah & hafalan."""
    result = await db.execute(
        select(QuranAyat.surah_nomor, QuranAyat.surah_nama, func.count(QuranAyat.id))
        .group_by(QuranAyat.surah_nomor, QuranAyat.surah_nama)
        .order_by(QuranAyat.surah_nomor)
    )
    return [
        SurahInfo(nomor=nomor, nama=nama, jumlah_ayat=jumlah)
        for nomor, nama, jumlah in result.all()
    ]


@router.get("/ayat-of-the-day", response_model=AyatOfDayResponse)
async def get_ayat_of_the_day(db: AsyncSession = Depends(get_db)):
    """Ayat pilihan hari ini -- dipilih SECARA DETERMINISTIK dari tanggal
    (bukan acak murni), supaya:
    - Ayatnya SAMA sepanjang hari itu (tidak berubah tiap refresh halaman)
    - SAMA untuk semua pengguna
    - Otomatis ganti besok, tanpa perlu nyimpen state di database

    Caranya: tanggal hari ini di-hash, hasilnya dipakai sebagai "offset"
    untuk pilih 1 ayat dari total 6.236 ayat, dengan urutan yang stabil
    (surah lalu nomor ayat).
    """
    total = await db.scalar(select(func.count(QuranAyat.id)))
    if not total:
        return AyatOfDayResponse(
            surah="-", nomor_surah=0, nomor_ayat=0,
            teks_arab="", terjemahan="Data Al-Quran belum di-ingest ke database.",
        )

    today_str = date.today().isoformat()
    seed = int(hashlib.sha256(today_str.encode()).hexdigest(), 16)
    offset = seed % total

    result = await db.execute(
        select(QuranAyat)
        .order_by(QuranAyat.surah_nomor, QuranAyat.ayat_nomor)
        .offset(offset)
        .limit(1)
    )
    ayat = result.scalar_one()

    return AyatOfDayResponse(
        surah=ayat.surah_nama,
        nomor_surah=ayat.surah_nomor,
        nomor_ayat=ayat.ayat_nomor,
        teks_arab=ayat.teks_arab,
        terjemahan=ayat.terjemahan,
    )
