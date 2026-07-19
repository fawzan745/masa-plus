import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { getDoaKategori, getDoaList } from "../lib/api";

export default function DoaHarian() {
  const [kategoriList, setKategoriList] = useState([]);
  const [kategoriAktif, setKategoriAktif] = useState(null);
  const [doaList, setDoaList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDoaKategori()
      .then(setKategoriList)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    getDoaList(kategoriAktif)
      .then(setDoaList)
      .catch((err) => setError(err.message));
  }, [kategoriAktif]);

  return (
    <div>
      <AppHeader />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", color: "var(--color-primary-dark)", marginBottom: "0.25rem" }}>
          Doa Harian
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 0, marginBottom: "1.5rem" }}>
          Kumpulan doa sehari-hari lengkap dengan lafal Arab, latin, dan terjemahan
        </p>

        {error && (
          <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "1rem", borderRadius: "var(--radius-control)", marginBottom: "1.5rem" }}>
            Gagal memuat data: {error}
          </div>
        )}

        {/* Filter kategori */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <KategoriChip
            label="Semua"
            active={kategoriAktif === null}
            onClick={() => setKategoriAktif(null)}
          />
          {kategoriList.map((k) => (
            <KategoriChip
              key={k.nama}
              label={`${k.nama} (${k.jumlah})`}
              active={kategoriAktif === k.nama}
              onClick={() => setKategoriAktif(k.nama)}
            />
          ))}
        </div>

        {/* Daftar doa */}
        {doaList.length === 0 && !error && (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "2rem 0" }}>
            Memuat doa...
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.25rem" }}>
          {doaList.map((doa) => (
            <DoaCard key={doa.id} doa={doa} />
          ))}
        </div>
      </div>
    </div>
  );
}

function KategoriChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        borderRadius: "999px",
        padding: "0.4rem 0.9rem",
        fontSize: "0.8rem",
        fontWeight: 500,
        cursor: "pointer",
        background: active ? "var(--color-primary)" : "var(--color-surface-muted)",
        color: active ? "white" : "var(--color-text-secondary)",
      }}
    >
      {label}
    </button>
  );
}

function DoaCard({ doa }) {
  return (
    <section
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-card)",
        padding: "1.5rem",
        border: "1px solid var(--color-border)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <p style={{
        fontSize: "0.72rem", fontWeight: 600, color: "var(--color-primary)",
        textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.35rem",
      }}>
        {doa.kategori}
      </p>
      <h2 style={{ fontSize: "1.15rem", margin: "0 0 1rem", color: "var(--color-text-primary)" }}>
        {doa.judul}
      </h2>

      <p dir="rtl" style={{
        fontSize: "1.4rem", lineHeight: 2, textAlign: "right",
        color: "var(--color-text-primary)", margin: "0 0 1rem",
        fontFamily: "'Traditional Arabic', 'Amiri', serif",
      }}>
        {doa.arab}
      </p>

      <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", fontStyle: "italic", margin: "0 0 0.75rem" }}>
        {doa.latin}
      </p>

      <p style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", lineHeight: 1.6, margin: "0 0 0.75rem" }}>
        "{doa.terjemahan}"
      </p>

      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "auto 0 0" }}>
        {doa.sumber}
      </p>
    </section>
  );
}
