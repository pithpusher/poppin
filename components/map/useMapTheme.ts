"use client";
import mapboxgl from "mapbox-gl";

export function styleFor(theme: "dark" | "light") {
  return theme === "dark"
    ? "mapbox://styles/mapbox/dark-v11"
    : "mapbox://styles/mapbox/streets-v12";
}

export function getInitialMapStyle() {
  const theme =
    typeof document !== "undefined" && document.documentElement.classList.contains("light")
      ? "light"
      : "dark"; // default dark
  return styleFor(theme);
}

/** Bind once after map creation */
export function bindThemeToMap(map: mapboxgl.Map) {
  const handler = (e: Event) => {
    const next = (e as CustomEvent<"dark" | "light">).detail;
    map.setStyle(styleFor(next)); // just set it; markers/popups survive
  };
  window.addEventListener("poppin-theme", handler as EventListener);
  return () => window.removeEventListener("poppin-theme", handler as EventListener);
}
