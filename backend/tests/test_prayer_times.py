"""Tes otomatis untuk app/services/prayer_times.py"""

from datetime import date

from app.services.prayer_times import calculate_prayer_times


def test_gresik_12_juli_2026_vs_masa():
    """Tervalidasi terhadap aplikasi MASA (Muhammadiyah) untuk
    Kab. Gresik, Jawa Timur, 12 Juli 2026."""
    hasil = calculate_prayer_times(
        target_date=date(2026, 7, 12),
        latitude=-7.1547,
        longitude=112.6547,
        timezone_offset=7,
    )

    assert hasil["subuh"] == "04:30"
    assert hasil["ashar"] == "14:58"
    assert hasil["isya"] == "18:43"

    # Terbit/Dzuhur/Maghrib boleh selisih 1-2 menit (toleransi wajar
    # pembulatan hisab), jadi dites longgar pakai rentang, bukan sama persis
    assert hasil["terbit"] in ("05:43", "05:44", "05:45")
    assert hasil["dzuhur"] in ("11:35", "11:36", "11:37")
    assert hasil["maghrib"] in ("17:28", "17:29", "17:30")


def test_semua_waktu_terisi_urutan_benar():
    """Pastikan urutan waktu sholat selalu logis (subuh < terbit < dzuhur
    < ashar < maghrib < isya) untuk lokasi & tanggal mana pun yang wajar."""
    hasil = calculate_prayer_times(
        target_date=date(2026, 1, 1),
        latitude=-6.2,
        longitude=106.8,
        timezone_offset=7,
    )

    urutan = ["subuh", "terbit", "dzuhur", "ashar", "maghrib", "isya"]
    waktu_menit = []
    for key in urutan:
        jam, menit = hasil[key].split(":")
        waktu_menit.append(int(jam) * 60 + int(menit))

    assert waktu_menit == sorted(waktu_menit), "Urutan waktu sholat tidak logis"
