import { useEffect, useState } from "react";
import { checkBackendHealth } from "./lib/api";

export default function App() {
  const [status, setStatus] = useState("Mengecek koneksi backend...");

  useEffect(() => {
    checkBackendHealth()
      .then((data) => setStatus(`Backend terhubung: ${data.message}`))
      .catch(() => setStatus("Backend belum terhubung. Pastikan sudah dijalankan."));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Masa Plus</h1>
      <p>{status}</p>
    </div>
  );
}
