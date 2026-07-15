"""
Client untuk memanggil Ollama -- LLM open-source yang jalan lokal di
komputer sendiri lewat http://localhost:11434, gratis, tanpa API key.

Dokumentasi API: https://github.com/ollama/ollama/blob/main/docs/api.md
"""

import httpx

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "qwen2.5:7b"


async def generate(prompt: str, system: str | None = None, timeout: float = 120.0) -> str:
    """Kirim prompt ke Ollama, kembalikan teks jawabannya (non-streaming)."""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }
    if system:
        payload["system"] = system

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            response.raise_for_status()
        except httpx.ConnectError:
            raise RuntimeError(
                "Tidak bisa terhubung ke Ollama di localhost:11434. "
                "Pastikan aplikasi Ollama sudah jalan (cek ikon di system tray)."
            )
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Ollama mengembalikan error: {e.response.text}")

    data = response.json()
    return data["response"]


async def chat(messages: list[dict], timeout: float = 120.0) -> str:
    """Kirim riwayat percakapan (list of {"role", "content"}) ke Ollama,
    dipakai supaya AI "ingat" konteks obrolan sebelumnya dalam 1 sesi."""

    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
            response.raise_for_status()
        except httpx.ConnectError:
            raise RuntimeError(
                "Tidak bisa terhubung ke Ollama di localhost:11434. "
                "Pastikan aplikasi Ollama sudah jalan (cek ikon di system tray)."
            )
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Ollama mengembalikan error: {e.response.text}")

    data = response.json()
    return data["message"]["content"]
