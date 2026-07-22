"""
Script untuk mengisi database dengan seluruh ayat Al-Quran (teks Arab +
terjemahan Kemenag) beserta embedding-nya untuk pencarian semantik (RAG).

Sumber data: https://github.com/rioastamal/quran-json (MIT License),
diambil dari data resmi https://quran.kemenag.go.id -- sudah didownload
ke folder data/quran/ (114 file, 1.json - 114.json).

Proses ini akan generate embedding untuk 6.236 ayat -- BUTUH WAKTU
(sekitar 5-15 menit tergantung CPU, karena tanpa GPU). Cukup dijalankan
SEKALI saja (kecuali ganti model embedding atau mau re-ingest ulang).

Cara pakai:
    python ingest_quran.py
"""

import asyncio
import json
import uuid
from pathlib import Path

from app.db.database import AsyncSessionLocal
from app.models.quran_ayat import QuranAyat
from app.services.embedding import embed_texts

DATA_DIR = Path(__file__).parent / "data" / "quran"
BATCH_SIZE = 64  # generate embedding per batch, lebih efisien dari 1-1


async def ingest():
    all_ayat = []

    print("Membaca 114 file surah...")
    for surah_num in range(1, 115):
        file_path = DATA_DIR / f"{surah_num}.json"
        data = json.loads(file_path.read_text(encoding="utf-8"))
        surah_data = data[str(surah_num)]

        surah_nama = surah_data["name_latin"]
        teks_arab_dict = surah_data["text"]
        terjemahan_dict = surah_data["translations"]["id"]["text"]
        tafsir_dict = surah_data.get("tafsir", {}).get("id", {}).get("kemenag", {}).get("text", {})

        for ayat_num_str, teks_arab in teks_arab_dict.items():
            ayat_num = int(ayat_num_str)
            terjemahan = terjemahan_dict[ayat_num_str]
            tafsir = tafsir_dict.get(ayat_num_str)

            all_ayat.append({
                "surah_nomor": surah_num,
                "surah_nama": surah_nama,
                "ayat_nomor": ayat_num,
                "teks_arab": teks_arab,
                "terjemahan": terjemahan,
                "tafsir": tafsir,
            })

    print(f"Total {len(all_ayat)} ayat ditemukan. Mulai generate embedding...")
    print("(Ini yang paling lama, mohon tunggu -- progress bar di bawah)")

    async with AsyncSessionLocal() as session:
        for i in range(0, len(all_ayat), BATCH_SIZE):
            batch = all_ayat[i:i + BATCH_SIZE]

            # Embedding dihitung dari terjemahan (bukan teks Arab), karena
            # pertanyaan user akan dalam Bahasa Indonesia -- pencarian
            # semantik jauh lebih akurat kalau dicocokkan bahasa yang sama.
            texts_to_embed = [item["terjemahan"] for item in batch]
            embeddings = embed_texts(texts_to_embed)

            for item, embedding in zip(batch, embeddings):
                ayat = QuranAyat(
                    id=uuid.uuid4(),
                    surah_nomor=item["surah_nomor"],
                    surah_nama=item["surah_nama"],
                    ayat_nomor=item["ayat_nomor"],
                    teks_arab=item["teks_arab"],
                    teks_latin=None,
                    terjemahan=item["terjemahan"],
                    tafsir=item["tafsir"],
                    embedding=embedding,
                )
                session.add(ayat)

            await session.commit()
            print(f"  Progress: {min(i + BATCH_SIZE, len(all_ayat))}/{len(all_ayat)} ayat")

    print("Selesai! Semua ayat Al-Quran + embedding sudah masuk database.")


if __name__ == "__main__":
    asyncio.run(ingest())
