from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.quran_ayat import QuranAyat
from app.services.embedding import embed_text


async def search_relevant_ayat(query: str, db: AsyncSession, top_k: int = 5) -> list[QuranAyat]:
    """Cari ayat-ayat yang maknanya paling dekat dengan pertanyaan user,
    memakai jarak kosinus antar vektor embedding (operator `<=>` dari
    pgvector -- makin kecil nilainya, makin mirip)."""

    query_embedding = embed_text(query)

    result = await db.execute(
        select(QuranAyat)
        .order_by(QuranAyat.embedding.cosine_distance(query_embedding))
        .limit(top_k)
    )
    return list(result.scalars().all())
