from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import health, auth, prayer, hijri, doa, ibadah, tanya_ustadz, quran

app = FastAPI(title=settings.APP_NAME)

# CORS - wajib supaya React (localhost:5173) boleh manggil API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan semua router di sini. Nanti tambah:
# app.include_router(prayer_times.router)
# app.include_router(dua.router)
# app.include_router(ai_chat.router)
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(prayer.router)
app.include_router(hijri.router)
app.include_router(doa.router)
app.include_router(ibadah.router)
app.include_router(tanya_ustadz.router)
app.include_router(quran.router)


@app.get("/")
async def root():
    return {"message": f"Selamat datang di {settings.APP_NAME}"}
