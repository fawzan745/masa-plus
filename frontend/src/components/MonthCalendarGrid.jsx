import { NAMA_HARI, NAMA_BULAN, NAMA_BULAN_HIJRIAH } from "../lib/tanggal";

const JENIS_DOT = {
  wajib: "var(--color-primary)",
  sunnah: "var(--color-accent)",
  terlarang: "#C13F3F",
};

function isHariIni(isoDate) {
  return isoDate === new Date().toISOString().slice(0, 10);
}

export default function MonthCalendarGrid({ headerLabel, days, primary = "masehi", onPrevMonth, onNextMonth }) {
  if (!days || days.length === 0) {
    return <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "2rem 0" }}>Memuat kalender...</p>;
  }

  const firstDate = new Date(days[0].tanggal_masehi + "T00:00:00");
  const offset = firstDate.getDay();
  const cells = [...Array(offset).fill(null), ...days];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <button onClick={onPrevMonth} style={navBtnStyle} aria-label="Sebelumnya">‹</button>
        <h3 style={{ fontSize: "1rem", margin: 0 }}>{headerLabel}</h3>
        <button onClick={onNextMonth} style={navBtnStyle} aria-label="Berikutnya">›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "6px" }}>
        {NAMA_HARI.map((h) => (
          <div key={h} style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
            {h.slice(0, 3)}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const gregDate = new Date(day.tanggal_masehi + "T00:00:00");
          const gregDay = gregDate.getDate();
          const gregMonthFull = NAMA_BULAN[gregDate.getMonth()];
          const hijriDay = day.hijri_tanggal;
          const hijriMonthFull = day.hijri_bulan;

          const utama = primary === "hijriah"
            ? { besar: hijriDay, kecil: `${gregDay} ${gregMonthFull}` }
            : { besar: gregDay, kecil: `${hijriDay} ${hijriMonthFull}` };

          const today = isHariIni(day.tanggal_masehi);

          return (
            <div
              key={day.tanggal_masehi}
              title={`${day.tanggal_masehi} -- ${day.hijriah}`}
              style={{
                minHeight: "76px",
                borderRadius: "8px",
                background: today ? "var(--color-primary)" : "var(--color-surface-muted)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 3px",
              }}
            >
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: today ? "white" : "var(--color-text-primary)" }}>
                {utama.besar}
              </span>
              <span style={{
                fontSize: "0.58rem",
                marginTop: "5px",
                color: today ? "rgba(255,255,255,0.85)" : "var(--color-text-muted)",
                textAlign: "center",
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}>
                {utama.kecil}
              </span>
              {day.puasa.length > 0 && (
                <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                  {day.puasa.slice(0, 3).map((p, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: "5px", height: "5px", borderRadius: "50%",
                        background: today ? "white" : (JENIS_DOT[p.jenis] || JENIS_DOT.sunnah),
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: "0.72rem", color: "var(--color-text-secondary)", flexWrap: "wrap" }}>
        <Legend color={JENIS_DOT.wajib} label="Wajib" />
        <Legend color={JENIS_DOT.sunnah} label="Sunnah" />
        <Legend color={JENIS_DOT.terlarang} label="Terlarang" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

const navBtnStyle = {
  background: "var(--color-surface-muted)",
  border: "none",
  borderRadius: "8px",
  width: "32px",
  height: "32px",
  fontSize: "1.2rem",
  cursor: "pointer",
  color: "var(--color-text-primary)",
};
