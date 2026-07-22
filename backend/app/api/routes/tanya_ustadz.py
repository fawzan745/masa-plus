import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.chat_message import ChatMessage
from app.models.user import User
from app.schemas.tanya_ustadz import (
    TanyaUstadzRequest, TanyaUstadzResponse, AyatRujukan,
    ChatMessageOut, ChatSessionSummary,
)
from app.services.quran_search import search_relevant_ayat
from app.services import ollama_client

router = APIRouter(prefix="/tanya-ustadz", tags=["tanya-ustadz-ai"])

MAX_RIWAYAT_PESAN = 6  # jumlah pesan terakhir yang disertakan sebagai konteks percakapan

def _potong_tafsir(tafsir: str | None, max_chars: int = 700) -> str:
    """Ambil beberapa kalimat awal tafsir saja -- tafsir lengkap per ayat
    bisa ribuan kata, terlalu panjang untuk dikirim ke model lokal (bikin
    lambat & prompt kebesaran). Dipotong di batas kalimat, bukan tengah kata."""
    if not tafsir:
        return ""
    if len(tafsir) <= max_chars:
        return tafsir
    potongan = tafsir[:max_chars]
    batas_kalimat = potongan.rfind(". ")
    if batas_kalimat > max_chars * 0.5:  # jangan kepotong terlalu pendek
        potongan = potongan[:batas_kalimat + 1]
    return potongan.strip() + "..."


SYSTEM_PROMPT = """Kamu adalah asisten yang membantu mencarikan ayat Al-Quran yang relevan \
dengan pertanyaan pengguna, KHUSUS untuk aplikasi Muslim berbasis Muhammadiyah.

ATURAN KETAT yang WAJIB kamu ikuti:
1. Jawab HANYA berdasarkan potongan ayat Al-Quran yang diberikan di konteks setiap pertanyaan. \
JANGAN menambahkan informasi dari pengetahuanmu sendiri di luar konteks yang diberikan.
2. Kamu BUKAN ustadz sungguhan dan TIDAK BOLEH memberikan fatwa hukum fiqih (halal/haram, \
wajib/sunnah) atas nama sendiri. Kamu hanya menyampaikan APA YANG DIKATAKAN ayat yang relevan.
3. Kalau ayat yang diberikan di konteks TIDAK cukup relevan untuk menjawab pertanyaan, \
katakan dengan jujur bahwa kamu tidak menemukan ayat yang relevan, JANGAN mengarang jawaban.
4. Untuk pertanyaan tentang hukum fiqih yang kompleks, kontroversial, atau berkaitan dengan \
keputusan penting (nikah, waris, muamalah, dll), SELALU sarankan pengguna berkonsultasi \
langsung ke ustadz atau Majelis Tarjih Muhammadiyah -- jangan berikan kesimpulan hukum sendiri.
5. Kalau ada "Tafsir Kemenag" di konteks, PAKAI itu untuk memahami makna ayat dengan benar \
sebelum menjawab -- ayat Al-Quran seringkali butuh konteks penjelasan ulama supaya tidak \
disalahpahami secara harfiah oleh orang awam. Tapi tetap jangan menambah klaim di luar apa \
yang disampaikan tafsir tersebut.
6. Jawab dengan bahasa Indonesia yang sopan, hangat, dan mudah dipahami.
7. Kamu boleh mengingat konteks percakapan sebelumnya dalam sesi yang sama (misal kalau \
pengguna bertanya "kalau begitu bagaimana dengan...", itu melanjutkan topik sebelumnya), \
TAPI aturan 1-4 di atas tetap berlaku untuk setiap jawaban baru.
8. Jangan menyebutkan nomor ayat di dalam teks jawabanmu -- itu ditampilkan terpisah oleh sistem."""


@router.post("", response_model=TanyaUstadzResponse)
async def tanya_ustadz(
    payload: TanyaUstadzRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session_id = payload.session_id or uuid.uuid4()

    # Ambil riwayat percakapan sebelumnya DALAM SESI INI (kalau ada),
    # supaya AI punya konteks obrolan sebelumnya.
    riwayat_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id, ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    riwayat = list(riwayat_result.scalars().all())[-MAX_RIWAYAT_PESAN:]

    # Cari ayat relevan untuk PERTANYAAN TERBARU (bukan seluruh riwayat).
    # top_k lebih kecil = konteks lebih pendek = respons lebih cepat,
    # tapi risiko ayat relevan yang terlewat juga sedikit lebih tinggi.
    ayat_list = await search_relevant_ayat(payload.pertanyaan, db, top_k=3)

    if not ayat_list:
        jawaban_text = "Maaf, saya tidak menemukan ayat Al-Quran yang relevan dengan pertanyaan ini."
        rujukan = []
    else:
        konteks_parts = []
        for a in ayat_list:
            bagian = f'QS. {a.surah_nama} ayat {a.ayat_nomor}: "{a.terjemahan}"'
            tafsir_potongan = _potong_tafsir(a.tafsir)
            if tafsir_potongan:
                bagian += f"\nTafsir Kemenag: {tafsir_potongan}"
            konteks_parts.append(bagian)
        konteks = "\n\n".join(konteks_parts)

        pertanyaan_dengan_konteks = f"""Konteks (ayat-ayat Al-Quran yang relevan untuk pertanyaan ini):
{konteks}

Pertanyaan: {payload.pertanyaan}

Jawab HANYA berdasarkan konteks ayat-ayat di atas."""

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in riwayat:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": pertanyaan_dengan_konteks})

        try:
            jawaban_text = (await ollama_client.chat(messages)).strip()
        except RuntimeError as e:
            jawaban_text = f"Maaf, terjadi kendala teknis: {e}"

        rujukan = [
            AyatRujukan(
                surah=a.surah_nama, nomor_surah=a.surah_nomor,
                nomor_ayat=a.ayat_nomor, teks_arab=a.teks_arab,
                terjemahan=a.terjemahan,
            )
            for a in ayat_list
        ]

    # Simpan pesan user & jawaban AI ke riwayat permanen
    db.add(ChatMessage(
        id=uuid.uuid4(), user_id=user.id, session_id=session_id,
        role="user", content=payload.pertanyaan,
    ))
    db.add(ChatMessage(
        id=uuid.uuid4(), user_id=user.id, session_id=session_id,
        role="assistant", content=jawaban_text,
        rujukan_json=json.dumps([r.model_dump() for r in rujukan]),
    ))
    await db.commit()

    return TanyaUstadzResponse(session_id=session_id, jawaban=jawaban_text, rujukan=rujukan)


@router.get("/sessions", response_model=list[ChatSessionSummary])
async def list_sessions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Daftar semua sesi percakapan milik user, terbaru duluan."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at)
    )
    messages = list(result.scalars().all())

    sessions: dict[uuid.UUID, list[ChatMessage]] = {}
    for msg in messages:
        sessions.setdefault(msg.session_id, []).append(msg)

    summaries = []
    for session_id, msgs in sessions.items():
        pertanyaan_pertama = next((m.content for m in msgs if m.role == "user"), "(tanpa judul)")
        judul = pertanyaan_pertama[:80] + ("..." if len(pertanyaan_pertama) > 80 else "")
        summaries.append(ChatSessionSummary(
            session_id=session_id, judul=judul,
            jumlah_pesan=len(msgs),
            terakhir_diperbarui=msgs[-1].created_at,
        ))

    return sorted(summaries, key=lambda s: s.terakhir_diperbarui, reverse=True)


@router.get("/sessions/{session_id}", response_model=list[ChatMessageOut])
async def get_session_history(
    session_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Riwayat lengkap 1 sesi percakapan tertentu."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id, ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    messages = list(result.scalars().all())

    if not messages:
        raise HTTPException(status_code=404, detail="Sesi percakapan tidak ditemukan")

    return [
        ChatMessageOut(
            role=m.role, content=m.content,
            rujukan=[AyatRujukan(**r) for r in json.loads(m.rujukan_json)] if m.rujukan_json else [],
            created_at=m.created_at,
        )
        for m in messages
    ]
