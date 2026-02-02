export interface GeocodingResult {
  formatted: string;
  latitude: number;
  longitude: number;
  timezone: string;
  components: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export async function geocodeLocation(
  query: string
): Promise<GeocodingResult[]> {
  const apiKey = process.env.OPENCAGE_API_KEY;

  if (!apiKey) {
    // Fallback: use a free geocoding service
    return geocodeWithNominatim(query);
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&limit=5&no_annotations=0`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  const data = await response.json();

  return data.results.map(
    (r: {
      formatted: string;
      geometry: { lat: number; lng: number };
      annotations: { timezone: { name: string } };
      components: { city?: string; state?: string; country?: string };
    }) => ({
      formatted: r.formatted,
      latitude: r.geometry.lat,
      longitude: r.geometry.lng,
      timezone: r.annotations.timezone.name,
      components: {
        city: r.components.city,
        state: r.components.state,
        country: r.components.country,
      },
    })
  );
}

async function geocodeWithNominatim(
  query: string
): Promise<GeocodingResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Lightbloom/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  const data = await response.json();

  // For timezone, we estimate from longitude (rough, but works as fallback)
  return data.map(
    (r: {
      display_name: string;
      lat: string;
      lon: string;
      address?: { city?: string; state?: string; country?: string };
    }) => ({
      formatted: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      timezone: estimateTimezone(parseFloat(r.lon)),
      components: {
        city: r.address?.city,
        state: r.address?.state,
        country: r.address?.country,
      },
    })
  );
}

function estimateTimezone(longitude: number): string {
  // Rough UTC offset from longitude. For production, use a timezone API.
  const offset = Math.round(longitude / 15);
  if (offset === 0) return "Europe/London";
  if (offset >= -5 && offset <= -4) return "America/New_York";
  if (offset === -6) return "America/Chicago";
  if (offset === -7) return "America/Denver";
  if (offset >= -8 && offset <= -7) return "America/Los_Angeles";
  if (offset === 1) return "Europe/Paris";
  if (offset === 2) return "Europe/Helsinki";
  if (offset >= 5 && offset <= 6) return "Asia/Kolkata";
  if (offset === 8) return "Asia/Shanghai";
  if (offset === 9) return "Asia/Tokyo";
  if (offset === 10) return "Australia/Sydney";
  return `Etc/GMT${offset > 0 ? "-" : "+"}${Math.abs(offset)}`;
}
