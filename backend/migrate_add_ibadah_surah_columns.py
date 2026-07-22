"""
Migrasi sekali-jalan: tambah kolom surah_nomor, ayat_mulai, ayat_akhir
ke tabel ibadah_log yang SUDAH ADA (dipakai untuk fitur tilawah & hafalan
berbasis surat/ayat, bukan lagi jumlah halaman).

Aman dijalankan berkali-kali, TIDAK menghapus data yang sudah ada.

Cara pakai:
    python migrate_add_ibadah_surah_columns.py
"""

import asyncio

from sqlalchemy import text

from app.db.database import engine


async def migrate():
    async with engine.begin() as conn:
        await conn.execute(text(
            "ALTER TABLE ibadah_log ADD COLUMN IF NOT EXISTS surah_nomor INTEGER"
        ))
        await conn.execute(text(
            "ALTER TABLE ibadah_log ADD COLUMN IF NOT EXISTS ayat_mulai INTEGER"
        ))
        await conn.execute(text(
            "ALTER TABLE ibadah_log ADD COLUMN IF NOT EXISTS ayat_akhir INTEGER"
        ))
    print("Migrasi selesai: kolom surah_nomor, ayat_mulai, ayat_akhir sudah ada di tabel ibadah_log.")


if __name__ == "__main__":
    asyncio.run(migrate())
