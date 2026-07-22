import uuid
from datetime import date, datetime

from sqlalchemy import String, Boolean, Float, Integer, Text, Date, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

# Sholat wajib -- selalu punya catatan
JENIS_SHOLAT_WAJIB = ["sholat_subuh", "sholat_dzuhur", "sholat_ashar", "sholat_maghrib", "sholat_isya"]

# Sholat sunnah rawatib -- menyatu di bawah sholat wajib terkait, TIDAK punya catatan sendiri
JENIS_RAWATIB = [
    "rawatib_qabliyah_subuh",
    "rawatib_qabliyah_dzuhur", "rawatib_badiyah_dzuhur",
    "rawatib_qabliyah_ashar",
    "rawatib_badiyah_maghrib",
    "rawatib_badiyah_isya",
]

# Peta rawatib ke sholat wajib induknya, dipakai buat menampilkan sebagai sub-bab
RAWATIB_INDUK = {
    "rawatib_qabliyah_subuh": "sholat_subuh",
    "rawatib_qabliyah_dzuhur": "sholat_dzuhur",
    "rawatib_badiyah_dzuhur": "sholat_dzuhur",
    "rawatib_qabliyah_ashar": "sholat_ashar",
    "rawatib_badiyah_maghrib": "sholat_maghrib",
    "rawatib_badiyah_isya": "sholat_isya",
}

# Sholat sunnah selain rawatib -- punya catatan sendiri
JENIS_SUNNAH_LAIN = ["sholat_tahajud", "sholat_dhuha", "sholat_tahiyatul_masjid"]

JENIS_PUASA = "puasa"
JENIS_TILAWAH = "tilawah"
JENIS_HAFALAN = "hafalan"


class IbadahLog(Base):
    __tablename__ = "ibadah_log"
    __table_args__ = (
        UniqueConstraint("user_id", "tanggal", "jenis_ibadah", name="uq_ibadah_log_user_tanggal_jenis"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    tanggal: Mapped[date] = mapped_column(Date, index=True)
    jenis_ibadah: Mapped[str] = mapped_column(String(100))

    selesai: Mapped[bool] = mapped_column(Boolean, default=True)
    nilai_numerik: Mapped[float | None] = mapped_column(Float, nullable=True)
    catatan: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Khusus tilawah & hafalan -- rujukan surat & ayat
    surah_nomor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ayat_mulai: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ayat_akhir: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
