import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import String, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

# Dimensi embedding HARUS sama persis dengan model yang dipakai di
# app/services/embedding.py (paraphrase-multilingual-MiniLM-L12-v2 = 384).
# Kalau ganti model embedding, kolom ini juga harus disesuaikan + re-ingest data.
EMBEDDING_DIM = 384


class QuranAyat(Base):
    __tablename__ = "quran_ayat"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    surah_nomor: Mapped[int] = mapped_column(Integer, index=True)
    surah_nama: Mapped[str] = mapped_column(String(100))  # mis. "Al-Fatihah"
    ayat_nomor: Mapped[int] = mapped_column(Integer)
    teks_arab: Mapped[str] = mapped_column(Text)
    teks_latin: Mapped[str] = mapped_column(Text, nullable=True)
    terjemahan: Mapped[str] = mapped_column(Text)

    # Vektor embedding dari terjemahan (dipakai untuk pencarian semantik)
    embedding: Mapped[list[float]] = mapped_column(Vector(EMBEDDING_DIM))

    # Tafsir Kemenag -- dipakai sebagai konteks tambahan untuk AI (BUKAN
    # untuk pencarian semantik, karena isinya terlalu panjang & bisa
    # mengaburkan fokus pencarian dibanding terjemahan yang ringkas)
    tafsir: Mapped[str | None] = mapped_column(Text, nullable=True)
