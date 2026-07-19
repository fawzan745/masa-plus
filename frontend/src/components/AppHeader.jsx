import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Beranda" },
  { to: "/kalender", label: "Kalender" },
  { to: "/doa", label: "Doa Harian" },
];

export default function AppHeader({ children }) {
  const { pathname } = useLocation();

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

      {children}
    </header>
  );
}
