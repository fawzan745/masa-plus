import uuid
from datetime import datetime

from pydantic import BaseModel


class TanyaUstadzRequest(BaseModel):
    pertanyaan: str
    session_id: uuid.UUID | None = None  # kosongkan untuk mulai percakapan baru


class AyatRujukan(BaseModel):
    surah: str
    nomor_surah: int
    nomor_ayat: int
    teks_arab: str
    terjemahan: str


class TanyaUstadzResponse(BaseModel):
    session_id: uuid.UUID
    jawaban: str
    rujukan: list[AyatRujukan]
    disclaimer: str = (
        "Jawaban ini dihasilkan AI berdasarkan pencarian di Al-Quran (terjemahan Kemenag), "
        "BUKAN fatwa atau pendapat ulama. Untuk pertanyaan hukum fiqih yang kompleks atau "
        "penting, silakan konsultasi ke ustadz/Majelis Tarjih secara langsung."
    )


class ChatMessageOut(BaseModel):
    role: str
    content: str
    rujukan: list[AyatRujukan] = []
    created_at: datetime


class ChatSessionSummary(BaseModel):
    session_id: uuid.UUID
    judul: str  # diambil dari pertanyaan pertama di sesi itu
    jumlah_pesan: int
    terakhir_diperbarui: datetime
