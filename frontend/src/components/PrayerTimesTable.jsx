import { formatTanggalSingkat } from "../lib/tanggal";

const KOLOM = [
  { key: "subuh", label: "Subuh" },
  { key: "terbit", label: "Terbit" },
  { key: "dzuhur", label: "Dzuhur" },
  { key: "ashar", label: "Ashar" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isya", label: "Isya" },
];

function isHariIni(isoDate) {
  const today = new Date().toISOString().slice(0, 10);
  return isoDate === today;
}

export default function PrayerTimesTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "2rem 0" }}>
        Memuat jadwal sholat...
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr>
            <th style={thStyle}>Hari</th>
            {KOLOM.map((k) => (
              <th key={k.key} style={thStyle}>{k.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const { hari, tanggal } = formatTanggalSingkat(row.tanggal);
            const today = isHariIni(row.tanggal);
            return (
              <tr
                key={row.tanggal}
                style={{
                  background: today ? "var(--color-primary-light)" : "transparent",
                }}
              >
                <td style={{ ...tdStyle, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {hari}
                  <div style={{ fontWeight: 400, fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {tanggal}
                  </div>
                </td>
                {KOLOM.map((k) => (
                  <td key={k.key} style={tdStyle}>
                    {row.waktu[k.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  textAlign: "center",
  padding: "0.6rem 0.5rem",
  color: "var(--color-text-secondary)",
  fontWeight: 600,
  fontSize: "0.78rem",
  borderBottom: "2px solid var(--color-border)",
};

const tdStyle = {
  textAlign: "center",
  padding: "0.6rem 0.5rem",
  borderBottom: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
};
