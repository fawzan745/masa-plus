export default function AyatOfDayCard({ ayat }) {
  if (!ayat) {
    return (
      <section style={cardStyle}>
        <p style={{ color: "var(--color-text-muted)", textAlign: "center", margin: 0 }}>Memuat ayat hari ini...</p>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <p style={{
        fontSize: "0.78rem", fontWeight: 600, color: "var(--color-primary)",
        textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 1rem",
      }}>
        Ayat Hari Ini
      </p>

      <p dir="rtl" style={{
        fontSize: "1.5rem", lineHeight: 2, textAlign: "right",
        color: "var(--color-text-primary)", margin: "0 0 1rem",
        fontFamily: "'Traditional Arabic', 'Amiri', serif",
      }}>
        {ayat.teks_arab}
      </p>

      <p style={{ fontSize: "0.92rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 0.75rem" }}>
        "{ayat.terjemahan}"
      </p>

      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>
        QS. {ayat.surah} ayat {ayat.nomor_ayat}
      </p>
    </section>
  );
}

const cardStyle = {
  background: "var(--color-surface)",
  borderRadius: "var(--radius-card)",
  padding: "1.75rem",
  border: "1px solid var(--color-border)",
  marginTop: "1.5rem",
};
