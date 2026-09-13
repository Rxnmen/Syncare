import React, { useEffect, useRef, useState } from "react";
import { type locations } from "@/lib/mock-data";
import { Compass, Globe, Loader2 } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

type LocationItem = (typeof locations)[number];

interface CareMapProps {
  centerLat: number;
  centerLon: number;
  centerLabel?: string;
  locations: LocationItem[];
  selectedLocationName?: string | null;
  onSelectLocation?: (loc: LocationItem) => void;
  className?: string;
}

// Offsets in degrees (~111 km per deg latitude, ~108 km per deg longitude at this lat)
const FACILITY_OFFSETS: Record<string, [number, number]> = {
  "SRM General Hospital": [0.0028, -0.0034],
  "SRM Student Health Centre": [0.0006, 0.0021],
  "Apollo Pharmacy Potheri": [-0.0032, -0.0049],
  "SRM Immunization & Triage": [-0.0020, 0.0026],
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadMapLibre(): Promise<any> {
  if (typeof window === "undefined") return null;

  // 1. Check if window.maplibregl is already populated
  if (typeof (window as any).maplibregl?.Map === "function") {
    return (window as any).maplibregl;
  }

  // 2. Try standard import (works in production build and Vite optimizer)
  try {
    const mod = await import("maplibre-gl");
    if (typeof mod?.Map === "function") return mod;
    if (typeof (mod as any)?.default?.Map === "function") return (mod as any).default;
  } catch (e) {
    console.warn("Module import could not resolve Map constructor, falling back:", e);
  }

  if (typeof (window as any).maplibregl?.Map === "function") {
    return (window as any).maplibregl;
  }

  // 3. Fallback: Load official standalone UMD bundle from unpkg (same CDN OpenFreeMap uses)
  await new Promise<void>((resolve, reject) => {
    // Inject CSS
    if (!document.getElementById("maplibre-core-css")) {
      const link = document.createElement("link");
      link.id = "maplibre-core-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }

    const existing = document.getElementById("maplibre-core-script") as HTMLScriptElement;
    if (existing) {
      if (typeof (window as any).maplibregl?.Map === "function") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load maplibre script")));
      return;
    }

    const script = document.createElement("script");
    script.id = "maplibre-core-script";
    script.src = "https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load maplibre-gl from unpkg"));
    document.head.appendChild(script);
  });

  if (typeof (window as any).maplibregl?.Map === "function") {
    return (window as any).maplibregl;
  }

  throw new Error("Could not find Map constructor in maplibre-gl");
}

export function CareMap({
  centerLat,
  centerLon,
  centerLabel = "SRM Kattankulathur Campus Hub",
  locations: facilityList,
  selectedLocationName,
  onSelectLocation,
  className = "",
}: CareMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize MapLibre GL instance with OpenFreeMap vector style
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!containerRef.current || typeof window === "undefined") return;

      try {
        const maplibregl = await loadMapLibre();

        // Cleanup pre-existing instance if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        if (isCancelled) return;

        // OpenFreeMap dark vector tile style
        const map = new maplibregl.Map({
          container: containerRef.current,
          style: "https://tiles.openfreemap.org/styles/dark",
          center: [centerLon, centerLat],
          zoom: 14,
          attributionControl: false,
        });

        mapInstanceRef.current = map;

        // Add top-right navigation controls (zoom & compass rotation)
        map.addControl(
          new maplibregl.NavigationControl({
            showCompass: true,
            showZoom: true,
            visualizePitch: true,
          }),
          "top-right"
        );

        // Add bottom-left attribution per OpenFreeMap requirements
        map.addControl(
          new maplibregl.AttributionControl({
            compact: true,
            customAttribution:
              '<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
          }),
          "bottom-left"
        );

        const setReady = () => {
          if (!isCancelled) {
            setIsReady(true);
            setTimeout(() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.resize();
              }
            }, 100);
          }
        };

        map.on("load", setReady);
        map.on("style.load", setReady);

        // Fallback: Ensure radar never hangs on loading screen
        const readyTimer = setTimeout(setReady, 1000);

        map.on("error", (e: any) => {
          console.warn("OpenFreeMap event notice:", e?.error?.message || e);
        });

        // Trigger resize after mounting to ensure crisp canvas rendering
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.resize();
          }
        }, 250);
      } catch (err: any) {
        console.error("Failed to initialize OpenFreeMap MapLibre GL:", err);
        if (!isCancelled) {
          setLoadError(err?.message || "Failed to initialize OpenFreeMap");
        }
      }
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync markers whenever coordinates, facilities, or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isReady || typeof window === "undefined") return;

    loadMapLibre().then((maplibregl) => {
      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // 1. Central Active Hub Marker
      const hubEl = document.createElement("div");
      hubEl.className = "custom-campus-pin";
      hubEl.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <span style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(16, 185, 129, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <span style="display: grid; width: 24px; height: 24px; place-items: center; border-radius: 9999px; background: #10b981; color: #020617; font-weight: 900; font-size: 11px; box-shadow: 0 0 16px #10b981; border: 2px solid #ffffff;">C</span>
        </div>
      `;

      const hubPopup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 4px 6px;">
          <strong style="color: #059669; font-weight: 700;">● Active Global Beacon</strong><br/>
          <span style="font-weight: 600;">${escapeHtml(centerLabel)}</span><br/>
          <span style="color: #64748b; font-size: 10px; font-family: monospace;">${centerLat.toFixed(4)}°, ${centerLon.toFixed(4)}°</span>
        </div>
      `);

      const hubMarker = new maplibregl.Marker({ element: hubEl })
        .setLngLat([centerLon, centerLat])
        .setPopup(hubPopup)
        .addTo(map);

      markersRef.current.push(hubMarker);

      // 2. Monitored Facility Pins
      facilityList.forEach((place) => {
        const offset = FACILITY_OFFSETS[place.name] || [
          (((place.name.charCodeAt(0) * 19) % 50) - 25) * 0.00015,
          (((place.name.charCodeAt(1) * 29) % 50) - 25) * 0.00015,
        ];
        const markerLat = centerLat + offset[0];
        const markerLon = centerLon + offset[1];

        const isSelected = selectedLocationName === place.name;
        const colorHex = isSelected ? "#f43f5e" : place.open ? "#10b981" : "#94a3b8";
        const shadowGlow = isSelected
          ? "0 0 18px rgba(244,63,94,0.9)"
          : "0 4px 12px rgba(0,0,0,0.6)";

        const facilityEl = document.createElement("div");
        facilityEl.className = "custom-facility-pin";
        facilityEl.style.cursor = "pointer";
        facilityEl.innerHTML = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${
              isSelected
                ? '<span style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(244,63,94,0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>'
                : ""
            }
            <span style="display: grid; width: 30px; height: 30px; place-items: center; border-radius: 9999px; background: #0f172a; border: 2px solid ${colorHex}; color: ${colorHex}; box-shadow: ${shadowGlow}; font-size: 13px; font-weight: bold;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
          </div>
        `;

        facilityEl.addEventListener("click", () => {
          if (onSelectLocation) onSelectLocation(place);
        });

        const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(`
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 4px 6px; min-width: 140px;">
            <strong style="font-size: 13px; color: #0f172a;">${escapeHtml(place.name)}</strong><br/>
            <span style="color: ${place.open ? "#059669" : "#e11d48"}; font-weight: 600;">
              ${place.open ? "● Open Now" : "● Closed"}
            </span> · <span style="color: #64748b;">${escapeHtml(place.distance)}</span><br/>
            <span style="color: #64748b; font-size: 11px;">${escapeHtml(place.address)}</span>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: facilityEl })
          .setLngLat([markerLon, markerLat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    });
  }, [centerLat, centerLon, facilityList, selectedLocationName, centerLabel, onSelectLocation, isReady]);

  // Smooth globe flyTo whenever user switches location anywhere in the world
  useEffect(() => {
    if (mapInstanceRef.current && isReady) {
      mapInstanceRef.current.flyTo({
        center: [centerLon, centerLat],
        zoom: 14,
        speed: 1.4,
        curve: 1.42,
        essential: true,
      });
    }
  }, [centerLat, centerLon, isReady]);

  const latDisplay = `${Math.abs(centerLat).toFixed(4)}° ${centerLat >= 0 ? "N" : "S"}`;
  const lonDisplay = `${Math.abs(centerLon).toFixed(4)}° ${centerLon >= 0 ? "E" : "W"}`;

  return (
    <div className={`relative size-full min-h-[420px] overflow-hidden rounded-2xl ${className}`}>
      {/* Map Target Canvas */}
      <div ref={containerRef} className="size-full bg-slate-950" />

      {/* Loading Skeleton */}
      {!isReady && !loadError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950 text-slate-300">
          <Loader2 className="size-8 animate-spin text-emerald-400" />
          <p className="mt-3 font-mono text-xs text-emerald-300">
            Initializing OpenFreeMap Vector Radar...
          </p>
        </div>
      )}

      {/* Error Fallback */}
      {loadError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center text-rose-300">
          <Globe className="size-8 text-rose-400 mb-2" />
          <p className="text-sm font-semibold">OpenFreeMap Vector Tiles Offline</p>
          <p className="mt-1 text-xs text-slate-400 font-mono">{loadError}</p>
        </div>
      )}

      {/* Architectural Concentric Range Rings Overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-[150px] rounded-full border border-emerald-500/15" />
        <div className="size-[300px] rounded-full border border-emerald-500/10" />
        <div className="size-[450px] rounded-full border border-emerald-500/5" />
      </div>

      {/* Animated Radar Sweep Overlay */}
      <div
        className="pointer-events-none absolute inset-0 origin-center opacity-25 animate-[radar-sweep_8s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.15) 0deg, transparent 50deg, transparent 360deg)",
        }}
      />

      {/* HUD Coordinates Bar */}
      <div className="pointer-events-none absolute top-4 left-4 z-20 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-slate-900/85 px-3 py-1.5 font-mono text-[11px] font-medium text-emerald-400 backdrop-blur-md">
        <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
        <span>
          OPENFREEMAP {latDisplay}, {lonDisplay}
        </span>
      </div>

      {/* Facility Counter HUD */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/85 px-3 py-1.5 font-mono text-[11px] text-slate-300 backdrop-blur-md">
        <Compass className="size-3.5 text-emerald-400" />
        <span>{facilityList.length} Facilities Monitored</span>
      </div>
    </div>
  );
}
