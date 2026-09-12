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

// In-memory geocode cache to avoid redundant API hits and respect rate limits
const geocodeCache = new Map<string, GeoCoordinates>();
geocodeCache.set("srm kattankulathur", DEFAULT_CAMPUS_LOCATION);
geocodeCache.set("srm", DEFAULT_CAMPUS_LOCATION);
geocodeCache.set("kattankulathur", DEFAULT_CAMPUS_LOCATION);

/**
 * Geocode a location string using OpenStreetMap Nominatim with offline fallbacks.
 */
export async function geocodeLocation(query: string): Promise<GeoCoordinates> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return DEFAULT_CAMPUS_LOCATION;

  // Check cache first
  if (geocodeCache.has(normalized)) {
    return geocodeCache.get(normalized)!;
  }

  // Fast path for SRM aliases
  if (
    normalized.includes("srm") ||
    normalized.includes("kattankulathur") ||
    normalized.includes("ktr")
  ) {
    geocodeCache.set(normalized, DEFAULT_CAMPUS_LOCATION);
    return DEFAULT_CAMPUS_LOCATION;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "SyncareApp/1.0 (student-wellness-app)",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("Nominatim geocoding request returned status:", response.status);
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
      return result;
    }

    // If query returned no match, default to campus
    return DEFAULT_CAMPUS_LOCATION;
  } catch (err) {
    console.warn("Geocoding failed, falling back to SRM Kattankulathur:", err);
    return DEFAULT_CAMPUS_LOCATION;
  }
}

/**
 * Hook providing resolved coordinates reactive to the active user's campus/city.
 */
export function useResolvedLocation() {
  const { userCity } = useWellnessStore();
  const [coords, setCoords] = useState<GeoCoordinates>(DEFAULT_CAMPUS_LOCATION);
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

  return {
    ...coords,
    isLoading,
    error,
    refreshLocation: () => resolve(userCity || "SRM Kattankulathur"),
    setCustomLocation: (q: string) => resolve(q),
  };
}
