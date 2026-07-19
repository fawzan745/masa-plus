import { NAMA_HARI } from "../lib/tanggal";

const JENIS_STYLE = {
  wajib: { bg: "var(--color-primary-light)", text: "var(--color-primary-dark)" },
  sunnah: { bg: "var(--color-accent-light)", text: "#8A6200" },
  terlarang: { bg: "#FCEBEB", text: "#A32D2D" },
};

export default function FastingDetailList({ days }) {
  const hariPuasa = (days || []).filter((d) => d.puasa.length > 0);

  if (hariPuasa.length === 0) {
    return <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Tidak ada anjuran/larangan puasa di bulan ini.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {hariPuasa.map((day) => {
        const d = new Date(day.tanggal_masehi + "T00:00:00");
        const hariNama = NAMA_HARI[d.getDay()];
        const tanggalFormat = d.toLocaleDateString("id-ID", { day: "numeric", month: "long" });

        return (
          <div key={day.tanggal_masehi} style={{ borderLeft: "3px solid var(--color-border)", paddingLeft: "0.9rem" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
              {hariNama}, {tanggalFormat} <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>({day.hijriah})</span>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.4rem" }}>
              {day.puasa.map((p, i) => {
                const style = JENIS_STYLE[p.jenis] || JENIS_STYLE.sunnah;
                return (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <span style={{
                      background: style.bg, color: style.text,
                      padding: "0.15rem 0.55rem", borderRadius: "999px",
                      fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap",
                    }}>
                      {p.nama}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
                      {p.keterangan}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
