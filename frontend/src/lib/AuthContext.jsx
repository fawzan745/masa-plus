import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getMe, updateProfile } from "./api";

const AuthContext = createContext(null);

const TOKEN_KEY = "masa_plus_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Begitu app dibuka (atau di-refresh), cek apakah token yang tersimpan
  // masih valid dengan tanya ke backend siapa pemiliknya
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getMe(token)
      .then(setUser)
      .catch(() => {
        // token sudah tidak valid/kedaluwarsa -- bersihkan
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login({ email, password }) {
    const { access_token } = await loginUser({ email, password });
    localStorage.setItem(TOKEN_KEY, access_token);
    setToken(access_token);
    const me = await getMe(access_token);
    setUser(me);
  }

  async function register({ email, password, fullName }) {
    await registerUser({ email, password, fullName });
    // Langsung login otomatis setelah daftar, biar tidak perlu isi form 2x
    await login({ email, password });
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  async function updateUser(changes) {
    const updated = await updateProfile(token, changes);
    setUser(updated);
    return updated;
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
