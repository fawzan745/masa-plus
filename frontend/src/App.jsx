import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import Dashboard from "./pages/Dashboard";
import KalenderHijriah from "./pages/KalenderHijriah";
import DoaHarian from "./pages/DoaHarian";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./styles/tokens.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kalender" element={<KalenderHijriah />} />
          <Route path="/doa" element={<DoaHarian />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
