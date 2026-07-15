"""
Service untuk generate embedding (representasi vektor makna teks)
memakai model lokal, gratis, jalan di komputer sendiri -- tidak
butuh API key atau biaya apapun.

Model di-load SEKALI saja (bukan tiap request) karena loading-nya
lumayan berat, disimpan di variabel module-level `_model`.
"""

from sentence_transformers import SentenceTransformer

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_text(text: str) -> list[float]:
    """Ubah 1 teks jadi vektor embedding (384 dimensi)."""
    model = get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Ubah banyak teks sekaligus (lebih cepat dari embed_text satu-satu)."""
    model = get_model()
    vectors = model.encode(texts, normalize_embeddings=True, show_progress_bar=True)
    return vectors.tolist()
