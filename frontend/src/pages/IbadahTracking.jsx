import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../lib/AuthContext";
import { upsertIbadahLog, getIbadahHarian, getIbadahBulanan, getSurahList } from "../lib/api";
import { NAMA_HARI, NAMA_BULAN, todayIsoLocal, addDaysIso } from "../lib/tanggal";

const RAWATIB_PER_WAJIB = {
  sholat_subuh: [{ key: "rawatib_qabliyah_subuh", label: "Qabliyah Subuh" }],
  sholat_dzuhur: [
    { key: "rawatib_qabliyah_dzuhur", label: "Qabliyah Dzuhur" },
    { key: "rawatib_badiyah_dzuhur", label: "Ba'diyah Dzuhur" },
  ],
  sholat_ashar: [{ key: "rawatib_qabliyah_ashar", label: "Qabliyah Ashar" }],
  sholat_maghrib: [{ key: "rawatib_badiyah_maghrib", label: "Ba'diyah Maghrib" }],
  sholat_isya: [{ key: "rawatib_badiyah_isya", label: "Ba'diyah Isya" }],
};

const SHOLAT_WAJIB_LIST = [
  { key: "sholat_subuh", label: "Subuh" },
  { key: "sholat_dzuhur", label: "Dzuhur" },
  { key: "sholat_ashar", label: "Ashar" },
  { key: "sholat_maghrib", label: "Maghrib" },
  { key: "sholat_isya", label: "Isya" },
];

const SUNNAH_LAIN_LIST = [
  { key: "sholat_tahajud", label: "Tahajud" },
  { key: "sholat_dhuha", label: "Dhuha" },
  { key: "sholat_tahiyatul_masjid", label: "Tahiyatul Masjid" },
];

export default function IbadahTracking() {
  const { token, isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tanggal, setTanggal] = useState(todayIsoLocal());
  const [harian, setHarian] = useState(null);
  const [bulanan, setBulanan] = useState([]);
  const [surahList, setSurahList] = useState([]);
  const [catatanDraft, setCatatanDraft] = useState({});
  const [error, setError] = useState(null);

  const now = new Date(tanggal + "T00:00:00");
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate("/login");
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    getSurahList().then(setSurahList).catch(() => {});
  }, []);

  const loadHarian = useCallback(() => {
    if (!token) return;
    getIbadahHarian(token, tanggal)
      .then((data) => {
        setHarian(data);
        const draft = {};
        Object.entries(data.sholat_wajib).forEach(([k, v]) => (draft[k] = v.catatan || ""));
        Object.entries(data.sunnah_lain).forEach(([k, v]) => (draft[k] = v.catatan || ""));
        draft.puasa = data.puasa.catatan || "";
        setCatatanDraft(draft);
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

  async function save(jenis, changes) {
    try {
      await upsertIbadahLog(token, { tanggal, jenis_ibadah: jenis, ...changes });
      loadHarian();
      loadBulanan();
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleWajib(key, current) {
    save(key, { selesai: !current.selesai, catatan: catatanDraft[key] || null });
  }
  function toggleRawatib(key, current) {
    save(key, { selesai: !current });
  }
  function toggleSunnahLain(key, current) {
    save(key, { selesai: !current.selesai, catatan: catatanDraft[key] || null });
  }
  function togglePuasa() {
    save("puasa", { selesai: !harian.puasa.selesai, catatan: catatanDraft.puasa || null });
  }
  function blurCatatan(key, currentSelesai) {
    save(key, { selesai: currentSelesai, catatan: catatanDraft[key] || null });
  }

  function goPrevDay() { setTanggal(addDaysIso(tanggal, -1)); }
  function goNextDay() { setTanggal(addDaysIso(tanggal, 1)); }
  function goToday() { setTanggal(todayIsoLocal()); }

  if (authLoading || !isLoggedIn) {
    return (
      <div>
        <AppHeader />
        <p style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>Memuat...</p>
      </div>
    );
  }

  const tanggalLabel = `${NAMA_HARI[now.getDay()]}, ${now.getDate()} ${NAMA_BULAN[now.getMonth()]} ${now.getFullYear()}`;
  const isToday = tanggal === todayIsoLocal();

  return (
    <div>
      <AppHeader />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", color: "var(--color-primary-dark)", marginBottom: "0.25rem" }}>
          Tracking Ibadah
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 0, marginBottom: "1.5rem" }}>
          Catat sholat, puasa, tilawah, dan hafalan harianmu
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Sholat 5 Waktu</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {SHOLAT_WAJIB_LIST.map((s) => (
                <div key={s.key}>
                  <ChecklistRow
                    label={s.label}
                    checked={harian?.sholat_wajib?.[s.key]?.selesai || false}
                    onToggle={() => toggleWajib(s.key, harian.sholat_wajib[s.key])}
                  />
                  <input
                    type="text"
                    placeholder="Catatan (opsional)"
                    value={catatanDraft[s.key] || ""}
                    onChange={(e) => setCatatanDraft((d) => ({ ...d, [s.key]: e.target.value }))}
                    onBlur={() => blurCatatan(s.key, harian?.sholat_wajib?.[s.key]?.selesai || false)}
                    style={{ ...inputStyle, fontSize: "0.78rem", marginTop: "0.35rem", padding: "0.4rem 0.6rem" }}
                  />
                  {RAWATIB_PER_WAJIB[s.key] && (
                    <div style={{ marginLeft: "1.25rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      {RAWATIB_PER_WAJIB[s.key].map((r) => (
                        <ChecklistRow
                          key={r.key}
                          label={r.label}
                          small
                          checked={harian?.rawatib?.[r.key]?.selesai || false}
                          onToggle={() => toggleRawatib(r.key, harian?.rawatib?.[r.key]?.selesai || false)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <h2 style={{ ...sectionTitleStyle, marginTop: "1.5rem" }}>Sholat Sunnah Lainnya</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {SUNNAH_LAIN_LIST.map((s) => (
                <div key={s.key}>
                  <ChecklistRow
                    label={s.label}
                    checked={harian?.sunnah_lain?.[s.key]?.selesai || false}
                    onToggle={() => toggleSunnahLain(s.key, harian.sunnah_lain[s.key])}
                  />
                  <input
                    type="text"
                    placeholder="Catatan (opsional)"
                    value={catatanDraft[s.key] || ""}
                    onChange={(e) => setCatatanDraft((d) => ({ ...d, [s.key]: e.target.value }))}
                    onBlur={() => blurCatatan(s.key, harian?.sunnah_lain?.[s.key]?.selesai || false)}
                    style={{ ...inputStyle, fontSize: "0.78rem", marginTop: "0.35rem", padding: "0.4rem 0.6rem" }}
                  />
                </div>
              ))}
            </div>
          </section>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", height: "100%" }}>
            <section style={{ ...cardStyle, flex: 1, display: "flex", flexDirection: "column" }}>
              <h2 style={sectionTitleStyle}>Puasa</h2>
              <ChecklistRow
                label="Puasa hari ini"
                checked={harian?.puasa?.selesai || false}
                onToggle={togglePuasa}
              />
              <input
                type="text"
                placeholder="Catatan (opsional)"
                value={catatanDraft.puasa || ""}
                onChange={(e) => setCatatanDraft((d) => ({ ...d, puasa: e.target.value }))}
                onBlur={() => blurCatatan("puasa", harian?.puasa?.selesai || false)}
                style={{ ...inputStyle, fontSize: "0.78rem", marginTop: "0.35rem", padding: "0.4rem 0.6rem" }}
              />
            </section>

            <section style={{ ...cardStyle, flex: 1, display: "flex", flexDirection: "column" }}>
              <h2 style={sectionTitleStyle}>Tilawah Qur'an</h2>
              <AyatRefForm
                current={harian?.tilawah}
                surahList={surahList}
                onSave={(changes) => save("tilawah", changes)}
              />
            </section>

            <section style={{ ...cardStyle, flex: 1, display: "flex", flexDirection: "column" }}>
              <h2 style={sectionTitleStyle}>Hafalan Qur'an</h2>
              <AyatRefForm
                current={harian?.hafalan}
                surahList={surahList}
                onSave={(changes) => save("hafalan", changes)}
              />
            </section>
          </div>
        </div>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Progres Bulan {NAMA_BULAN[month - 1]}</h2>
          <MonthlyHeatmap data={bulanan} activeDate={tanggal} onSelectDate={setTanggal} />
        </section>
      </div>
    </div>
  );
}

function ChecklistRow({ label, checked, onToggle, small }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: "0.65rem",
        background: checked ? "var(--color-primary-light)" : "var(--color-surface-muted)",
        border: "none", borderRadius: "var(--radius-control)",
        padding: small ? "0.5rem 0.75rem" : "0.7rem 0.9rem",
        cursor: "pointer", width: "100%", textAlign: "left",
      }}
    >
      <span
        style={{
          width: small ? "16px" : "20px", height: small ? "16px" : "20px",
          borderRadius: "6px", flexShrink: 0,
          background: checked ? "var(--color-primary)" : "var(--color-surface)",
          border: checked ? "none" : "2px solid var(--color-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {checked && (
          <svg width={small ? "10" : "12"} height={small ? "10" : "12"} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: small ? "0.82rem" : "0.9rem", color: "var(--color-text-primary)", fontWeight: checked ? 600 : 400 }}>
        {label}
      </span>
    </button>
  );
}

function AyatRefForm({ current, surahList, onSave }) {
  const [surahNomor, setSurahNomor] = useState("");
  const [ayatMulai, setAyatMulai] = useState("");
  const [ayatAkhir, setAyatAkhir] = useState("");
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    if (current) {
      setSurahNomor(current.surah_nomor || "");
      setAyatMulai(current.ayat_mulai || "");
      setAyatAkhir(current.ayat_akhir || "");
      setCatatan(current.catatan || "");
    }
  }, [current]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!surahNomor) return;
    onSave({
      selesai: true,
      surah_nomor: Number(surahNomor),
      ayat_mulai: ayatMulai ? Number(ayatMulai) : null,
      ayat_akhir: ayatAkhir ? Number(ayatAkhir) : null,
      catatan: catatan || null,
    });
  }

  return (
    <div>
      {current?.surah_nama && (
        <p style={{ fontSize: "0.85rem", color: "var(--color-primary-dark)", fontWeight: 600, margin: "0 0 0.75rem" }}>
          {current.surah_nama}
          {current.ayat_mulai && ` : ${current.ayat_mulai}${current.ayat_akhir && current.ayat_akhir !== current.ayat_mulai ? `-${current.ayat_akhir}` : ""}`}
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <select
          value={surahNomor}
          onChange={(e) => setSurahNomor(e.target.value)}
          style={inputStyle}
        >
          <option value="">Pilih surat...</option>
          {surahList.map((s) => (
            <option key={s.nomor} value={s.nomor}>{s.nomor}. {s.nama}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="number" min="1" placeholder="Ayat mulai"
            value={ayatMulai} onChange={(e) => setAyatMulai(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="number" min="1" placeholder="Ayat akhir"
            value={ayatAkhir} onChange={(e) => setAyatAkhir(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
        <input
          type="text" placeholder="Catatan (opsional)"
          value={catatan} onChange={(e) => setCatatan(e.target.value)}
          style={{ ...inputStyle, fontSize: "0.82rem" }}
        />
        <button type="submit" style={smallSubmitBtnStyle}>Simpan</button>
      </form>
    </div>
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
              title={`${day.tanggal}: ${day.jumlah_sholat_wajib_selesai}/5 sholat${day.puasa ? ", puasa" : ""}${day.tilawah ? ", tilawah" : ""}${day.hafalan ? ", hafalan" : ""}`}
              style={{
                aspectRatio: "1",
                borderRadius: "6px",
                border: active ? "2px solid var(--color-primary-dark)" : "2px solid transparent",
                background: intensity(day.jumlah_sholat_wajib_selesai),
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.65rem",
                color: day.jumlah_sholat_wajib_selesai >= 3 ? "white" : "var(--color-text-secondary)",
                position: "relative",
              }}
            >
              {dayNum}
              {(day.puasa || day.tilawah || day.hafalan) && (
                <span style={{ position: "absolute", bottom: "2px", right: "2px", width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-accent)" }} />
              )}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "1rem", fontSize: "0.72rem", color: "var(--color-text-secondary)", flexWrap: "wrap" }}>
        <span>Sholat:</span>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{ width: "14px", height: "14px", borderRadius: "4px", background: intensity(n) }} />
        ))}
        <span style={{ marginLeft: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-accent)", display: "inline-block" }} />
          Puasa/Tilawah/Hafalan
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
  height: "100%",
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
  width: "100%",
};

const smallSubmitBtnStyle = {
  background: "var(--color-primary)",
  color: "white",
  border: "none",
  borderRadius: "var(--radius-control)",
  padding: "0.55rem",
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer",
};
