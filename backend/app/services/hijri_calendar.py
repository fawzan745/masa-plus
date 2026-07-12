"""
Perhitungan Kalender Hijriah Global Tunggal (KHGT) sesuai kriteria
yang diadopsi Muhammadiyah (Model Kongres Turki 2016).

Referensi: https://khgt.muhammadiyah.or.id/ (bagian "Metodologi KHGT")

Kriteria inti (Parameter Kalender Global / PKG):
Bulan baru dimulai apabila di bagian mana pun di dunia, SEBELUM pukul 24:00 UT
pada hari terjadinya ijtimak (konjungsi geosentris Matahari-Bulan), sudah
terpenuhi: elongasi >= 8 derajat DAN ketinggian hilal di atas ufuk saat
matahari terbenam >= 5 derajat (dihitung geosentris).

Kalau terpenuhi, maka HARI BERIKUTNYA (setelah hari ijtimak) adalah tanggal 1
bulan Hijriah baru, berlaku serentak di seluruh dunia (satu matlak global).

CATATAN PENTING TENTANG AKURASI:
- Nomor tahun & bulan Hijriah (mis. "Muharram 1448") diambil dari library
  `hijri-converter` (kalender tabular Umm al-Qura) sebagai baseline, karena
  menghitung mundur nomor bulan sampai epoch Hijriah 1 secara astronomis murni
  terlalu berat untuk dilakukan tiap request API.
- Tanggal PASTI mulainya bulan (tanggal 1) DIHITUNG ULANG secara astronomis
  memakai kriteria KHGT di atas (bukan ikut baseline), jadi lebih presisi
  dibanding baseline tabularnya.
- Sudah divalidasi terhadap data resmi khgt.muhammadiyah.or.id: 12 Juli 2026
  = 27 Muharram 1448 H.
- Untuk kepastian hukum syar'i (awal Ramadan, Idulfitri, dll), tetap rujuk ke
  pengumuman resmi Majelis Tarjih dan Tajdid PP Muhammadiyah, bukan hasil
  perhitungan mandiri ini.
"""

import math
from dataclasses import dataclass
from datetime import date, datetime, timedelta

import ephem
from hijri_converter import Gregorian

ELONGATION_MIN_DEGREES = 8.0
ALTITUDE_MIN_DEGREES = 5.0

# Sampel titik bujur yang di-scan untuk mengecek kriteria "di mana pun di dunia".
# Makin rapat (increment kecil) makin presisi tapi makin lambat.
LONGITUDE_SAMPLES = range(-180, 181, 5)


@dataclass
class HijriDate:
    year: int
    month: int
    month_name: str
    day: int
    gregorian_month_start: date


HIJRI_MONTH_NAMES = [
    "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal",
    "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadan", "Syawal",
    "Dzulqaidah", "Dzulhijjah",
]


def _criteria_met_anywhere(conjunction: ephem.Date) -> bool:
    """Cek apakah kriteria PKG (elongasi >=8 & tinggi hilal >=5) terpenuhi
    di titik bujur mana pun, saat matahari terbenam di titik itu, SEBELUM
    pukul 24:00 UT pada hari konjungsi terjadi."""

    conjunction_dt = ephem.Date(conjunction).datetime()
    next_midnight_ut = datetime(conjunction_dt.year, conjunction_dt.month, conjunction_dt.day) + timedelta(days=1)
    conjunction_day_end_ut = ephem.Date(next_midnight_ut)

    for lon in LONGITUDE_SAMPLES:
        obs = ephem.Observer()
        obs.lat = "0"
        obs.lon = str(lon)
        obs.elevation = 0
        obs.pressure = 0
        obs.date = conjunction

        sun = ephem.Sun()
        try:
            sunset = obs.next_setting(sun)
        except (ephem.AlwaysUpError, ephem.NeverUpError):
            continue

        if sunset >= conjunction_day_end_ut:
            continue  # matahari terbenamnya sudah lewat jam 24:00 UT

        obs.date = sunset
        moon = ephem.Moon()
        sun.compute(obs)
        moon.compute(obs)

        elongation = math.degrees(ephem.separation(sun, moon))
        moon_altitude = math.degrees(moon.alt)

        if elongation >= ELONGATION_MIN_DEGREES and moon_altitude >= ALTITUDE_MIN_DEGREES:
            return True

    return False


def _find_month_start(approx_date: date) -> date:
    """Mencari tanggal 1 Hijriah (versi Masehi) untuk bulan yang memuat
    approx_date, berdasarkan kriteria KHGT."""

    ephem_date = ephem.Date(approx_date.strftime("%Y/%m/%d"))
    conjunction = ephem.previous_new_moon(ephem_date)

    conjunction_date = ephem.Date(conjunction).datetime().date()

    if _criteria_met_anywhere(conjunction):
        return conjunction_date + timedelta(days=1)
    else:
        return conjunction_date + timedelta(days=2)


def gregorian_to_hijri(target_date: date) -> HijriDate:
    """Konversi tanggal Masehi ke tanggal Hijriah versi KHGT."""

    baseline = Gregorian(target_date.year, target_date.month, target_date.day).to_hijri()

    month_start = _find_month_start(target_date)
    day_of_month = (target_date - month_start).days + 1

    year, month = baseline.year, baseline.month

    # Koreksi kalau hasil astronomis KHGT menggeser tanggal ke bulan
    # sebelum/sesudah baseline tabular (bisa terjadi di sekitar pergantian bulan)
    if day_of_month < 1:
        month -= 1
        if month < 1:
            month = 12
            year -= 1
        month_start = _find_month_start(month_start - timedelta(days=5))
        day_of_month = (target_date - month_start).days + 1
    elif day_of_month > 30:
        month += 1
        if month > 12:
            month = 1
            year += 1
        month_start = _find_month_start(month_start + timedelta(days=32))
        day_of_month = (target_date - month_start).days + 1

    return HijriDate(
        year=year,
        month=month,
        month_name=HIJRI_MONTH_NAMES[month - 1],
        day=day_of_month,
        gregorian_month_start=month_start,
    )
