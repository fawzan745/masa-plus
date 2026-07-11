const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function checkBackendHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error("Backend tidak merespons");
  return res.json();
}

// Nanti tambah fungsi lain di sini, misal:
// export async function loginUser(email, password) { ... }
// export async function askUstadzAI(question) { ... }
