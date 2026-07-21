import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import UserMenu from "./UserMenu";

const NAV_ITEMS = [
  { to: "/", label: "Beranda" },
  { to: "/kalender", label: "Kalender" },
  { to: "/doa", label: "Doa Harian" },
  { to: "/ibadah", label: "Ibadah" },
];

export default function AppHeader({ children }) {
  const { pathname } = useLocation();
  const { user, isLoggedIn, logout, loading } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
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
      <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1 style={{ fontSize: "1.4rem", color: "white" }}>Masa Plus</h1>
        </Link>
        <nav style={{ display: "flex", gap: "1.25rem" }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  fontWeight: active ? 600 : 400,
                  opacity: active ? 1 : 0.8,
                  borderBottom: active ? "2px solid white" : "2px solid transparent",
                  paddingBottom: "2px",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {children}

        {!loading && (
          isLoggedIn ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <Link
              to="/login"
              style={{
                background: "white",
                color: "var(--color-primary)",
                textDecoration: "none",
                borderRadius: "999px",
                padding: "0.45rem 1rem",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Masuk
            </Link>
          )
        )}
      </div>
    </header>
  );
}
