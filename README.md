# Masa Plus

Aplikasi Muslim personal berbasis manhaj Muhammadiyah, dilengkapi fitur tanya jawab AI (RAG) yang berpegang pada sumber resmi (Himpunan Putusan Tarjih, Qur'an, Hadits shahih).

## Struktur project

```
masa-plus/
├── backend/          FastAPI (Python)
│   └── app/
│       ├── core/       config.py, security.py
│       ├── db/         koneksi database
│       ├── models/     SQLAlchemy models (tabel database)
│       ├── schemas/    Pydantic schemas (validasi API)
│       └── api/routes/ endpoint-endpoint
├── frontend/         React + Vite
└── docker-compose.yml Postgres + pgvector
```

## Cara menjalankan (langkah demi langkah)

### 1. Jalankan database

```bash
docker compose up -d
```

Cek databasenya sudah jalan: `docker ps` harus menampilkan container `db`.

### 2. Setup backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Buat tabel-tabel di database (setelah alembic dikonfigurasi — lihat langkah 4 di bawah), atau untuk quick-start tanpa alembic dulu, buat tabel langsung:

```bash
python -c "import asyncio; from app.db.database import engine, Base; from app.models.user import User; asyncio.run(engine.run_sync := None)"
```

> Catatan: baris di atas placeholder — cara paling rapi adalah pakai Alembic (langkah 4). Untuk uji cepat, kamu juga bisa buat script kecil `create_tables.py` yang memanggil `Base.metadata.create_all`.

Jalankan server:

```bash
uvicorn app.main:app --reload --port 8000
```

Buka `http://localhost:8000/docs` — harus muncul Swagger UI dengan endpoint `/health`, `/auth/register`, `/auth/login`.

### 3. Setup frontend

Di terminal baru:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Buka `http://localhost:5173` — harus muncul tulisan "Backend terhubung: Masa Plus API jalan normal". Kalau ini muncul, artinya frontend dan backend sudah berhasil terhubung.

### 4. (Rekomendasi) Setup Alembic untuk migrasi database

Alembic mengelola perubahan skema database secara terstruktur (jadi kamu punya riwayat perubahan, bukan asal `create_all`). Dari folder `backend/`:

```bash
alembic init alembic
```

Lalu edit `alembic/env.py` supaya `target_metadata = Base.metadata` (import dari `app.db.database`), dan `alembic.ini` supaya `sqlalchemy.url` mengarah ke `DATABASE_URL` yang sama. Setelah itu:

```bash
alembic revision --autogenerate -m "create users table"
alembic upgrade head
```

## Checklist fase 0 (fondasi)

- [x] Struktur folder backend & frontend
- [x] Koneksi database async (SQLAlchemy + asyncpg)
- [x] Model & endpoint auth dasar (register, login, JWT)
- [x] CORS supaya frontend bisa akses backend
- [x] Docker compose dengan Postgres + pgvector (sudah siap dipakai nanti di fase RAG)
- [x] Frontend React yang bisa cek koneksi ke backend
- [ ] Alembic migration (ikuti langkah 4 di atas)
- [ ] Deploy skeleton ke hosting gratis (Railway/Render untuk backend, Vercel untuk frontend)

## Langkah selanjutnya (Fase 1)

Mulai bikin fitur non-AI: jadwal sholat, kalender hijriah, doa harian, tracking ibadah. Tambahkan model baru di `app/models/`, schema di `app/schemas/`, dan route baru di `app/api/routes/`, lalu daftarkan router-nya di `app/main.py`.
