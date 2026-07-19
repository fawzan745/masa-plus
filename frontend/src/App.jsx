import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import KalenderHijriah from "./pages/KalenderHijriah";
import DoaHarian from "./pages/DoaHarian";
import "./styles/tokens.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kalender" element={<KalenderHijriah />} />
        <Route path="/doa" element={<DoaHarian />} />
      </Routes>
    </BrowserRouter>
  );
}
