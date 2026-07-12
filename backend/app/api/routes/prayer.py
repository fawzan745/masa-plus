from datetime import date as date_type

from fastapi import APIRouter

from app.schemas.prayer import PrayerTimesRequest, PrayerTimesResponse
from app.services.prayer_times import calculate_prayer_times

router = APIRouter(prefix="/prayer-times", tags=["prayer-times"])


@router.post("", response_model=PrayerTimesResponse)
async def get_prayer_times(payload: PrayerTimesRequest):
    target_date = payload.target_date or date_type.today()

    waktu = calculate_prayer_times(
        target_date=target_date,
        latitude=payload.latitude,
        longitude=payload.longitude,
        timezone_offset=payload.timezone_offset,
    )

    return PrayerTimesResponse(
        tanggal=target_date.isoformat(),
        lokasi={"latitude": payload.latitude, "longitude": payload.longitude},
        waktu=waktu,
    )
