import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict

JENIS_SHOLAT = ["sholat_subuh", "sholat_dzuhur", "sholat_ashar", "sholat_maghrib", "sholat_isya"]


class IbadahLogUpsert(BaseModel):
    tanggal: date
    jenis_ibadah: str  # mis. "sholat_subuh", "puasa", "tilawah", atau nama custom
    selesai: bool = True
    nilai_numerik: float | None = None  # mis. jumlah halaman/ayat untuk tilawah
    catatan: str | None = None


class IbadahLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tanggal: date
    jenis_ibadah: str
    selesai: bool
    nilai_numerik: float | None
    catatan: str | None


class IbadahHarianSummary(BaseModel):
    tanggal: date
    sholat: dict[str, bool]  # {"sholat_subuh": True, "sholat_dzuhur": False, ...}
    puasa: bool
    tilawah_halaman: float | None
    lainnya: list[IbadahLogOut]


class IbadahBulananSummary(BaseModel):
    tanggal: date
    jumlah_sholat_selesai: int  # dari 0-5
    puasa: bool
    tilawah_halaman: float | None
