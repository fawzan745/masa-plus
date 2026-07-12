from datetime import date

from pydantic import BaseModel, Field


class PrayerTimesRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Lintang lokasi")
    longitude: float = Field(..., ge=-180, le=180, description="Bujur lokasi")
    timezone_offset: float = Field(7, description="Selisih zona waktu dari UTC, contoh WIB = 7")
    target_date: date | None = Field(None, description="Tanggal (default: hari ini)")


class PrayerTimesResponse(BaseModel):
    tanggal: str
    lokasi: dict[str, float]
    waktu: dict[str, str]
    catatan: str = (
        "Dihitung dengan metode hisab hakiki, sudut Subuh -20° "
        "(sesuai Pedoman Hisab Muhammadiyah)."
    )
