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
