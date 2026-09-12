import React, { useEffect, useRef, useState } from "react";
import { type locations } from "@/lib/mock-data";
import { Compass, Loader2 } from "lucide-react";

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

  useEffect(() => {
    let isCancelled = false;

    // Client-side dynamic Leaflet initialization
    async function initLeaflet() {
      if (!containerRef.current || typeof window === "undefined") return;

      const L = await import("leaflet");

      // Ensure leaflet CSS is present in head
      if (!document.getElementById("leaflet-core-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-core-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Cleanup any pre-existing instance in this container
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (isCancelled) return;

      // Initialize map instance
      const map = L.map(containerRef.current, {
        center: [centerLat, centerLon],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add zoom control in top-right to preserve architectural HUD in top-left
      L.control.zoom({ position: "topright" }).addTo(map);

      // CartoDB DarkMatter tiles (styled OpenStreetMap data for dark HUD)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      ).addTo(map);

      // Add attribution control in bottom-left
      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addTo(map);

      // Central Campus Beacon
      const campusIcon = L.divIcon({
        className: "custom-campus-pin",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background: rgba(16, 185, 129, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <span style="display: grid; width: 22px; height: 22px; place-items: center; border-radius: 9999px; background: #10b981; color: #020617; font-weight: 900; font-size: 10px; box-shadow: 0 0 15px #10b981; border: 2px solid #ffffff;">C</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const campusMarker = L.marker([centerLat, centerLon], { icon: campusIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 2px 4px;">
            <strong style="color: #059669;">● Active Hub</strong><br/>
            ${centerLabel}
          </div>`
        );

      markersRef.current.push(campusMarker);

      // Render Facility Pins
      facilityList.forEach((place) => {
        const offset = FACILITY_OFFSETS[place.name] || [
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.004,
        ];
        const markerLat = centerLat + offset[0];
        const markerLon = centerLon + offset[1];

        const isSelected = selectedLocationName === place.name;
        const colorHex = isSelected ? "#f43f5e" : place.open ? "#10b981" : "#94a3b8";
        const shadowGlow = isSelected
          ? "0 0 18px rgba(244,63,94,0.9)"
          : "0 4px 12px rgba(0,0,0,0.6)";

        const facilityIcon = L.divIcon({
          className: "custom-facility-pin",
          html: `
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
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([markerLat, markerLon], { icon: facilityIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 2px 4px;">
              <strong style="font-size: 13px;">${place.name}</strong><br/>
              <span style="color: ${place.open ? "#059669" : "#e11d48"}; font-weight: 600;">
                ${place.open ? "● Open Now" : "● Closed"}
              </span> · <span>${place.distance}</span><br/>
              <span style="color: #64748b; font-size: 11px;">${place.address}</span>
            </div>`
          );

        marker.on("click", () => {
          if (onSelectLocation) onSelectLocation(place);
        });

        markersRef.current.push(marker);
      });

      // Force layout invalidation so Leaflet sizes tiles accurately
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);

      setIsReady(true);
    }

    initLeaflet();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLon, facilityList, selectedLocationName, centerLabel, onSelectLocation]);

  // Recenter map smoothly when centerLat or centerLon changes
  useEffect(() => {
    if (mapInstanceRef.current && isReady) {
      mapInstanceRef.current.flyTo([centerLat, centerLon], 15, {
        duration: 1.2,
      });
    }
  }, [centerLat, centerLon, isReady]);

  return (
    <div className={`relative size-full min-h-[420px] overflow-hidden rounded-2xl ${className}`}>
      {/* Map Target Canvas */}
      <div ref={containerRef} className="size-full bg-slate-950" />

      {/* Loading Skeleton */}
      {!isReady && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950 text-slate-300">
          <Loader2 className="size-8 animate-spin text-emerald-400" />
          <p className="mt-3 font-mono text-xs text-emerald-300">Initializing OpenStreetMap Radar...</p>
        </div>
      )}

      {/* Architectural Concentric Range Rings Overlay (Preserves Radar Look) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-[150px] rounded-full border border-emerald-500/15" />
        <div className="size-[300px] rounded-full border border-emerald-500/10" />
        <div className="size-[450px] rounded-full border border-emerald-500/5" />
      </div>

      {/* Animated Radar Sweep Overlay */}
      <div
        className="pointer-events-none absolute inset-0 origin-center opacity-30 animate-[radar-sweep_8s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.15) 0deg, transparent 50deg, transparent 360deg)",
        }}
      />

      {/* HUD Coordinates Bar */}
      <div className="pointer-events-none absolute top-4 left-4 z-20 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-slate-900/85 px-3 py-1.5 font-mono text-[11px] font-medium text-emerald-400 backdrop-blur-md">
        <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
        <span>
          OSM RADAR {centerLat.toFixed(4)}° N, {centerLon.toFixed(4)}° E
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
