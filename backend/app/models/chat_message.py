import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_message"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    # Mengelompokkan pesan-pesan yang termasuk 1 percakapan yang sama
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)

    role: Mapped[str] = mapped_column(String(20))  # "user" atau "assistant"
    content: Mapped[str] = mapped_column(Text)

    # Untuk pesan dari assistant: rujukan ayat, disimpan sebagai teks JSON sederhana
    rujukan_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
