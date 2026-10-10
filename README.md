# Skywatch CPH

Live map of planes around Copenhagen Airport.

Live: https://skywatch-cph.netlify.app

## How it works

- `public/index.html` — the page. Leaflet map with OpenStreetMap tiles; refreshes every 8 seconds (30 s when the tab is hidden).
- `netlify/functions/planes.mts` — a small Netlify Function at `/api/planes`. It fetches aircraft from [adsb.lol](https://adsb.lol) and trims the data. Browsers can't call adsb.lol directly (no CORS), so the function sits in the middle.

Query: `/api/planes?lat=55.618&lon=12.656&dist=80` (dist in nautical miles, 5–250).

## Deploy

Netlify site `skywatch-cph`. Publish dir `public`, functions in `netlify/functions` (see `netlify.toml`).
