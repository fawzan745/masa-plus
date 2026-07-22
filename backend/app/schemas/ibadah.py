import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict


class IbadahLogUpsert(BaseModel):
    tanggal: date
    jenis_ibadah: str
    selesai: bool = True
    nilai_numerik: float | None = None
    catatan: str | None = None
    surah_nomor: int | None = None
    ayat_mulai: int | None = None
    ayat_akhir: int | None = None


class IbadahLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tanggal: date
    jenis_ibadah: str
    selesai: bool
    nilai_numerik: float | None
    catatan: str | None
    surah_nomor: int | None
    ayat_mulai: int | None
    ayat_akhir: int | None


class SholatItem(BaseModel):
    selesai: bool = False
    catatan: str | None = None


class RawatibItem(BaseModel):
    selesai: bool = False


class AyatRefInfo(BaseModel):
    """Dipakai untuk tilawah & hafalan -- rujukan surat & rentang ayat,
    dengan nama surat otomatis dicocokkan dari nomor surat."""
    surah_nomor: int | None = None
    surah_nama: str | None = None
    ayat_mulai: int | None = None
    ayat_akhir: int | None = None
    catatan: str | None = None


class IbadahHarianSummary(BaseModel):
    tanggal: date
    sholat_wajib: dict[str, SholatItem]     # sholat_subuh, sholat_dzuhur, dst
    rawatib: dict[str, RawatibItem]          # rawatib_qabliyah_subuh, dst
    sunnah_lain: dict[str, SholatItem]       # sholat_tahajud, sholat_dhuha, sholat_tahiyatul_masjid
    puasa: SholatItem
    tilawah: AyatRefInfo
    hafalan: AyatRefInfo


class IbadahBulananSummary(BaseModel):
    tanggal: date
    jumlah_sholat_wajib_selesai: int  # dari 0-5
    puasa: bool
    tilawah: bool
    hafalan: bool
