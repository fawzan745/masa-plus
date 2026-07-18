import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MonthCalendarGrid from "../components/MonthCalendarGrid";
import { getHijriMonthCalendar, getHijriYearCalendar } from "../lib/api";

export default function KalenderHijriah() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState([]);
  const [tahunCalendar, setTahunCalendar] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHijriMonthCalendar(year, month);
        setDays(data);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [year, month]);

  useEffect(() => {
    getHijriYearCalendar(year).then(setTahunCalendar).catch(() => {});
  }, [year]);

  function goPrevMonth() {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function goNextMonth() {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  }

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link
        to="/"
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          color: "var(--color-primary)", textDecoration: "none",
          fontSize: "0.85rem", marginBottom: "1.5rem",
        }}
      >
        ← Kembali ke Dashboard
      </Link>

      <h1 style={{ fontSize: "1.75rem", color: "var(--color-primary-dark)", marginBottom: "0.25rem" }}>
        Kalender Hijriah
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginTop: 0, marginBottom: "2rem" }}>
        Kalender Hijriah Global Tunggal (KHGT) -- Model Kongres Turki 2016
      </p>

      {error && (
        <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "1rem", borderRadius: "var(--radius-control)", marginBottom: "1.5rem" }}>
          Gagal memuat data: {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        <section style={sectionStyle}>
          <MonthCalendarGrid
            year={year}
            month={month}
            days={days}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
          />
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>
            Pergantian bulan Hijriah {year}
          </h2>
          {tahunCalendar.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Memuat...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <tbody>
                {tahunCalendar.map((item) => (
                  <tr key={item.hijriah}>
                    <td style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>
                      {item.hijriah}
                    </td>
                    <td style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--color-border)", textAlign: "right", color: "var(--color-text-secondary)" }}>
                      {new Date(item.awal_bulan_masehi + "T00:00:00").toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

const sectionStyle = {
  background: "var(--color-surface)",
  borderRadius: "var(--radius-card)",
  padding: "1.5rem",
  border: "1px solid var(--color-border)",
};
