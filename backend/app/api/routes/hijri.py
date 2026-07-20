import calendar
from datetime import date as date_type

from fastapi import APIRouter, Query, HTTPException

from app.schemas.hijri import HijriDateResponse, FastingItem, FastingCalendarDay, HijriYearCalendarItem
from app.services.hijri_calendar import (
    gregorian_to_hijri, get_year_calendar, approx_gregorian_for_hijri_year, get_hijri_month_days,
)
from app.services.fasting_calendar import get_fasting_info

router = APIRouter(tags=["hijri-calendar"])


def _build_hijri_response(d: date_type) -> HijriDateResponse:
    hijri = gregorian_to_hijri(d)
    puasa = get_fasting_info(hijri.month, hijri.day, d)

    return HijriDateResponse(
        tanggal_masehi=d.isoformat(),
        hijriah=f"{hijri.day} {hijri.month_name} {hijri.year} H",
        tahun=hijri.year,
        bulan=hijri.month,
        nama_bulan=hijri.month_name,
        tanggal=hijri.day,
        awal_bulan_masehi=hijri.gregorian_month_start.isoformat(),
        puasa=[FastingItem(nama=p.nama, jenis=p.jenis, keterangan=p.keterangan) for p in puasa],
    )


def _build_fasting_calendar_day(d: date_type) -> tuple[FastingCalendarDay, bool]:
    """Return (item, ada_puasa) -- ada_puasa dipakai buat filter di /fasting-calendar."""
    hijri = gregorian_to_hijri(d)
    puasa = get_fasting_info(hijri.month, hijri.day, d)

    item = FastingCalendarDay(
        tanggal_masehi=d.isoformat(),
        hijriah=f"{hijri.day} {hijri.month_name} {hijri.year} H",
        hijri_tanggal=hijri.day,
        hijri_bulan=hijri.month_name,
        hijri_tahun=hijri.year,
        puasa=[FastingItem(nama=p.nama, jenis=p.jenis, keterangan=p.keterangan) for p in puasa],
    )
    return item, bool(puasa)


@router.get("/hijri-date", response_model=HijriDateResponse)
async def get_hijri_date(target_date: date_type = Query(default=None)):
    d = target_date or date_type.today()
    return _build_hijri_response(d)


@router.get("/hijri-calendar/year", response_model=list[HijriYearCalendarItem])
async def get_hijri_year_calendar(
    year: int = Query(default=None, description="Tahun Masehi, default: tahun sekarang"),
):
    """Daftar semua pergantian bulan Hijriah dalam satu tahun Masehi --
    cocok untuk validasi/perbandingan menyeluruh terhadap kalender resmi."""
    y = year or date_type.today().year
    calendar_items = get_year_calendar(y)

    return [
        HijriYearCalendarItem(
            hijriah=f"1 {h.month_name} {h.year} H",
            awal_bulan_masehi=h.gregorian_month_start.isoformat(),
        )
        for h in calendar_items
    ]


@router.get("/hijri-calendar/hijri-year-start")
async def get_hijri_year_start(hijri_year: int = Query(..., description="Tahun Hijriah, mis. 1448")):
    """Perkiraan tanggal Masehi untuk 1 Muharram dari tahun Hijriah tertentu.
    Dipakai untuk navigasi kalender (lompat ke tahun Hijriah pilihan user) --
    ini perkiraan dari kalender tabular, BUKAN hasil hitungan KHGT presisi.
    Begitu kalender mendarat di bulan itu, tanggal per-hari yang ditampilkan
    tetap dihitung ulang secara presisi lewat KHGT seperti biasa."""
    try:
        approx_date = approx_gregorian_for_hijri_year(hijri_year)
    except Exception:
        raise HTTPException(status_code=400, detail="Tahun Hijriah tidak valid")

    return {"gregorian_date": approx_date.isoformat()}


@router.get("/hijri-calendar/hijri-month", response_model=list[FastingCalendarDay])
async def get_hijri_month_view(
    hijri_year: int = Query(..., description="Tahun Hijriah, mis. 1448"),
    hijri_month: int = Query(..., ge=1, le=12, description="Bulan Hijriah (1=Muharram ... 12=Dzulhijjah)"),
):
    """Semua hari dalam 1 bulan Hijriah tertentu (presisi KHGT), MULAI dari
    tanggal 1 bulan itu -- beda dari /hijri-calendar/month yang dipotong
    mengikuti batas bulan Masehi."""
    days = get_hijri_month_days(hijri_year, hijri_month)
    return [_build_fasting_calendar_day(d)[0] for d in days]


@router.get("/hijri-calendar/month", response_model=list[FastingCalendarDay])
async def get_hijri_month_calendar(
    year: int = Query(default=None, description="Tahun Masehi, default: tahun sekarang"),
    month: int = Query(default=None, ge=1, le=12, description="Bulan Masehi (1-12), default: bulan sekarang"),
):
    """Tanggal Hijriah untuk SETIAP hari dalam 1 bulan Masehi (bukan cuma
    yang ada anjuran puasa) -- dipakai untuk tampilan grid kalender penuh."""
    today = date_type.today()
    y = year or today.year
    m = month or today.month

    days_in_month = calendar.monthrange(y, m)[1]
    result: list[FastingCalendarDay] = []

    for day_num in range(1, days_in_month + 1):
        d = date_type(y, m, day_num)
        item, _ = _build_fasting_calendar_day(d)
        result.append(item)

    return result


@router.get("/fasting-calendar", response_model=list[FastingCalendarDay])
async def get_fasting_calendar(
    year: int = Query(default=None, description="Tahun Masehi, default: tahun sekarang"),
    month: int = Query(default=None, ge=1, le=12, description="Bulan Masehi (1-12), default: bulan sekarang"),
):
    """Daftar hari-hari yang punya anjuran/larangan puasa dalam satu bulan Masehi."""
    today = date_type.today()
    y = year or today.year
    m = month or today.month

    days_in_month = calendar.monthrange(y, m)[1]
    result: list[FastingCalendarDay] = []

    for day_num in range(1, days_in_month + 1):
        d = date_type(y, m, day_num)
        item, ada_puasa = _build_fasting_calendar_day(d)
        if ada_puasa:
            result.append(item)

    return result
