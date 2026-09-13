import { useState, useEffect, useCallback } from "react";
import { useWellnessStore } from "./wellness-store";

export interface GeoCoordinates {
  lat: number;
  lon: number;
  displayName: string;
}

export const DEFAULT_CAMPUS_LOCATION: GeoCoordinates = {
  lat: 12.8230,
  lon: 80.0444,
  displayName: "SRM Institute of Science and Technology, Kattankulathur",
};

// Known global cities catalog for zero-latency switching
export const GLOBAL_POPULAR_CITIES: Record<string, GeoCoordinates> = {
  "srm kattankulathur": DEFAULT_CAMPUS_LOCATION,
  "srm": DEFAULT_CAMPUS_LOCATION,
  "kattankulathur": DEFAULT_CAMPUS_LOCATION,
  "tokyo": { lat: 35.6762, lon: 139.6503, displayName: "Tokyo, Japan" },
  "london": { lat: 51.5074, lon: -0.1278, displayName: "London, England, United Kingdom" },
  "new york": { lat: 40.7128, lon: -74.0060, displayName: "New York, United States" },
  "paris": { lat: 48.8566, lon: 2.3522, displayName: "Paris, Île-de-France, France" },
  "bangalore": { lat: 12.9716, lon: 77.5946, displayName: "Bengaluru, Karnataka, India" },
  "bengaluru": { lat: 12.9716, lon: 77.5946, displayName: "Bengaluru, Karnataka, India" },
  "sydney": { lat: -33.8688, lon: 151.2093, displayName: "Sydney, New South Wales, Australia" },
  "dubai": { lat: 25.2048, lon: 55.2708, displayName: "Dubai, United Arab Emirates" },
  "singapore": { lat: 1.3521, lon: 103.8198, displayName: "Singapore" },
  "berlin": { lat: 52.5200, lon: 13.4050, displayName: "Berlin, Germany" },
  "san francisco": { lat: 37.7749, lon: -122.4194, displayName: "San Francisco, California, USA" },
  "mumbai": { lat: 19.0760, lon: 72.8777, displayName: "Mumbai, Maharashtra, India" },
  "delhi": { lat: 28.6139, lon: 77.2090, displayName: "New Delhi, Delhi, India" },
  "chennai": { lat: 13.0827, lon: 80.2707, displayName: "Chennai, Tamil Nadu, India" },
  "toronto": { lat: 43.6532, lon: -79.3832, displayName: "Toronto, Ontario, Canada" },
};

// In-memory & local cache to minimize external network requests
const geocodeCache = new Map<string, GeoCoordinates>();
Object.entries(GLOBAL_POPULAR_CITIES).forEach(([key, val]) => geocodeCache.set(key, val));

/**
 * Geocode any location string or coordinate pair anywhere in the world.
 */
export async function geocodeLocation(query: string): Promise<GeoCoordinates> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return DEFAULT_CAMPUS_LOCATION;

  // Direct coordinate match (e.g. "35.6762, 139.6503")
  const coordMatch = normalized.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[3]);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return {
        lat,
        lon,
        displayName: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
      };
    }
  }

  // Check in-memory cache / known cities
  if (geocodeCache.has(normalized)) {
    return geocodeCache.get(normalized)!;
  }

  // Check localStorage cache
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(`syncare_geo_${normalized}`);
      if (cached) {
        const parsed = JSON.parse(cached) as GeoCoordinates;
        geocodeCache.set(normalized, parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "SyncareApp/1.0 (student-wellness-platform)",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("Nominatim geocoding request status:", response.status);
      return DEFAULT_CAMPUS_LOCATION;
    }

    const data = (await response.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (data && data.length > 0) {
      const result: GeoCoordinates = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };

      geocodeCache.set(normalized, result);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`syncare_geo_${normalized}`, JSON.stringify(result));
        } catch {
          // ignore
        }
      }

      return result;
    }

    return DEFAULT_CAMPUS_LOCATION;
  } catch (err) {
    console.warn("Geocoding network error, using fallback:", err);
    return DEFAULT_CAMPUS_LOCATION;
  }
}

/**
 * Hook providing reactive coordinates for any destination worldwide.
 */
export function useResolvedLocation() {
  const { userCity, setUserCity } = useWellnessStore();
  const [coords, setCoords] = useState<GeoCoordinates>(() => {
    const norm = (userCity || "srm kattankulathur").trim().toLowerCase();
    return GLOBAL_POPULAR_CITIES[norm] || DEFAULT_CAMPUS_LOCATION;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = useCallback(async (locationQuery: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const resolved = await geocodeLocation(locationQuery);
      setCoords(resolved);
    } catch (err: any) {
      setError(err?.message || "Could not resolve location");
      setCoords(DEFAULT_CAMPUS_LOCATION);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    resolve(userCity || "SRM Kattankulathur");
  }, [userCity, resolve]);

  const setGlobalLocation = useCallback(
    async (newLocation: string) => {
      const target = newLocation.trim();
      if (!target) return;
      setIsLoading(true);
      try {
        const resolved = await geocodeLocation(target);
        setCoords(resolved);
        const cityName = resolved.displayName.split(",")[0].trim() || target;
        await setUserCity(cityName);
      } catch (err: any) {
        setError(err?.message || "Could not update location");
      } finally {
        setIsLoading(false);
      }
    },
    [setUserCity]
  );

  return {
    ...coords,
    isLoading,
    error,
    refreshLocation: () => resolve(userCity || "SRM Kattankulathur"),
    setGlobalLocation,
  };
}
