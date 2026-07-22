/** Format Date jadi string "YYYY-MM-DD" berdasarkan tanggal LOKAL,
 * bukan UTC -- JANGAN pakai .toISOString() untuk ini, karena itu
 * konversi ke UTC dan bisa mundur/maju 1 hari di zona waktu WIB dkk. */
export function toIsoDateLocal(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Tanggal hari ini dalam format "YYYY-MM-DD", aman dari bug timezone. */
export function todayIsoLocal() {
  return toIsoDateLocal(new Date());
}

/** Tambah/kurang hari dari tanggal ISO "YYYY-MM-DD", hasil tetap ISO,
 * aman dari bug timezone (parsing manual, bukan lewat Date+toISOString). */
export function addDaysIso(isoDate, delta) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toIsoDateLocal(date);
}

export const NAMA_HARI = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
export const NAMA_BULAN_HIJRIAH = [
  "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal",
  "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadan", "Syawal",
  "Dzulqaidah", "Dzulhijjah",
];

export const NAMA_BULAN_HIJRIAH_SINGKAT = [
  "Muh", "Saf", "R. Awal", "R. Akhir", "J. Awal",
  "J. Akhir", "Rajab", "Sya'ban", "Ramadan", "Syawal",
  "Dzulqaidah", "Dzulhijjah",
];

/** Format lengkap, mis. "Ahad, 12 Juli 2026" */
export function formatTanggalLengkap(date) {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return `${NAMA_HARI[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/** Format singkat, mis. "Ahad, 12 Jul" */
export function formatTanggalSingkat(date) {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return { hari: NAMA_HARI[d.getDay()], tanggal: `${d.getDate()} ${NAMA_BULAN[d.getMonth()].slice(0, 3)}` };
}
