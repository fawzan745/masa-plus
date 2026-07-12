"""
Penentuan anjuran puasa (wajib/sunnah) dan hari terlarang puasa,
berdasarkan tanggal Hijriah (bulan & tanggal) dan hari Masehi (untuk
Senin-Kamis).

Ini kaidah fiqih puasa sunnah yang disepakati luas di kalangan ulama
(bukan pendapat khusus Muhammadiyah semata), bersumber dari hadits-hadits
shahih riwayat Bukhari-Muslim dan kitab-kitab fiqih standar.
"""

from dataclasses import dataclass
from datetime import date

MUHARRAM, SAFAR, RABIUL_AWAL, RABIUL_AKHIR, JUMADIL_AWAL, JUMADIL_AKHIR = range(1, 7)
RAJAB, SYABAN, RAMADAN, SYAWAL, DZULQAIDAH, DZULHIJJAH = range(7, 13)


@dataclass
class FastingInfo:
    nama: str
    jenis: str  # "wajib" | "sunnah" | "terlarang"
    keterangan: str


def get_fasting_info(hijri_month: int, hijri_day: int, gregorian_date: date) -> list[FastingInfo]:
    results: list[FastingInfo] = []

    # --- Hari terlarang puasa (dicek duluan, karena ini membatalkan anjuran lain) ---
    is_idulfitri = hijri_month == SYAWAL and hijri_day == 1
    is_iduladha_tasyrik = hijri_month == DZULHIJJAH and hijri_day in (10, 11, 12, 13)

    if is_idulfitri:
        results.append(FastingInfo(
            "Hari Raya Idulfitri", "terlarang",
            "Diharamkan berpuasa pada 1 Syawal.",
        ))
        return results  # tidak perlu cek anjuran lain

    if is_iduladha_tasyrik:
        nama = "Hari Raya Iduladha" if hijri_day == 10 else "Hari Tasyrik"
        results.append(FastingInfo(
            nama, "terlarang",
            f"Diharamkan berpuasa pada {hijri_day} Dzulhijjah.",
        ))
        return results

    # --- Puasa wajib: Ramadan ---
    if hijri_month == RAMADAN:
        results.append(FastingInfo(
            "Puasa Ramadan", "wajib",
            f"Hari ke-{hijri_day} bulan Ramadan.",
        ))
        return results  # sudah wajib puasa, tidak perlu tambahan anjuran sunnah lain

    # --- Sunnah: Senin & Kamis ---
    weekday = gregorian_date.weekday()  # 0 = Senin, 3 = Kamis
    if weekday == 0:
        results.append(FastingInfo("Puasa Senin", "sunnah", "Dianjurkan puasa sunnah tiap hari Senin."))
    elif weekday == 3:
        results.append(FastingInfo("Puasa Kamis", "sunnah", "Dianjurkan puasa sunnah tiap hari Kamis."))

    # --- Sunnah: Ayyamul Bidh (13, 14, 15 tiap bulan Hijriah) ---
    if hijri_day in (13, 14, 15):
        results.append(FastingInfo(
            "Puasa Ayyamul Bidh", "sunnah",
            f"Puasa pertengahan bulan Hijriah (tanggal {hijri_day}).",
        ))

    # --- Sunnah: Puasa Dzulhijjah (1-9), dengan penekanan khusus di hari Arafah ---
    if hijri_month == DZULHIJJAH and 1 <= hijri_day <= 9:
        if hijri_day == 9:
            results.append(FastingInfo(
                "Puasa Arafah", "sunnah",
                "Sangat dianjurkan (menghapus dosa 2 tahun). "
                "Tidak disunnahkan bagi jamaah yang sedang wukuf di Arafah.",
            ))
        else:
            results.append(FastingInfo(
                "Puasa Dzulhijjah", "sunnah",
                f"Hari ke-{hijri_day} dari 10 hari pertama Dzulhijjah.",
            ))

    # --- Sunnah: Tasu'a & Asyura (9-10 Muharram) ---
    if hijri_month == MUHARRAM and hijri_day in (9, 10):
        nama = "Puasa Tasu'a" if hijri_day == 9 else "Puasa Asyura"
        results.append(FastingInfo(
            nama, "sunnah",
            "Dianjurkan berpuasa tanggal 9-10 Muharram (menghapus dosa 1 tahun untuk Asyura).",
        ))

    # --- Sunnah: Puasa Syawal (6 hari, bebas tanggal asal bukan 1 Syawal) ---
    if hijri_month == SYAWAL and 2 <= hijri_day <= 30:
        results.append(FastingInfo(
            "Puasa Syawal", "sunnah",
            "Dianjurkan puasa 6 hari di bulan Syawal (boleh tanggal berapa saja, tidak harus berurutan).",
        ))

    return results
