"""
Tes otomatis untuk app/services/hijri_calendar.py

Setiap tes di bawah ini adalah "kunci jawaban" yang sudah kita validasi
manual terhadap data resmi (aplikasi MASA & pengumuman PP Muhammadiyah).
Kalau ada perubahan kode di masa depan yang bikin salah satu tes ini
gagal, itu tandanya ada regresi (fitur yang sudah benar jadi rusak lagi)
yang harus diperbaiki SEBELUM kode di-commit.
"""

from datetime import date

import pytest

from app.services.hijri_calendar import gregorian_to_hijri, get_year_calendar


def test_muharram_1448_pkg1():
    """16 Juni 2026 = 1 Muharram 1448 H (kasus PKG1, kriteria terpenuhi
    sebelum jam 24:00 UT di wilayah sekitar Amerika Selatan)."""
    result = gregorian_to_hijri(date(2026, 6, 16))
    assert result.day == 1
    assert result.month_name == "Muharram"
    assert result.year == 1448


def test_idulfitri_1447():
    """20 Maret 2026 = 1 Syawal 1447 H, sesuai Maklumat resmi PP
    Muhammadiyah tentang Idulfitri 1447 H."""
    result = gregorian_to_hijri(date(2026, 3, 20))
    assert result.day == 1
    assert result.month_name == "Syawal"
    assert result.year == 1447


def test_iduladha_1447_pkg1_dan_pkg2_gagal():
    """27 Mei 2026 = 10 Dzulhijjah 1447 H (Iduladha). Kasus khusus:
    konjungsi terjadi 16 Mei, TAPI baik PKG1 maupun PKG2 sama-sama gagal
    di hari itu, sehingga awal bulan mundur 2 hari dari konjungsi
    (bukan 1 hari seperti kasus normal)."""
    result = gregorian_to_hijri(date(2026, 5, 27))
    assert result.day == 10
    assert result.month_name == "Dzulhijjah"
    assert result.year == 1447


def test_safar_1448_pkg2():
    """15 Juli 2026 = 1 Safar 1448 H. Kasus PKG2: kriteria baru
    terpenuhi setelah lewat jam 24:00 UT, di wilayah Amerika, dengan
    ijtimak yang terjadi sebelum fajar di Selandia Baru."""
    result = gregorian_to_hijri(date(2026, 7, 15))
    assert result.day == 1
    assert result.month_name == "Safar"
    assert result.year == 1448


def test_ramadan_1447_pkg2():
    """18 Februari 2026 = 1 Ramadan 1447 H. Kasus PKG2 lain, sesuai
    contoh visibilitas resmi yang dipublikasikan (terpenuhi di Alaska)."""
    result = gregorian_to_hijri(date(2026, 2, 18))
    assert result.day == 1
    assert result.month_name == "Ramadan"
    assert result.year == 1447


@pytest.mark.parametrize("day_offset,expected_day", [
    (0, 27),  # 12 Juli 2026, hari saat fitur ini pertama kali dites
])
def test_hari_ini_konsisten(day_offset, expected_day):
    """12 Juli 2026 = 27 Muharram 1448 H — validasi pertama sebelum
    bug PKG2 ditemukan, tetap harus konsisten setelah perbaikan."""
    result = gregorian_to_hijri(date(2026, 7, 12))
    assert result.day == expected_day
    assert result.month_name == "Muharram"


def test_year_calendar_2026_lengkap_tanpa_bulan_hilang():
    """Kalender setahun penuh 2026 harus berisi 12 bulan berurutan,
    tanpa ada yang terlewat atau duplikat (regresi dari bug sebelumnya)."""
    calendar_items = get_year_calendar(2026)

    assert len(calendar_items) == 12

    # Pastikan tanggal awal bulan selalu naik (tidak ada duplikat/mundur)
    starts = [item.gregorian_month_start for item in calendar_items]
    assert starts == sorted(starts)
    assert len(starts) == len(set(starts))  # tidak ada duplikat

    # Pastikan nomor bulan berurutan 1-12 berputar (tidak ada yang di-skip)
    months = [item.month for item in calendar_items]
    for i in range(1, len(months)):
        expected_next = months[i - 1] + 1 if months[i - 1] < 12 else 1
        assert months[i] == expected_next, (
            f"Urutan bulan terputus di index {i}: {months[i-1]} -> {months[i]}"
        )
