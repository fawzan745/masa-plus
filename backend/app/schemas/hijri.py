from datetime import date

from pydantic import BaseModel


class FastingItem(BaseModel):
    nama: str
    jenis: str  # wajib | sunnah | terlarang
    keterangan: str


class HijriDateResponse(BaseModel):
    tanggal_masehi: str
    hijriah: str
    tahun: int
    bulan: int
    nama_bulan: str
    tanggal: int
    awal_bulan_masehi: str
    puasa: list[FastingItem] = []
    metode: str = "Kalender Hijriah Global Tunggal (KHGT) - Model Kongres Turki 2016"
    catatan: str = (
        "Untuk kepastian hukum syar'i (awal Ramadan, Idulfitri, dst), "
        "tetap rujuk ke pengumuman resmi Majelis Tarjih dan Tajdid PP Muhammadiyah."
    )


class FastingCalendarDay(BaseModel):
    tanggal_masehi: str
    hijriah: str
    puasa: list[FastingItem]
