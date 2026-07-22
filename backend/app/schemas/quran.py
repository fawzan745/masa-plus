from pydantic import BaseModel


class AyatOfDayResponse(BaseModel):
    surah: str
    nomor_surah: int
    nomor_ayat: int
    teks_arab: str
    terjemahan: str


class SurahInfo(BaseModel):
    nomor: int
    nama: str
    jumlah_ayat: int
