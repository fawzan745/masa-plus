import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MonthCalendarGrid from "../components/MonthCalendarGrid";
import DateModeSelector from "../components/DateModeSelector";
import FastingDetailList from "../components/FastingDetailList";
import { getHijriMonthCalendar, getHijriMonthView, getHijriDate } from "../lib/api";
import { NAMA_BULAN, NAMA_BULAN_HIJRIAH } from "../lib/tanggal";

export default function KalenderHijriah() {
  const now = new Date();

  // State terpisah untuk tiap sistem kalender -- supaya pindah-pindah mode
  // tidak saling menimpa posisi terakhir masing-masing
  const [gregYear, setGregYear] = useState(now.getFullYear());
  const [gregMonth, setGregMonth] = useState(now.getMonth() + 1);
  const [hijriYear, setHijriYear] = useState(null);
  const [hijriMonth, setHijriMonth] = useState(null);

  const [primary, setPrimary] = useState("masehi");
  const [days, setDays] = useState([]);
  const [error, setError] = useState(null);

  // Begitu halaman dibuka, cari tahu bulan Hijriah hari ini -- jadi begitu
  // user pindah ke mode Hijriah, otomatis mulai dari bulan berjalan
  useEffect(() => {
    getHijriDate()
      .then((data) => {
        setHijriYear(data.tahun);
        setHijriMonth(data.bulan);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      try {
        if (primary === "masehi") {
          const data = await getHijriMonthCalendar(gregYear, gregMonth);
          setDays(data);
        } else if (hijriYear && hijriMonth) {
          const data = await getHijriMonthView(hijriYear, hijriMonth);
          setDays(data);
        }
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [primary, gregYear, gregMonth, hijriYear, hijriMonth]);

  function goPrev() {
    if (primary === "masehi") {
      if (gregMonth === 1) { setGregMonth(12); setGregYear(gregYear - 1); }
      else setGregMonth(gregMonth - 1);
    } else {
      if (hijriMonth === 1) { setHijriMonth(12); setHijriYear(hijriYear - 1); }
      else setHijriMonth(hijriMonth - 1);
    }
  }

  function goNext() {
    if (primary === "masehi") {
      if (gregMonth === 12) { setGregMonth(1); setGregYear(gregYear + 1); }
      else setGregMonth(gregMonth + 1);
    } else {
      if (hijriMonth === 12) { setHijriMonth(1); setHijriYear(hijriYear + 1); }
      else setHijriMonth(hijriMonth + 1);
    }
  }

  const headerLabel = primary === "masehi"
    ? `${NAMA_BULAN[gregMonth - 1]} ${gregYear}`
    : (hijriMonth ? `${NAMA_BULAN_HIJRIAH[hijriMonth - 1]} ${hijriYear} H` : "Memuat...");

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
      <p style={{ color: "var(--color-text-secondary)", marginTop: 0, marginBottom: "1.5rem" }}>
        Kalender Hijriah Global Tunggal (KHGT) -- Model Kongres Turki 2016
      </p>

      {error && (
        <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "1rem", borderRadius: "var(--radius-control)", marginBottom: "1.5rem" }}>
          Gagal memuat data: {error}
        </div>
      )}

      <DateModeSelector
        primary={primary}
        onChangePrimary={setPrimary}
        gregorianYear={gregYear}
        hijriYear={hijriYear}
        onChangeGregorianYear={setGregYear}
        onChangeHijriYear={setHijriYear}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        <section style={sectionStyle}>
          <MonthCalendarGrid
            headerLabel={headerLabel}
            days={days}
            primary={primary}
            onPrevMonth={goPrev}
            onNextMonth={goNext}
          />
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "1.1rem" }}>
            Detail puasa bulan ini
          </h2>
          <FastingDetailList days={days} />
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
