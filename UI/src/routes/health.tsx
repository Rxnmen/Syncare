import { createFileRoute } from "@tanstack/react-router";
import {
  Ambulance,
  Building2,
  Check,
  Cross,
  Compass,
  Globe,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Syringe,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeading } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/ui/interactive-3d-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useWellnessStore } from "@/lib/wellness-store";
import { CareMap } from "@/components/care-map";
import {
  useResolvedLocation,
  getNearbyFacilities,
  getEmergencyHotline,
  type FacilityItem,
} from "@/lib/location-service";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Nearby Care — Syncare" },
      { name: "description", content: "Find nearby student healthcare, hospital radar, and vaccination records." },
      { property: "og:title", content: "Nearby Care — Syncare" },
      { property: "og:description", content: "Find nearby student healthcare, hospital radar, and vaccination records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HealthPage,
});

type LocationItem = FacilityItem;

function HealthPage() {
  const { healthRecords } = useWellnessStore();
  const userLocation = useResolvedLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [directionsTarget, setDirectionsTarget] = useState<LocationItem | null>(null);

  const categories = ["All", "Hospital", "Clinic", "Pharmacy"];

  const QUICK_LOCATIONS = [
    { label: "SRM KTR (Campus)", query: "SRM Kattankulathur" },
    { label: "Tokyo", query: "Tokyo" },
    { label: "London", query: "London" },
    { label: "New York", query: "New York" },
    { label: "Paris", query: "Paris" },
    { label: "Bangalore", query: "Bangalore" },
    { label: "Sydney", query: "Sydney" },
  ];

  const handleLocationChange = async (target: string) => {
    if (!target.trim()) return;
    await userLocation.setGlobalLocation(target.trim());
    setLocationQuery("");
  };

  const activeFacilities = getNearbyFacilities(userLocation.displayName, userLocation.lat, userLocation.lon);
  const emergencyHotline = getEmergencyHotline(userLocation.displayName);

  const filteredLocations = activeFacilities.filter((loc) => {
    const matchesCategory = activeCategory === "All" || loc.type.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const campusTitle = userLocation.displayName.split(",")[0] || "SRM Kattankulathur";

  return (
    <AppShell title="Health & Care Radar" eyebrow={`Healthcare around Campus · ${campusTitle}`}>
      <ScrollReveal direction="up" distance={14}>
        <PageHeading
          title="Care, when you need it"
          description="Live architectural radar of emergency services, campus triage, and student medical records."
          action={
            <a
              href={`tel:${emergencyHotline.number}`}
              className="group flex items-center gap-2.5 rounded-full border border-coral/30 bg-coral/10 px-4 py-2 text-sm font-semibold text-coral shadow-xs backdrop-blur-md transition-all hover:bg-coral hover:text-white"
            >
              <Ambulance className="size-4 animate-pulse group-hover:scale-110 transition-transform" />
              <span>{emergencyHotline.label}</span>
            </a>
          }
        />
      </ScrollReveal>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
        <section className="space-y-5">
          {/* Global Location Switcher HUD */}
          <ScrollReveal direction="up" delayMs={40} distance={14}>
            <div className="rounded-2xl border border-border/80 bg-card/85 p-4 backdrop-blur-md shadow-3d-card space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Globe className="size-4 text-emerald-500" />
                  <span>Worldwide Radar Target:</span>
                  <span className="font-bold text-foreground truncate max-w-[220px] sm:max-w-[320px]">
                    {userLocation.displayName}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-500/90 hidden md:inline">
                    ({userLocation.lat.toFixed(4)}°, {userLocation.lon.toFixed(4)}°)
                  </span>
                </div>
                {userLocation.isLoading && (
                  <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400 animate-pulse">
                    <Loader2 className="size-3 animate-spin" /> Locating...
                  </span>
                )}
              </div>

              {/* Location Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLocationChange(locationQuery);
                }}
                className="relative flex gap-2"
              >
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value.slice(0, 100))}
                    maxLength={100}
                    className="h-10 rounded-xl bg-background/80 pl-10 text-xs shadow-xs"
                    placeholder="Change location anywhere in the world (e.g. Tokyo, London, Paris, NYC)..."
                    aria-label="Change location worldwide"
                  />
                  {locationQuery && (
                    <button
                      type="button"
                      onClick={() => setLocationQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!locationQuery.trim() || userLocation.isLoading}
                  className="tactile-btn rounded-xl px-4 text-xs font-semibold"
                >
                  Update Map
                </Button>
              </form>

              {/* Quick-switch Worldwide Cities */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap mr-1">
                  Quick switch:
                </span>
                {QUICK_LOCATIONS.map((loc) => {
                  const isActive =
                    userLocation.displayName.toLowerCase().includes(loc.query.toLowerCase()) ||
                    (loc.query.includes("SRM") && userLocation.displayName.toLowerCase().includes("srm"));
                  return (
                    <button
                      key={loc.query}
                      type="button"
                      onClick={() => handleLocationChange(loc.query)}
                      disabled={userLocation.isLoading}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-all border ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-xs font-semibold"
                          : "bg-muted/50 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {loc.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Search & Category Filter Bar */}
          <ScrollReveal direction="up" delayMs={60} distance={14}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.slice(0, 100))}
                  maxLength={100}
                  className="h-11 rounded-xl bg-card pl-11 shadow-3d-card transition-shadow focus:shadow-3d-elevated"
                  placeholder="Search hospitals, clinics, 24/7 pharmacies..."
                  aria-label="Search healthcare facilities"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Architectural OpenStreetMap Radar Map Screen */}
          <ScrollReveal direction="up" delayMs={120} distance={16}>
            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-border/80 bg-slate-950 text-slate-100 shadow-3d-elevated select-none">
              <CareMap
                centerLat={userLocation.lat}
                centerLon={userLocation.lon}
                centerLabel={userLocation.displayName}
                locations={filteredLocations}
                selectedLocationName={hoveredLocation || directionsTarget?.name}
                onSelectLocation={(place) => setDirectionsTarget(place)}
              />
            </div>
          </ScrollReveal>

          {/* Facility Cards Grid */}
          <div className="grid gap-3.5 md:grid-cols-2">
            {filteredLocations.map((place, idx) => {
              const isHovered = hoveredLocation === place.name;
              return (
                <ScrollReveal key={place.name} delayMs={140 + idx * 40} direction="up" distance={14}>
                  <Interactive3DCard maxTilt={2.6} className="h-full rounded-2xl">
                    <article
                      onMouseEnter={() => setHoveredLocation(place.name)}
                      onMouseLeave={() => setHoveredLocation(null)}
                      className={`card-3d preserve-3d flex h-full flex-col justify-between p-5 rounded-2xl border transition-all duration-300 ${
                        isHovered ? "border-primary/60 shadow-3d-elevated bg-primary/5" : "border-border/70"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                              <Building2 className="size-3" />
                              {place.type}
                            </span>
                            <h3 className="mt-2 font-display text-lg font-bold tracking-tight">{place.name}</h3>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              place.open
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${place.open ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                            />
                            {place.open ? "Open Now" : "Closed"}
                          </span>
                        </div>
                        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                          {place.address}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground tnum">{place.distance}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" /> ~8-12 min transit
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDirectionsTarget(place)}
                        className="tactile-btn mt-5 w-full gap-2 border-border/80 hover:border-primary/50 hover:bg-primary-soft hover:text-primary"
                      >
                        <Navigation className="size-3.5" />
                        Navigate & Contact
                      </Button>
                    </article>
                  </Interactive3DCard>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* Sidebar: Health Records & Campus Desk */}
        <aside className="space-y-5">
          <ScrollReveal direction="up" delayMs={150} distance={16}>
            <Interactive3DCard maxTilt={2.2} className="rounded-2xl">
              <section className="card-3d preserve-3d p-6 rounded-2xl border border-border/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-success-soft text-success shadow-xs ring-1 ring-success/20">
                      <Syringe className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold">My Health Records</h3>
                      <p className="text-xs text-muted-foreground">Digital immunization vault</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success border border-success/20">
                    {healthRecords.length} Verified
                  </span>
                </div>

                <div className="mt-5 space-y-2.5">
                  {healthRecords.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-muted/40 p-3.5 border border-border/40 transition-colors hover:bg-muted/70"
                    >
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{item.date}</p>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-semibold text-success">
                        <ShieldCheck className="size-4" />
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Seasonal Notice */}
                <div className="mt-4 rounded-xl border border-warning/30 bg-warning-soft p-4 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="size-4 text-warning mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Flu vaccination reminder</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Recommended before monsoon transition · Campus health clinic clinic open Mon–Fri.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </Interactive3DCard>
          </ScrollReveal>

          <ScrollReveal direction="up" delayMs={220} distance={16}>
            <Interactive3DCard maxTilt={2.2} className="rounded-2xl">
              <section className="preserve-3d relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white shadow-3d-elevated">
                <div className="absolute -right-8 -bottom-8 size-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
                    <Cross className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold">{campusTitle} Triage Desk</h3>
                    <p className="text-xs text-emerald-200">Local Area · First Aid & Referrals</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/85">
                  Available Mon–Sat, 8:00 AM – 6:00 PM. Registered nurses on site with student prescription dispensary.
                </p>
                <div className="mt-5 flex gap-2.5">
                  <a
                    href="tel:+914422578000"
                    className="tactile-btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 px-4 text-sm font-semibold text-emerald-950 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Phone className="size-4 text-emerald-700" />
                    Call Desk
                  </a>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => alert(`${campusTitle} clinic hours: Mon-Sat 8am-6pm. Walk-ins welcome for student triage.`)}
                  >
                    Schedule
                  </Button>
                </div>
              </section>
            </Interactive3DCard>
          </ScrollReveal>
        </aside>
      </div>

      {/* Directions / Facility Modal */}
      <Dialog open={Boolean(directionsTarget)} onOpenChange={(open) => !open && setDirectionsTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          {directionsTarget && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Building2 className="size-4" />
                  <span>{directionsTarget.type}</span>
                </div>
                <DialogTitle className="font-display text-2xl font-bold">{directionsTarget.name}</DialogTitle>
                <DialogDescription>{directionsTarget.address}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="rounded-xl bg-muted/40 p-4 border border-border/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Operating Status</span>
                    <span className={`font-semibold ${directionsTarget.open ? "text-success" : "text-coral"}`}>
                      {directionsTarget.open ? "Open Now (24/7 Triage)" : "Closed"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distance from Campus</span>
                    <span className="font-semibold text-foreground tnum">{directionsTarget.distance}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recommended Route</span>
                    <span className="font-semibold text-foreground">
                      {directionsTarget.routeHint || "Via Main Access Corridor"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary-soft p-3.5 text-xs text-primary flex items-start gap-2">
                  <Check className="size-4 shrink-0 mt-0.5" />
                  <span>Student ID card accepted for zero-advance emergency registration.</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="tactile-btn flex-1 gap-2"
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          directionsTarget.name + " " + directionsTarget.address
                        )}`,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                  >
                    <Navigation className="size-4" />
                    Open in Google Maps
                  </Button>
                  <Button variant="outline" onClick={() => setDirectionsTarget(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}