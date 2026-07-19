export default function DateModeSelector({
  primary,
  onChangePrimary,
  gregorianYear,
  hijriYear,
  onChangeGregorianYear,
  onChangeHijriYear,
}) {
  const gregorianYearOptions = Array.from({ length: 11 }, (_, i) => gregorianYear - 5 + i);
  const hijriYearOptions = hijriYear
    ? Array.from({ length: 11 }, (_, i) => hijriYear - 5 + i)
    : [];

  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", background: "var(--color-surface-muted)", borderRadius: "999px", padding: "3px" }}>
        <ToggleButton active={primary === "masehi"} onClick={() => onChangePrimary("masehi")} label="Masehi" />
        <ToggleButton active={primary === "hijriah"} onClick={() => onChangePrimary("hijriah")} label="Hijriah" />
      </div>

      {primary === "masehi" ? (
        <select
          value={gregorianYear}
          onChange={(e) => onChangeGregorianYear(Number(e.target.value))}
          style={selectStyle}
        >
          {gregorianYearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      ) : (
        <select
          value={hijriYear || ""}
          onChange={(e) => onChangeHijriYear(Number(e.target.value))}
          style={selectStyle}
        >
          {hijriYearOptions.map((y) => (
            <option key={y} value={y}>{y} H</option>
          ))}
        </select>
      )}
    </div>
  );
}

function ToggleButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        borderRadius: "999px",
        padding: "0.4rem 0.9rem",
        fontSize: "0.82rem",
        fontWeight: 600,
        cursor: "pointer",
        background: active ? "var(--color-primary)" : "transparent",
        color: active ? "white" : "var(--color-text-secondary)",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

const selectStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  padding: "0.45rem 0.7rem",
  fontSize: "0.85rem",
  color: "var(--color-text-primary)",
  background: "var(--color-surface)",
  cursor: "pointer",
};
