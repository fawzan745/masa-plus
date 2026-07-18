import { useState, useRef, useEffect } from "react";
import { searchLocation } from "../lib/useLocation";

export default function LocationPicker({ location, loading, onUseCurrentLocation, onSelectLocation }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("menu"); // "menu" | "search"
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setMode("menu");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const found = await searchLocation(query);
      setResults(found);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }

  function selectResult(loc) {
    onSelectLocation(loc);
    setOpen(false);
    setMode("menu");
    setQuery("");
    setResults([]);
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "999px",
          padding: "0.45rem 0.9rem",
          fontSize: "0.85rem",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
        }}
      >
        <PinIcon />
        {loading ? "Mendeteksi lokasi..." : location?.label}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 10,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-control)",
            boxShadow: "0 8px 24px rgba(20, 33, 61, 0.12)",
            width: "280px",
            overflow: "hidden",
          }}
        >
          {mode === "menu" && (
            <div style={{ padding: "0.4rem" }}>
              <MenuItem
                icon={<TargetIcon />}
                label="Lokasi saat ini"
                onClick={() => {
                  onUseCurrentLocation();
                  setOpen(false);
                }}
              />
              <MenuItem
                icon={<SearchIcon />}
                label="Cari lokasi"
                onClick={() => setMode("search")}
              />
            </div>
          )}

          {mode === "search" && (
            <div style={{ padding: "0.75rem" }}>
              <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.4rem" }}>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nama kota, mis. Gresik"
                  style={{
                    flex: 1,
                    padding: "0.5rem 0.6rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "var(--color-primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0 0.9rem",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Cari
                </button>
              </form>

              {searching && (
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.6rem" }}>
                  Mencari...
                </p>
              )}

              {!searching && results.length > 0 && (
                <ul style={{ listStyle: "none", margin: "0.6rem 0 0", padding: 0 }}>
                  {results.map((r, i) => (
                    <li key={i}>
                      <button
                        onClick={() => selectResult(r)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          padding: "0.5rem",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          color: "var(--color-text-primary)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-muted)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        {r.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        background: "none",
        border: "none",
        padding: "0.6rem 0.7rem",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.85rem",
        color: "var(--color-text-primary)",
        textAlign: "left",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-muted)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {icon}
      {label}
    </button>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function TargetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
      <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function ChevronIcon({ open }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
