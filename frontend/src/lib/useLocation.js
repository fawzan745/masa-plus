import { useState, useEffect, useCallback } from "react";

const FALLBACK_LOCATION = {
  latitude: -7.1547,
  longitude: 112.6547,
  label: "Gresik",
};

/**
 * Reverse geocoding: dari koordinat, cari nama kota/kabupatennya.
 * Pakai Nominatim (OpenStreetMap), gratis, tanpa API key.
 */
async function reverseGeocode(latitude, longitude) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", latitude);
    url.searchParams.set("lon", longitude);
    url.searchParams.set("accept-language", "id");

    const res = await fetch(url);
    if (!res.ok) throw new Error("reverse geocoding gagal");
    const data = await res.json();

    const addr = data.address || {};
    return addr.city || addr.town || addr.regency || addr.county || addr.state || "Lokasi Anda";
  } catch {
    return "Lokasi Anda";
  }
}

async function getCurrentPositionWithLabel() {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const label = await reverseGeocode(latitude, longitude);
        resolve({ latitude, longitude, label });
      },
      () => resolve(null),
      { timeout: 8000 }
    );
  });
}

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(FALLBACK_LOCATION);
      setLoading(false);
      return;
    }

    getCurrentPositionWithLabel().then((result) => {
      setLocation(result || FALLBACK_LOCATION);
      setLoading(false);
    });
  }, []);

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    getCurrentPositionWithLabel().then((result) => {
      if (result) setLocation(result);
      setLoading(false);
    });
  }, []);

  const setManualLocation = useCallback((loc) => {
    setLocation(loc);
  }, []);

  return { location, loading, useCurrentLocation, setManualLocation };
}

/**
 * Cari lokasi berdasarkan nama kota/tempat, pakai Nominatim (OpenStreetMap) --
 * gratis, tidak butuh API key. Dipanggil langsung dari browser pengguna.
 *
 * Catatan: untuk pemakaian ringan (personal/prototype) ini cukup, tapi kalau
 * nanti trafiknya besar, sebaiknya pindah lewat proxy backend sendiri supaya
 * tidak melanggar batas wajar pemakaian Nominatim.
 */
export async function searchLocation(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");
  url.searchParams.set("accept-language", "id");
  url.searchParams.set("countrycodes", "id");

  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mencari lokasi");

  const results = await res.json();
  return results.map((r) => ({
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
    label: r.display_name.split(",").slice(0, 3).join(","),
  }));
}
