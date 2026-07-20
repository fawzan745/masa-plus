import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import ImageCropper from "../components/ImageCropper";
import { useAuth } from "../lib/AuthContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getInitial(user) {
  const name = user?.full_name || user?.email || "?";
  return name.trim().charAt(0).toUpperCase();
}

export default function AkunEdit() {
  const { user, isLoggedIn, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState("");
  const [previewFoto, setPreviewFoto] = useState(null);
  const [rawImageSrc, setRawImageSrc] = useState(null); // foto asli, sebelum di-crop
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPreviewFoto(user.foto_url || null);
    }
  }, [user]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setRawImageSrc(ev.target.result);
    reader.onerror = () => setError("Gagal membaca file, coba file lain");
    reader.readAsDataURL(file);

    // Reset input supaya bisa pilih file yang sama lagi kalau mau ulang
    e.target.value = "";
  }

  function handleCropConfirm(dataUrl) {
    setPreviewFoto(dataUrl);
    setRawImageSrc(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await updateUser({ fullName, fotoUrl: previewFoto });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div>
        <AppHeader />
        <p style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>Memuat...</p>
      </div>
    );
  }

  return (
    <div>
      <AppHeader />

      {rawImageSrc && (
        <ImageCropper
          imageSrc={rawImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setRawImageSrc(null)}
        />
      )}

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.6rem", color: "var(--color-primary-dark)", marginBottom: "0.25rem" }}>
          Edit Akun
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 0, marginBottom: "2rem", fontSize: "0.9rem" }}>
          Perbarui nama dan foto profil kamu
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Foto profil */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100px", height: "100px", borderRadius: "50%",
                background: previewFoto ? `url(${previewFoto})` : "var(--color-primary)",
                backgroundSize: "cover", backgroundPosition: "center",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "2.2rem", fontWeight: 700,
                cursor: "pointer", border: "3px solid var(--color-border)",
                position: "relative",
              }}
            >
              {!previewFoto && getInitial(user)}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: "var(--color-surface-muted)", border: "none",
                borderRadius: "999px", padding: "0.4rem 0.9rem",
                fontSize: "0.8rem", color: "var(--color-text-secondary)", cursor: "pointer",
              }}
            >
              Ganti Foto
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          <Field label="Nama Lengkap">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Email">
            <input type="email" value={user.email} disabled style={{ ...inputStyle, background: "var(--color-surface-muted)", color: "var(--color-text-muted)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 400 }}>
              Email tidak bisa diubah
            </span>
          </Field>

          {error && (
            <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "0.75rem 1rem", borderRadius: "var(--radius-control)", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)", padding: "0.75rem 1rem", borderRadius: "var(--radius-control)", fontSize: "0.85rem" }}>
              Profil berhasil diperbarui.
            </div>
          )}

          <button type="submit" disabled={saving} style={submitBtnStyle}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
      {label}
      {children}
    </label>
  );
}

const inputStyle = {
  padding: "0.65rem 0.8rem",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-control)",
  fontSize: "0.9rem",
  outline: "none",
  fontFamily: "var(--font-body)",
};

const submitBtnStyle = {
  background: "var(--color-primary)",
  color: "white",
  border: "none",
  borderRadius: "var(--radius-control)",
  padding: "0.75rem",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
};
