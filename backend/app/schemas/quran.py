from pydantic import BaseModel


class AyatOfDayResponse(BaseModel):
    surah: str
    nomor_surah: int
    nomor_ayat: int
    teks_arab: str
    terjemahan: str
