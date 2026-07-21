import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../lib/AuthContext";
import { upsertIbadahLog, getIbadahHarian, getIbadahBulanan } from "../lib/api";
import { NAMA_HARI, NAMA_BULAN } from "../lib/tanggal";

const SHOLAT_LIST = [
  { key: "sholat_subuh", label: "Subuh" },
  { key: "sholat_dzuhur", label: "Dzuhur" },
  { key: "sholat_ashar", label: "Ashar" },
  { key: "sholat_maghrib", label: "Maghrib" },
  { key: "sholat_isya", label: "Isya" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function IbadahTracking() {
  const { token, isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tanggal, setTanggal] = useState(todayIso());
  const [harian, setHarian] = useState(null);
  const [bulanan, setBulanan] = useState([]);
  const [tilawahInput, setTilawahInput] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [error, setError] = useState(null);

  const now = new Date(tanggal + "T00:00:00");
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate("/login");
  }, [authLoading, isLoggedIn, navigate]);

  const loadHarian = useCallback(() => {
    if (!token) return;
    getIbadahHarian(token, tanggal)
      .then((data) => {
        setHarian(data);
        setTilawahInput(data.tilawah_halaman ?? "");
      })
      .catch((err) => setError(err.message));
  }, [token, tanggal]);

  const loadBulanan = useCallback(() => {
    if (!token) return;
    getIbadahBulanan(token, year, month)
      .then(setBulanan)
      .catch((err) => setError(err.message));
  }, [token, year, month]);

  useEffect(() => { loadHarian(); }, [loadHarian]);
  useEffect(() => { loadBulanan(); }, [loadBulanan]);

  async function toggleSholat(key, currentValue) {
    try {
      await upsertIbadahLog(token, { tanggal, jenis_ibadah: key, selesai: !currentValue });
      loadHarian();
      loadBulanan();
    } catch (err) {
      setError(err.message);
    }
  }

  async function togglePuasa() {
    try {
      await upsertIbadahLog(token, { tanggal, jenis_ibadah: "puasa", selesai: !harian.puasa });
      loadHarian();
      loadBulanan();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitTilawah(e) {
    e.preventDefault();
    const nilai = tilawahInput === "" ? null : Number(tilawahInput);
    try {
      await upsertIbadahLog(token, {
        tanggal, jenis_ibadah: "tilawah",
        selesai: nilai !== null && nilai > 0,
        nilai_numerik: nilai,
      });
      loadHarian();
      loadBulanan();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleCustom(nama, currentValue) {
    try {
      await upsertIbadahLog(token, { tanggal, jenis_ibadah: nama, selesai: !currentValue });
      loadHarian();
      loadBulanan();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addCustom(e) {
    e.preventDefault();
    if (!customInput.trim()) return;
    try {
      await upsertIbadahLog(token, { tanggal, jenis_ibadah: customInput.trim(), selesai: true });
      setCustomInput("");
      loadHarian();
      loadBulanan();
    } catch (err) {
      setError(err.message);
    }
  }

  function goPrevDay() {
    const d = new Date(tanggal + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setTanggal(d.toISOString().slice(0, 10));
  }
  function goNextDay() {
    const d = new Date(tanggal + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setTanggal(d.toISOString().slice(0, 10));
  }
  function goToday() {
    setTanggal(todayIso());
  }

  if (authLoading || !isLoggedIn) {
    return (
      <div>
        <AppHeader />
        <p style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>Memuat...</p>
      </div>
    );
  }

  const tanggalLabel = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .replace("Minggu", "Ahad");
  const isToday = tanggal === todayIso();

  return (
    <div>
      <AppHeader />
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", color: "var(--color-primary-dark)", marginBottom: "0.25rem" }}>
          Tracking Ibadah
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 0, marginBottom: "1.5rem" }}>
          Catat sholat, puasa, tilawah, dan kebiasaan ibadah lainnya
        </p>

        {error && (
          <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "1rem", borderRadius: "var(--radius-control)", marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <button onClick={goPrevDay} style={navBtnStyle} aria-label="Hari sebelumnya">‹</button>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>{tanggalLabel}</p>
            {!isToday && (
              <button onClick={goToday} style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: "0.78rem", cursor: "pointer", padding: 0, marginTop: "0.2rem" }}>
                Kembali ke hari ini
              </button>
            )}
          </div>
          <button onClick={goNextDay} style={navBtnStyle} aria-label="Hari berikutnya">›</button>
        </div>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Sholat 5 Waktu</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {SHOLAT_LIST.map((s) => (
              <ChecklistRow
                key={s.key}
                label={s.label}
                checked={harian?.sholat?.[s.key] || false}
                onToggle={() => toggleSholat(s.key, harian?.sholat?.[s.key])}
              />
            ))}
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Puasa</h2>
          <ChecklistRow
            label="Puasa hari ini"
            checked={harian?.puasa || false}
            onToggle={togglePuasa}
          />
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Tilawah Qur'an</h2>
          <form onSubmit={submitTilawah} style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="Jumlah halaman"
              value={tilawahInput}
              onChange={(e) => setTilawahInput(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" style={smallSubmitBtnStyle}>Simpan</button>
          </form>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Ibadah Lainnya</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
            {(harian?.lainnya || []).length === 0 && (
              <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", margin: 0 }}>
                Belum ada catatan lainnya untuk hari ini.
              </p>
            )}
            {(harian?.lainnya || []).map((item) => (
              <ChecklistRow
                key={item.jenis_ibadah}
                label={item.jenis_ibadah}
                checked={item.selesai}
                onToggle={() => toggleCustom(item.jenis_ibadah, item.selesai)}
              />
            ))}
          </div>
          <form onSubmit={addCustom} style={{ display: "flex", gap: "0.6rem" }}>
            <input
              type="text"
              placeholder="mis. Sedekah, Puasa Daud"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" style={smallSubmitBtnStyle}>Tambah</button>
          </form>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Progres Bulan {NAMA_BULAN[month - 1]}</h2>
          <MonthlyHeatmap data={bulanan} activeDate={tanggal} onSelectDate={setTanggal} />
        </section>
      </div>
    </div>
  );
}

function ChecklistRow({ label, checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        background: checked ? "var(--color-primary-light)" : "var(--color-surface-muted)",
        border: "none", borderRadius: "var(--radius-control)",
        padding: "0.7rem 0.9rem", cursor: "pointer", width: "100%", textAlign: "left",
      }}
    >
      <span
        style={{
          width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
          background: checked ? "var(--color-primary)" : "var(--color-surface)",
          border: checked ? "none" : "2px solid var(--color-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", fontWeight: checked ? 600 : 400 }}>
        {label}
      </span>
    </button>
  );
}

function MonthlyHeatmap({ data, activeDate, onSelectDate }) {
  if (!data || data.length === 0) {
    return <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>Memuat...</p>;
  }

  const firstDate = new Date(data[0].tanggal + "T00:00:00");
  const offset = firstDate.getDay();
  const cells = [...Array(offset).fill(null), ...data];

  function intensity(jumlahSholat) {
    if (jumlahSholat === 0) return "var(--color-surface-muted)";
    const opacities = [0.25, 0.45, 0.6, 0.8, 1];
    const alpha = opacities[Math.min(jumlahSholat - 1, 4)];
    return `rgba(10, 74, 143, ${alpha})`;
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "6px" }}>
        {NAMA_HARI.map((h) => (
          <div key={h} style={{ textAlign: "center", fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
            {h.slice(0, 3)}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const active = day.tanggal === activeDate;
          const dayNum = new Date(day.tanggal + "T00:00:00").getDate();
          return (
            <button
              key={day.tanggal}
              onClick={() => onSelectDate(day.tanggal)}
              title={`${day.tanggal}: ${day.jumlah_sholat_selesai}/5 sholat${day.puasa ? ", puasa" : ""}${day.tilawah_halaman ? `, tilawah ${day.tilawah_halaman} hlm` : ""}`}
              style={{
                aspectRatio: "1",
                borderRadius: "6px",
                border: active ? "2px solid var(--color-primary-dark)" : "2px solid transparent",
                background: intensity(day.jumlah_sholat_selesai),
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.65rem",
                color: day.jumlah_sholat_selesai >= 3 ? "white" : "var(--color-text-secondary)",
                position: "relative",
              }}
            >
              {dayNum}
              {day.puasa && (
                <span style={{ position: "absolute", bottom: "2px", right: "2px", width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-accent)" }} />
              )}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "1rem", fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
        <span>Sholat:</span>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{ width: "14px", height: "14px", borderRadius: "4px", background: intensity(n) }} />
        ))}
        <span style={{ marginLeft: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-accent)", display: "inline-block" }} />
          Puasa
        </span>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "var(--color-surface)",
  borderRadius: "var(--radius-card)",
  padding: "1.5rem",
  border: "1px solid var(--color-border)",
  marginBottom: "1.25rem",
};

const sectionTitleStyle = {
  fontSize: "1.05rem",
  marginBottom: "1rem",
};

const navBtnStyle = {
  background: "var(--color-surface-muted)",
  border: "none",
  borderRadius: "8px",
  width: "36px",
  height: "36px",
  fontSize: "1.3rem",
  cursor: "pointer",
  color: "var(--color-text-primary)",
};

const inputStyle = {
  padding: "0.6rem 0.8rem",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-control)",
  fontSize: "0.88rem",
  outline: "none",
  fontFamily: "var(--font-body)",
};

const smallSubmitBtnStyle = {
  background: "var(--color-primary)",
  color: "white",
  border: "none",
  borderRadius: "var(--radius-control)",
  padding: "0 1.1rem",
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer",
};
