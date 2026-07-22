"""
Migrasi: tambah kolom `tafsir` ke tabel quran_ayat, lalu isi datanya dari
file JSON yang sudah didownload sebelumnya (data/quran/1.json - 114.json).

TIDAK perlu generate ulang embedding (itu proses yang lama, 5-15 menit) --
migrasi ini cuma menambah kolom teks baru dan mengisinya, jadi jauh lebih
cepat (hitungan detik).

Cara pakai:
    python migrate_add_tafsir.py
"""

import asyncio
import json
from pathlib import Path

from sqlalchemy import text, select

from app.db.database import engine, AsyncSessionLocal
from app.models.quran_ayat import QuranAyat

DATA_DIR = Path(__file__).parent / "data" / "quran"


async def migrate():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE quran_ayat ADD COLUMN IF NOT EXISTS tafsir TEXT"))
    print("Kolom tafsir sudah ada. Mengisi data tafsir dari file JSON...")

    async with AsyncSessionLocal() as session:
        for surah_num in range(1, 115):
            file_path = DATA_DIR / f"{surah_num}.json"
            data = json.loads(file_path.read_text(encoding="utf-8"))
            surah_data = data[str(surah_num)]

            tafsir_dict = (
                surah_data.get("tafsir", {})
                .get("id", {})
                .get("kemenag", {})
                .get("text", {})
            )

            if not tafsir_dict:
                print(f"  Surah {surah_num}: tidak ada data tafsir, dilewati.")
                continue

            result = await session.execute(
                select(QuranAyat).where(QuranAyat.surah_nomor == surah_num)
            )
            ayat_by_nomor = {a.ayat_nomor: a for a in result.scalars().all()}

            for ayat_num_str, tafsir_text in tafsir_dict.items():
                ayat = ayat_by_nomor.get(int(ayat_num_str))
                if ayat:
                    ayat.tafsir = tafsir_text

            await session.commit()
            print(f"  Surah {surah_num}/114 selesai")

    print("Migrasi tafsir selesai.")


if __name__ == "__main__":
    asyncio.run(migrate())
