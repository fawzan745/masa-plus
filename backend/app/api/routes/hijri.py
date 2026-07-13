import calendar
from datetime import date as date_type

from fastapi import APIRouter, Query

from app.schemas.hijri import HijriDateResponse, FastingItem, FastingCalendarDay, HijriYearCalendarItem
from app.services.hijri_calendar import gregorian_to_hijri, get_year_calendar
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


@router.get("/hijri-date", response_model=HijriDateResponse)
async def get_hijri_date(target_date: date_type = Query(default=None)):
    d = target_date or date_type.today()
    return _build_hijri_response(d)


@router.get("/hijri-calendar/year", response_model=list[HijriYearCalendarItem])
async def get_hijri_year_calendar(
    year: int = Query(default=None, description="Tahun Masehi, default: tahun sekarang"),
):
    """Daftar semua pergantian bulan Hijriah dalam satu tahun Masehi —
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
        hijri = gregorian_to_hijri(d)
        puasa = get_fasting_info(hijri.month, hijri.day, d)

        if puasa:  # cuma masukkan hari yang ada anjuran/larangan puasa
            result.append(FastingCalendarDay(
                tanggal_masehi=d.isoformat(),
                hijriah=f"{hijri.day} {hijri.month_name} {hijri.year} H",
                puasa=[FastingItem(nama=p.nama, jenis=p.jenis, keterangan=p.keterangan) for p in puasa],
            ))

    return result
