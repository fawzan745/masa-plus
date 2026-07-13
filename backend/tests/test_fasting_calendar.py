"""Tes otomatis untuk app/services/fasting_calendar.py"""

from datetime import date

from app.services.fasting_calendar import get_fasting_info


def test_puasa_senin():
    d = date(2026, 7, 6)  # Senin
    hasil = get_fasting_info(hijri_month=1, hijri_day=21, gregorian_date=d)
    nama = [f.nama for f in hasil]
    assert "Puasa Senin" in nama


def test_puasa_kamis():
    d = date(2026, 7, 9)  # Kamis
    hasil = get_fasting_info(hijri_month=1, hijri_day=24, gregorian_date=d)
    nama = [f.nama for f in hasil]
    assert "Puasa Kamis" in nama


def test_ayyamul_bidh():
    d = date(2026, 7, 28)
    hasil = get_fasting_info(hijri_month=2, hijri_day=13, gregorian_date=d)
    nama = [f.nama for f in hasil]
    assert "Puasa Ayyamul Bidh" in nama


def test_ramadan_wajib_bukan_sunnah():
    """Saat Ramadan, tidak boleh ada anjuran sunnah lain (Senin/Kamis/dst)
    yang tercampur — cukup 1 entri wajib puasa Ramadan."""
    d = date(2026, 2, 19)  # Kamis, hari ke-2 Ramadan
    hasil = get_fasting_info(hijri_month=9, hijri_day=2, gregorian_date=d)
    assert len(hasil) == 1
    assert hasil[0].jenis == "wajib"
    assert hasil[0].nama == "Puasa Ramadan"


def test_idulfitri_terlarang():
    d = date(2026, 3, 20)
    hasil = get_fasting_info(hijri_month=10, hijri_day=1, gregorian_date=d)
    assert len(hasil) == 1
    assert hasil[0].jenis == "terlarang"


def test_hari_tasyrik_terlarang_bukan_ayyamul_bidh():
    """13 Dzulhijjah adalah Hari Tasyrik (terlarang puasa), BUKAN
    Ayyamul Bidh meskipun tanggalnya masuk rentang 13-15."""
    d = date(2026, 5, 30)
    hasil = get_fasting_info(hijri_month=12, hijri_day=13, gregorian_date=d)
    assert len(hasil) == 1
    assert hasil[0].jenis == "terlarang"
    nama = [f.nama for f in hasil]
    assert "Puasa Ayyamul Bidh" not in nama


def test_ayyamul_bidh_tetap_ada_di_tanggal_14_dzulhijjah():
    """14 Dzulhijjah BUKAN Hari Tasyrik, jadi Ayyamul Bidh tetap
    berlaku normal (beda dengan tanggal 13)."""
    d = date(2026, 5, 31)
    hasil = get_fasting_info(hijri_month=12, hijri_day=14, gregorian_date=d)
    nama = [f.nama for f in hasil]
    assert "Puasa Ayyamul Bidh" in nama


def test_puasa_arafah():
    d = date(2026, 5, 26)
    hasil = get_fasting_info(hijri_month=12, hijri_day=9, gregorian_date=d)
    nama = [f.nama for f in hasil]
    assert "Puasa Arafah" in nama


def test_puasa_asyura():
    d = date(2026, 6, 25)
    hasil = get_fasting_info(hijri_month=1, hijri_day=10, gregorian_date=d)
    nama = [f.nama for f in hasil]
    assert "Puasa Asyura" in nama


def test_puasa_syawal_tidak_di_tanggal_1():
    """Tanggal 1 Syawal adalah Idulfitri (terlarang), Puasa Syawal
    baru berlaku mulai tanggal 2."""
    d = date(2026, 3, 21)
    hasil = get_fasting_info(hijri_month=10, hijri_day=2, gregorian_date=d)
    nama = [f.nama for f in hasil]
    assert "Puasa Syawal" in nama
