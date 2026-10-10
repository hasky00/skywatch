// Proxy: the browser can't call adsb.lol directly (no CORS), so this function does it.
// GET /api/planes?lat=55.62&lon=12.65&dist=80
export default async (req: Request) => {
  const url = new URL(req.url)
  const lat = clamp(Number(url.searchParams.get("lat") ?? 55.62), -90, 90)
  const lon = clamp(Number(url.searchParams.get("lon") ?? 12.65), -180, 180)
  const dist = clamp(Number(url.searchParams.get("dist") ?? 80), 5, 250)

  try {
    const res = await fetch(
      `https://api.adsb.lol/v2/lat/${lat.toFixed(4)}/lon/${lon.toFixed(4)}/dist/${Math.round(dist)}`,
      { headers: { "user-agent": "skywatch-netlify/1.0" } },
    )
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    const data = await res.json()

    const planes = (data.ac ?? [])
      .filter((a: any) => typeof a.lat === "number" && typeof a.lon === "number")
      .map((a: any) => ({
        hex: a.hex,
        callsign: (a.flight ?? "").trim(),
        reg: a.r ?? "",
        type: a.t ?? "",
        lat: a.lat,
        lon: a.lon,
        alt: a.alt_baro === "ground" ? 0 : a.alt_baro ?? null,
        ground: a.alt_baro === "ground",
        speed: a.gs ?? null,
        track: a.track ?? a.true_heading ?? 0,
        vrate: a.baro_rate ?? a.geom_rate ?? 0,
        squawk: a.squawk ?? "",
        dist: a.dst ?? null,
      }))

    return Response.json(
      { now: data.now ?? Date.now(), planes },
      { headers: { "cache-control": "public, max-age=5" } },
    )
  } catch (err) {
    return Response.json({ error: "Flight data is unavailable right now. Try again in a moment." }, { status: 502 })
  }
}

export const config = { path: "/api/planes" }

function clamp(n: number, min: number, max: number) {
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min
}
