import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <AppHeader />
      <div style={{ maxWidth: "420px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.6rem", color: "var(--color-primary-dark)", marginBottom: "0.25rem" }}>
          Masuk
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 0, marginBottom: "2rem", fontSize: "0.9rem" }}>
          Masuk untuk akses Tanya Ustadz AI dan Tracking Ibadah
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Kata Sandi">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </Field>

          {error && (
            <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "0.75rem 1rem", borderRadius: "var(--radius-control)", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={submitBtnStyle}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
          Belum punya akun?{" "}
          <Link to="/register" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
            Daftar di sini
          </Link>
        </p>
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
  marginTop: "0.5rem",
};
