import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LocationPicker from "../components/LocationPicker";
import PrayerTimesTable from "../components/PrayerTimesTable";
import { useLocation } from "../lib/useLocation";
import { getPrayerTimesRange, getHijriDate } from "../lib/api";
import { formatTanggalLengkap } from "../lib/tanggal";

export default function Dashboard() {
  const { location, loading: loadingLocation, useCurrentLocation, setManualLocation } = useLocation();
  const [prayerData, setPrayerData] = useState(null);
  const [hijriData, setHijriData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location) return;

    async function loadData() {
      try {
        const [prayerRange, hijri] = await Promise.all([
          getPrayerTimesRange({ latitude: location.latitude, longitude: location.longitude, days: 7 }),
          getHijriDate(),
        ]);
        setPrayerData(prayerRange);
        setHijriData(hijri);
      } catch (err) {
        setError(err.message);
      }
    }

    loadData();
  }, [location]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar penuh selebar layar */}
      <header
        style={{
          background: "var(--color-primary)",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.4rem", color: "white" }}>Masa Plus</h1>
        <LocationPicker
          location={location}
          loading={loadingLocation}
          onUseCurrentLocation={useCurrentLocation}
          onSelectLocation={setManualLocation}
        />
      </header>

      <main style={{ flex: 1, maxWidth: "980px", width: "100%", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {error && (
          <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "1rem", borderRadius: "var(--radius-control)", marginBottom: "1.5rem" }}>
            Gagal memuat data: {error}. Pastikan backend jalan di localhost:8000.
          </div>
        )}

        {/* Bagian "hari" -- tanggal Masehi & Hijriah, ditaruh di atas jadwal sholat */}
        <section
          style={{
            background: "var(--color-primary)",
            color: "white",
            borderRadius: "var(--radius-card)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <p style={{ margin: 0, opacity: 0.85, fontSize: "0.85rem" }}>{formatTanggalLengkap(new Date())}</p>
            <h2 style={{ fontSize: "1.5rem", margin: "0.2rem 0 0", color: "white" }}>
              {hijriData ? hijriData.hijriah : "Memuat..."}
            </h2>
          </div>
          <Link
            to="/kalender"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              color: "white",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
              background: "rgba(255,255,255,0.15)",
              padding: "0.5rem 0.9rem",
              borderRadius: "999px",
              whiteSpace: "nowrap",
            }}
          >
            Selengkapnya
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </section>

        {/* Tabel jadwal sholat 7 hari */}
        <section
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-card)",
            padding: "1.5rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>
            Jadwal sholat 7 hari
          </h2>
          <PrayerTimesTable data={prayerData} />
        </section>
      </main>
    </div>
  );
}
