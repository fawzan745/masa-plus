"""
Migrasi sekali-jalan: tambah kolom foto_url ke tabel users yang SUDAH ADA.

Kenapa perlu script terpisah (bukan cukup create_tables.py)? Karena
`Base.metadata.create_all` cuma membuat tabel yang belum ada -- dia TIDAK
akan mengubah struktur tabel yang sudah ada sebelumnya. Kalau kamu sudah
pernah register akun sebelum fitur foto profil ini, tabel `users` kamu
belum punya kolom ini.

Aman dijalankan berkali-kali (pakai IF NOT EXISTS), dan TIDAK menghapus
data user yang sudah ada.

Cara pakai:
    python migrate_add_foto_url.py
"""

import asyncio

from sqlalchemy import text

from app.db.database import engine


async def migrate():
    async with engine.begin() as conn:
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS foto_url TEXT"
        ))
    print("Migrasi selesai: kolom foto_url sudah ada di tabel users.")


if __name__ == "__main__":
    asyncio.run(migrate())
