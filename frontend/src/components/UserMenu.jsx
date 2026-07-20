import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function getInitial(user) {
  const name = user?.full_name || user?.email || "?";
  return name.trim().charAt(0).toUpperCase();
}

const AVATAR_COLORS = ["#0A4A8F", "#0F6E56", "#BA7517", "#8A3FFC", "#C13F3F", "#0E7C86"];
function getAvatarColor(user) {
  const key = user?.email || "";
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ user, size }) {
  if (user?.foto_url) {
    return (
      <div
        style={{
          width: size, height: size, borderRadius: "50%",
          backgroundImage: `url(${user.foto_url})`,
          backgroundSize: "cover", backgroundPosition: "center",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: getAvatarColor(user), color: "white",
        fontSize: size * 0.42, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {getInitial(user)}
    </div>
  );
}

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToAkun() {
    setOpen(false);
    navigate("/akun");
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu akun"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.5)",
          background: "none",
          padding: 0,
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <Avatar user={user} size={32} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            zIndex: 10,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-control)",
            boxShadow: "0 8px 24px rgba(20, 33, 61, 0.15)",
            width: "220px",
            maxWidth: "calc(100vw - 32px)",
            overflow: "hidden",
          }}
        >
          <button
            onClick={goToAkun}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", gap: "0.7rem",
              padding: "1rem",
              borderTop: "none", borderLeft: "none", borderRight: "none",
              borderBottom: "1px solid var(--color-border)",
              background: "none",
              cursor: "pointer", textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Avatar user={user} size={40} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.full_name || "Pengguna"}
              </p>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--color-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.email}
              </p>
            </div>
          </button>

          <button
            onClick={onLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "none",
              border: "none",
              padding: "0.8rem 1rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              color: "#A32D2D",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <LogoutIcon />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
