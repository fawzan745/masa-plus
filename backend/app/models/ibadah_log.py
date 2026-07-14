import uuid
from datetime import date, datetime

from sqlalchemy import String, Boolean, Float, Text, Date, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

# Jenis ibadah bawaan (built-in). Selain nilai-nilai ini, jenis_ibadah
# bebas diisi apa saja oleh user sebagai kebiasaan custom (mis. "sedekah",
# "puasa daud", dst) -- lihat app/schemas/ibadah.py untuk daftar built-in.
JENIS_SHOLAT = ["sholat_subuh", "sholat_dzuhur", "sholat_ashar", "sholat_maghrib", "sholat_isya"]
JENIS_BAWAAN_LAIN = ["puasa", "tilawah"]


class IbadahLog(Base):
    __tablename__ = "ibadah_log"
    __table_args__ = (
        UniqueConstraint("user_id", "tanggal", "jenis_ibadah", name="uq_ibadah_log_user_tanggal_jenis"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    tanggal: Mapped[date] = mapped_column(Date, index=True)
    jenis_ibadah: Mapped[str] = mapped_column(String(100))  # mis. "sholat_subuh", "puasa", "tilawah", atau custom

    selesai: Mapped[bool] = mapped_column(Boolean, default=True)
    nilai_numerik: Mapped[float | None] = mapped_column(Float, nullable=True)  # mis. jumlah halaman tilawah
    catatan: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
