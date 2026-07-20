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
from hijri_converter import Gregorian, Hijri

ELONGATION_MIN_DEGREES = 8.0
ALTITUDE_MIN_DEGREES = 5.0

# Sampel titik bujur yang di-scan untuk mengecek kriteria "di mana pun di dunia" (PKG1).
LONGITUDE_SAMPLES = range(-180, 181, 5)

# Rentang bujur perkiraan wilayah daratan Benua Amerika, untuk PKG2.
AMERICAS_LONGITUDE_RANGE = range(-170, -29, 5)

# Koordinat referensi Selandia Baru untuk cek "ijtimak sebelum fajar" (PKG2).
NZ_LATITUDE = -41.28
NZ_LONGITUDE = 174.77
FAJR_ANGLE = 18.0


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


def _pkg1_criteria_met(conjunction: ephem.Date) -> bool:
    """PKG 1: kriteria terpenuhi di mana pun di dunia, SEBELUM pukul 24:00 UT
    pada hari konjungsi."""

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


def _pkg2_criteria_met(conjunction: ephem.Date) -> bool:
    """PKG 2: berlaku kalau PKG1 gagal. Kriteria terpenuhi (tinggi hilal >=5,
    elongasi >=8) SETELAH pukul 00:00 UT, DENGAN SYARAT: (a) lokasi
    terpenuhinya ada di wilayah daratan Amerika, DAN (b) ijtimak terjadi
    sebelum fajar di Selandia Baru."""

    # Syarat (b): ijtimak harus terjadi sebelum fajar di Selandia Baru
    # pada hari (UT) yang sama dengan hari konjungsi.
    conj_dt = ephem.Date(conjunction).datetime()
    day_start = ephem.Date(datetime(conj_dt.year, conj_dt.month, conj_dt.day))

    nz_obs = ephem.Observer()
    nz_obs.lat = str(NZ_LATITUDE)
    nz_obs.lon = str(NZ_LONGITUDE)
    nz_obs.elevation = 0
    nz_obs.pressure = 0
    nz_obs.horizon = str(-FAJR_ANGLE)
    nz_obs.date = day_start

    try:
        nz_fajr = nz_obs.next_rising(ephem.Sun(), use_center=True)
    except (ephem.AlwaysUpError, ephem.NeverUpError):
        return False

    if not (conjunction < nz_fajr):
        return False  # syarat (b) gagal, tidak perlu cek syarat (a)

    # Syarat (a): tinggi & elongasi hilal terpenuhi di wilayah daratan Amerika,
    # memakai waktu terbenam matahari terdekat setelah konjungsi (boleh lewat
    # tengah malam UT, berbeda dari PKG1).
    for lon in AMERICAS_LONGITUDE_RANGE:
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

        obs.date = sunset
        moon = ephem.Moon()
        sun.compute(obs)
        moon.compute(obs)

        elongation = math.degrees(ephem.separation(sun, moon))
        moon_altitude = math.degrees(moon.alt)

        if elongation >= ELONGATION_MIN_DEGREES and moon_altitude >= ALTITUDE_MIN_DEGREES:
            return True

    return False


def _criteria_met_anywhere(conjunction: ephem.Date) -> bool:
    """Gabungan PKG1 dan PKG2 sesuai urutan resmi KHGT: PKG1 dicek dulu,
    kalau gagal baru PKG2 (penyelarasan)."""
    return _pkg1_criteria_met(conjunction) or _pkg2_criteria_met(conjunction)


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


def get_year_calendar(gregorian_year: int) -> list[HijriDate]:
    """Mengembalikan daftar semua awal bulan Hijriah yang jatuh dalam satu
    tahun Masehi tertentu, berguna untuk validasi/perbandingan menyeluruh
    terhadap kalender resmi (mis. aplikasi MASA)."""

    year_start = ephem.Date(f"{gregorian_year}/01/01")
    year_end = ephem.Date(f"{gregorian_year + 1}/01/01")

    conjunction = ephem.previous_new_moon(year_start)
    month_starts: list[date] = []

    while True:
        conjunction = ephem.next_new_moon(conjunction)
        if conjunction >= year_end:
            break

        conjunction_date = ephem.Date(conjunction).datetime().date()
        if _criteria_met_anywhere(conjunction):
            month_start = conjunction_date + timedelta(days=1)
        else:
            month_start = conjunction_date + timedelta(days=2)
        month_starts.append(month_start)

    if not month_starts:
        return []

    # Ambil baseline nomor tahun/bulan HANYA dari bulan pertama, lalu hitung
    # maju berurutan untuk bulan-bulan berikutnya. Ini menghindari label
    # ganda/salah akibat baseline tabular yang kadang geser di titik tertentu.
    first = month_starts[0]
    baseline = Gregorian(first.year, first.month, first.day).to_hijri()
    year, month = baseline.year, baseline.month

    results: list[HijriDate] = []
    for i, month_start in enumerate(month_starts):
        if i > 0:
            month += 1
            if month > 12:
                month = 1
                year += 1
        results.append(HijriDate(
            year=year,
            month=month,
            month_name=HIJRI_MONTH_NAMES[month - 1],
            day=1,
            gregorian_month_start=month_start,
        ))

    return results


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


def get_hijri_month_days(hijri_year: int, hijri_month: int) -> list[date]:
    """Mengembalikan semua tanggal Masehi yang termasuk dalam 1 bulan
    Hijriah tertentu (presisi KHGT, bisa melintasi 2 bulan Masehi).

    Caranya: cari perkiraan tanggal awal (dari kalender tabular), lalu
    dikonfirmasi/dikoreksi dengan hitungan KHGT presisi lewat gregorian_to_hijri().
    """
    approx = Hijri(hijri_year, hijri_month, 1).to_gregorian()
    approx_date = date(approx.year, approx.month, approx.day)

    # Cari tanggal awal bulan yang presisi (KHGT), coba di sekitar perkiraan
    month_start = None
    for offset in range(-3, 4):
        candidate = approx_date + timedelta(days=offset)
        hijri = gregorian_to_hijri(candidate)
        if hijri.year == hijri_year and hijri.month == hijri_month:
            month_start = hijri.gregorian_month_start
            break

    if month_start is None:
        # fallback -- pakai perkiraan tabular apa adanya
        month_start = approx_date

    # Cari awal bulan berikutnya untuk tahu kapan bulan ini berakhir
    next_month_probe = gregorian_to_hijri(month_start + timedelta(days=32))
    month_end = next_month_probe.gregorian_month_start - timedelta(days=1)

    days = []
    d = month_start
    while d <= month_end:
        days.append(d)
        d += timedelta(days=1)
    return days


def approx_gregorian_for_hijri_year(hijri_year: int) -> date:
    """Perkiraan tanggal Masehi untuk 1 Muharram dari tahun Hijriah tertentu,
    dipakai KHUSUS untuk navigasi UI kalender (lompat ke tahun pilihan user).
    Ini pakai kalender tabular (baseline), BUKAN hasil hitungan KHGT presisi
    -- untuk itu, cukup akurat (+/- 1-2 hari), karena tujuannya cuma
    mengarahkan tampilan ke bulan yang kira-kira benar.
    """
    g = Hijri(hijri_year, 1, 1).to_gregorian()
    return date(g.year, g.month, g.day)
