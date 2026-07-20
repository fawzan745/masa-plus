const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function checkBackendHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error("Backend tidak merespons");
  return res.json();
}

export async function getPrayerTimes({ latitude, longitude, timezoneOffset = 7, targetDate = null }) {
  const res = await fetch(`${API_BASE_URL}/prayer-times`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      latitude,
      longitude,
      timezone_offset: timezoneOffset,
      target_date: targetDate,
    }),
  });
  if (!res.ok) throw new Error("Gagal mengambil jadwal sholat");
  return res.json();
}

export async function getPrayerTimesRange({ latitude, longitude, timezoneOffset = 7, days = 7 }) {
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const results = await Promise.all(
    dates.map((targetDate) => getPrayerTimes({ latitude, longitude, timezoneOffset, targetDate }))
  );
  return results;
}

export async function getHijriDate(targetDate = null) {
  const url = new URL(`${API_BASE_URL}/hijri-date`);
  if (targetDate) url.searchParams.set("target_date", targetDate);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil tanggal Hijriah");
  return res.json();
}

export async function getHijriYearCalendar(year = null) {
  const url = new URL(`${API_BASE_URL}/hijri-calendar/year`);
  if (year) url.searchParams.set("year", year);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil kalender Hijriah");
  return res.json();
}

export async function getFastingCalendar(year, month) {
  const url = new URL(`${API_BASE_URL}/fasting-calendar`);
  if (year) url.searchParams.set("year", year);
  if (month) url.searchParams.set("month", month);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil kalender puasa");
  return res.json();
}

export async function registerUser({ email, password, fullName }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Gagal mendaftar");
  }
  return res.json();
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Gagal masuk");
  }
  return res.json();
}

export async function getMe(token) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Token tidak valid");
  return res.json();
}

export async function getHijriYearStart(hijriYear) {
  const url = new URL(`${API_BASE_URL}/hijri-calendar/hijri-year-start`);
  url.searchParams.set("hijri_year", hijriYear);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil awal tahun Hijriah");
  return res.json();
}

export async function getAyatOfTheDay() {
  const res = await fetch(`${API_BASE_URL}/quran/ayat-of-the-day`);
  if (!res.ok) throw new Error("Gagal mengambil ayat hari ini");
  return res.json();
}
export async function getDoaKategori() {
  const res = await fetch(`${API_BASE_URL}/doa/kategori`);
  if (!res.ok) throw new Error("Gagal mengambil kategori doa");
  return res.json();
}

export async function getDoaList(kategori = null) {
  const url = new URL(`${API_BASE_URL}/doa`);
  if (kategori) url.searchParams.set("kategori", kategori);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil daftar doa");
  return res.json();
}
export async function getHijriMonthView(hijriYear, hijriMonth) {
  const url = new URL(`${API_BASE_URL}/hijri-calendar/hijri-month`);
  url.searchParams.set("hijri_year", hijriYear);
  url.searchParams.set("hijri_month", hijriMonth);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil kalender bulan Hijriah");
  return res.json();
}

export async function getHijriMonthCalendar(year, month) {
  const url = new URL(`${API_BASE_URL}/hijri-calendar/month`);
  if (year) url.searchParams.set("year", year);
  if (month) url.searchParams.set("month", month);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil kalender bulanan");
  return res.json();
}

// Nanti tambah fungsi lain di sini, misal:
// export async function loginUser(email, password) { ... }
// export async function askUstadzAI(question) { ... }
