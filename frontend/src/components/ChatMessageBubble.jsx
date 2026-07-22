export default function ChatMessageBubble({ role, content, rujukan, timestamp }) {
  const isUser = role === "user";

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: "1rem" }}>
      <div style={{ maxWidth: "80%" }}>
        <div
          style={{
            background: isUser ? "var(--color-primary)" : "var(--color-surface)",
            color: isUser ? "white" : "var(--color-text-primary)",
            border: isUser ? "none" : "1px solid var(--color-border)",
            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            padding: "0.75rem 1rem",
            fontSize: "0.92rem",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {content}
        </div>

        {!isUser && rujukan && rujukan.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.6rem" }}>
            {rujukan.map((r, i) => (
              <div
                key={i}
                style={{
                  background: "var(--color-primary-light)",
                  borderRadius: "10px",
                  padding: "0.65rem 0.85rem",
                  fontSize: "0.8rem",
                }}
              >
                <p dir="rtl" style={{
                  margin: "0 0 0.4rem", fontSize: "1.05rem", lineHeight: 1.7,
                  textAlign: "right", color: "var(--color-text-primary)",
                  fontFamily: "'Traditional Arabic', 'Amiri', serif",
                }}>
                  {r.teks_arab}
                </p>
                <p style={{ margin: "0 0 0.3rem", color: "var(--color-text-secondary)" }}>
                  "{r.terjemahan}"
                </p>
                <p style={{ margin: 0, color: "var(--color-primary-dark)", fontWeight: 600, fontSize: "0.75rem" }}>
                  QS. {r.surah} : {r.nomor_ayat}
                </p>
              </div>
            ))}
          </div>
        )}

        {timestamp && (
          <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", margin: "0.3rem 0.3rem 0", textAlign: isUser ? "right" : "left" }}>
            {new Date(timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
}
