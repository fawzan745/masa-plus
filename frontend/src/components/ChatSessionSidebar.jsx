export default function ChatSessionSidebar({ sessions, activeSessionId, onSelectSession, onNewChat, loading }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <button
        onClick={onNewChat}
        style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: "var(--color-primary)", color: "white",
          border: "none", borderRadius: "var(--radius-control)",
          padding: "0.7rem 1rem", fontSize: "0.85rem", fontWeight: 600,
          cursor: "pointer", marginBottom: "1rem",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Percakapan Baru
      </button>

      <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.5rem" }}>
        Riwayat
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", overflowY: "auto", flex: 1 }}>
        {loading && (
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Memuat...</p>
        )}
        {!loading && sessions.length === 0 && (
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Belum ada percakapan.</p>
        )}
        {sessions.map((s) => {
          const active = s.session_id === activeSessionId;
          return (
            <button
              key={s.session_id}
              onClick={() => onSelectSession(s.session_id)}
              style={{
                textAlign: "left",
                background: active ? "var(--color-primary-light)" : "transparent",
                border: "none",
                borderRadius: "var(--radius-control)",
                padding: "0.6rem 0.75rem",
                cursor: "pointer",
              }}
            >
              <p style={{
                margin: 0, fontSize: "0.83rem",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--color-primary-dark)" : "var(--color-text-primary)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {s.judul}
              </p>
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                {new Date(s.terakhir_diperbarui).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
