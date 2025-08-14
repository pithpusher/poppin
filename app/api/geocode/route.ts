// ==============================
// FILE: app/api/geocode/route.ts
// (server-side geocoding endpoint using Mapbox)
// ==============================
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return NextResponse.json({ error: "Missing Mapbox token" }, { status: 500 });

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=5&country=US`;
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: `Mapbox error: ${txt}` }, { status: 502 });
    }
    const data = await res.json();
    const features = Array.isArray(data?.features) ? data.features : [];
    const best = features[0];
    if (!best?.center) {
      return NextResponse.json({ error: "No coordinates found" }, { status: 404 });
    }
    const [lng, lat] = best.center;
    const formatted = best.place_name as string;

    return NextResponse.json({ lat, lng, formatted, suggestions: features.map((f: any) => ({ label: f.place_name, center: f.center })) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Geocode failed" }, { status: 500 });
  }
}
