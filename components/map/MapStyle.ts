// components/map/useMapStyle.ts
"use client";
export default function useMapStyle() {
  // read current document theme once at mount
  if (typeof document !== "undefined") {
    const dark = document.documentElement.classList.contains("dark");
    return dark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12";
  }
  return "mapbox://styles/mapbox/dark-v11";
}
