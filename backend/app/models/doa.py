import uuid

from sqlalchemy import String, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Doa(Base):
    __tablename__ = "doa"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kategori: Mapped[str] = mapped_column(String(100), index=True)  # mis. "Makan", "Tidur", "Safar"
    judul: Mapped[str] = mapped_column(String(255))
    arab: Mapped[str] = mapped_column(Text)
    latin: Mapped[str] = mapped_column(Text)
    terjemahan: Mapped[str] = mapped_column(Text)
    sumber: Mapped[str] = mapped_column(String(255))  # mis. "HR. Bukhari no. 6322"
    urutan: Mapped[int] = mapped_column(Integer, default=0)  # urutan tampil dalam kategori
