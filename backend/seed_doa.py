"""
Script untuk mengisi database dengan contoh doa harian.

PENTING: Teks Arab, latin, dan terjemahan di bawah ini sudah diusahakan
akurat berdasarkan referensi umum, TAPI karena ini konten keagamaan yang
butuh presisi tinggi (harakat, ejaan), SANGAT DISARANKAN untuk mengecek
ulang setiap teks terhadap sumber rujukan tepercaya (mis. aplikasi
Muslim Pro, Hisnul Muslim, atau buku Dzikir Pagi Petang terbitan resmi)
sebelum dipakai di produksi / dipublikasikan ke pengguna umum.

Cara pakai:
    python seed_doa.py
"""

import asyncio
import uuid

from app.db.database import AsyncSessionLocal
from app.models.doa import Doa

CONTOH_DOA = [
    {
        "kategori": "Makan & Minum",
        "judul": "Doa Sebelum Makan",
        "arab": "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
        "latin": "Allahumma baarik lanaa fiimaa razaqtanaa wa qinaa 'adzaaban naar",
        "terjemahan": "Ya Allah, berkahilah kami pada apa yang telah Engkau rezekikan kepada kami, dan peliharalah kami dari siksa api neraka.",
        "sumber": "HR. Ibnu Sunni",
        "urutan": 1,
    },
    {
        "kategori": "Makan & Minum",
        "judul": "Doa Sesudah Makan",
        "arab": "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        "latin": "Alhamdulillaahilladzii ath'amanii haadzaa wa razaqaniihi min ghairi haulin minnii wa laa quwwah",
        "terjemahan": "Segala puji bagi Allah yang telah memberiku makan makanan ini dan merezekikannya kepadaku tanpa daya dan kekuatan dariku.",
        "sumber": "HR. Abu Dawud, Tirmidzi",
        "urutan": 2,
    },
    {
        "kategori": "Rumah & Bepergian",
        "judul": "Doa Keluar Rumah",
        "arab": "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        "latin": "Bismillaahi tawakkaltu 'alallaah, laa haula walaa quwwata illaa billaah",
        "terjemahan": "Dengan nama Allah, aku bertawakal kepada Allah, tiada daya dan kekuatan kecuali dengan pertolongan Allah.",
        "sumber": "HR. Abu Dawud, Tirmidzi",
        "urutan": 1,
    },
    {
        "kategori": "Rumah & Bepergian",
        "judul": "Doa Masuk Rumah",
        "arab": "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
        "latin": "Bismillaahi walajnaa wa bismillaahi kharajnaa wa 'alallaahi rabbinaa tawakkalnaa",
        "terjemahan": "Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah Tuhan kami, kami bertawakal.",
        "sumber": "HR. Abu Dawud",
        "urutan": 2,
    },
    {
        "kategori": "Rumah & Bepergian",
        "judul": "Doa Naik Kendaraan",
        "arab": "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
        "latin": "Subhaanalladzii sakhkhara lanaa haadzaa wa maa kunnaa lahu muqriniin, wa innaa ilaa rabbinaa lamunqalibuun",
        "terjemahan": "Maha Suci Allah yang telah menundukkan semua ini bagi kami, padahal kami sebelumnya tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami.",
        "sumber": "QS. Az-Zukhruf: 13-14",
        "urutan": 3,
    },
    {
        "kategori": "Tidur & Bangun Tidur",
        "judul": "Doa Sebelum Tidur",
        "arab": "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        "latin": "Bismika allahumma amuutu wa ahyaa",
        "terjemahan": "Dengan nama-Mu ya Allah, aku mati dan aku hidup.",
        "sumber": "HR. Bukhari",
        "urutan": 1,
    },
    {
        "kategori": "Tidur & Bangun Tidur",
        "judul": "Doa Bangun Tidur",
        "arab": "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        "latin": "Alhamdulillaahilladzii ahyaanaa ba'da maa amaatanaa wa ilaihin nusyuur",
        "terjemahan": "Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan hanya kepada-Nya kami dibangkitkan.",
        "sumber": "HR. Bukhari",
        "urutan": 2,
    },
    {
        "kategori": "Untuk Orang Tua",
        "judul": "Doa untuk Kedua Orang Tua",
        "arab": "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
        "latin": "Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa",
        "terjemahan": "Ya Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah keduanya sebagaimana mereka telah mendidikku sewaktu kecil.",
        "sumber": "QS. Al-Isra: 24",
        "urutan": 1,
    },
]


async def seed():
    async with AsyncSessionLocal() as session:
        for item in CONTOH_DOA:
            doa = Doa(id=uuid.uuid4(), **item)
            session.add(doa)
        await session.commit()
    print(f"Berhasil menambahkan {len(CONTOH_DOA)} contoh doa ke database.")


if __name__ == "__main__":
    asyncio.run(seed())
