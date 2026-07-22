import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import ChatMessageBubble from "../components/ChatMessageBubble";
import ChatSessionSidebar from "../components/ChatSessionSidebar";
import { useAuth } from "../lib/AuthContext";
import { askUstadz, getChatSessions, getChatSessionHistory } from "../lib/api";

export default function TanyaUstadz() {
  const { token, isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate("/login");
  }, [authLoading, isLoggedIn, navigate]);

  const loadSessions = useCallback(() => {
    if (!token) return;
    setSessionsLoading(true);
    getChatSessions(token)
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setSessionsLoading(false));
  }, [token]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSelectSession(sessionId) {
    setError(null);
    setActiveSessionId(sessionId);
    try {
      const history = await getChatSessionHistory(token, sessionId);
      setMessages(history);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleNewChat() {
    setActiveSessionId(null);
    setMessages([]);
    setError(null);
  }

  async function handleSend(e) {
    e.preventDefault();
    const pertanyaan = input.trim();
    if (!pertanyaan || sending) return;

    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: pertanyaan, created_at: new Date().toISOString() }]);
    setSending(true);

    try {
      const res = await askUstadz(token, { pertanyaan, sessionId: activeSessionId });
      setActiveSessionId(res.session_id);
      setMessages((prev) => [...prev, {
        role: "assistant", content: res.jawaban, rujukan: res.rujukan,
        created_at: new Date().toISOString(),
      }]);
      loadSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (authLoading || !isLoggedIn) {
    return (
      <div>
        <AppHeader />
        <p style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>Memuat...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppHeader />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar riwayat */}
        <aside
          style={{
            width: "260px", flexShrink: 0,
            borderRight: "1px solid var(--color-border)",
            padding: "1.25rem", overflowY: "auto",
            background: "var(--color-surface)",
          }}
        >
          <ChatSessionSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            loading={sessionsLoading}
          />
        </aside>

        {/* Area chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{
            background: "var(--color-primary-light)", color: "var(--color-primary-dark)",
            fontSize: "0.78rem", padding: "0.6rem 1.5rem", textAlign: "center",
          }}>
            Jawaban AI berdasarkan pencarian di Al-Quran, bukan fatwa ulama. Untuk hukum fiqih yang kompleks, konsultasikan langsung ke ustadz/Majelis Tarjih.
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
                <p style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>Assalamu'alaikum!</p>
                <p style={{ fontSize: "0.85rem" }}>Silakan tanyakan sesuatu, saya akan carikan ayat Al-Quran yang relevan.</p>
              </div>
            )}

            {messages.map((m, i) => (
              <ChatMessageBubble
                key={i}
                role={m.role}
                content={m.content}
                rujukan={m.rujukan}
                timestamp={m.created_at}
              />
            ))}

            {sending && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
                <div style={{
                  background: "var(--color-surface)", border: "1px solid var(--color-border)",
                  borderRadius: "16px 16px 16px 4px", padding: "0.75rem 1rem",
                  fontSize: "0.85rem", color: "var(--color-text-muted)",
                }}>
                  Sedang mencari jawaban... (bisa sampai 30 detik)
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "0.75rem 1rem", borderRadius: "var(--radius-control)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: "flex", gap: "0.6rem", padding: "1rem 1.5rem", borderTop: "1px solid var(--color-border)" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaanmu..."
              disabled={sending}
              style={{
                flex: 1, padding: "0.7rem 1rem", border: "1px solid var(--color-border)",
                borderRadius: "999px", fontSize: "0.9rem", outline: "none",
                fontFamily: "var(--font-body)",
              }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              style={{
                background: "var(--color-primary)", color: "white", border: "none",
                borderRadius: "999px", width: "44px", height: "44px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: sending || !input.trim() ? "default" : "pointer",
                opacity: sending || !input.trim() ? 0.5 : 1,
                flexShrink: 0,
              }}
              aria-label="Kirim"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
