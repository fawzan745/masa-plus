import uuid

from pydantic import BaseModel, ConfigDict


class DoaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    kategori: str
    judul: str
    arab: str
    latin: str
    terjemahan: str
    sumber: str


class KategoriDoa(BaseModel):
    nama: str
    jumlah: int
