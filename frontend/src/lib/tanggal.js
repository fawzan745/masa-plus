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
