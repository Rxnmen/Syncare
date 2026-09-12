import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  CloudSun,
  Compass,
  Droplets,
  Eye,
  Info,
  Layers,
  Shirt,
  Sparkles,
  Sun,
  Thermometer,
  TreePine,
  Wind,
} from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeading } from "@/components/app-shell";
import { Interactive3DCard } from "@/components/ui/interactive-3d-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useWellnessStore } from "@/lib/wellness-store";
import { useResolvedLocation } from "@/lib/location-service";
import { useWeatherTelemetry } from "@/lib/weather-service";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Weather & Environment — Syncare" },
      { name: "description", content: "Student-friendly environmental precautions for SRM Kattankulathur climate, UV index, and AQI." },
      { property: "og:title", content: "Weather & Environment — Syncare" },
      { property: "og:description", content: "Student-friendly environmental precautions for SRM Kattankulathur climate, UV index, and AQI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WeatherPage,
});

function getWeatherIcon(code: number) {
  if (code === 0) return Sun;
  if (code <= 3) return CloudSun;
  if ([45, 48].includes(code)) return CloudSun;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return Droplets;
  if ([95, 96, 99].includes(code)) return AlertTriangle;
  return Sun;
}

const guides = [
  {
    id: "hydration",
    icon: Droplets,
    title: "Hydration Target",
    text: "Aim for 2.8 – 3.2 L today. Electrolytes recommended if commuting by bicycle or walking midday.",
    badge: "3.0 L goal",
    color: "from-blue-500/20 to-cyan-500/10 text-blue-500",
  },
  {
    id: "clothing",
    icon: Shirt,
    title: "Lightweight Attire",
    text: "Wear loose, breathable cotton or linen. Avoid heavy synthetics that trap heat during lecture walks.",
    badge: "Breathable",
    color: "from-amber-500/20 to-yellow-500/10 text-amber-500",
  },
  {
    id: "activity",
    icon: TreePine,
    title: "Campus Movement",
    text: "Schedule outdoor sports and walks before 10 AM or post 5 PM when thermal radiance eases.",
    badge: "Evening sports",
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-500",
  },
  {
    id: "sun",
    icon: Sun,
    title: "UV & Skin Shield",
    text: "Apply broad-spectrum SPF 30+ 15 mins before heading out. Keep UV sunglasses in your bag.",
    badge: "SPF 30+",
    color: "from-rose-500/20 to-orange-500/10 text-rose-500",
  },
];

function WeatherPage() {
  const userLocation = useResolvedLocation();
  const weather = useWeatherTelemetry(userLocation.lat, userLocation.lon);
  const { todayLog, togglePrecaution } = useWellnessStore();
  const completedPrecautions = todayLog.precautions || [];

  const WeatherHeroIcon = getWeatherIcon(weather.weatherCode);
  const campusLabel = userLocation.displayName.split(",")[0] || "SRM Kattankulathur";

  return (
    <AppShell title="Atmosphere & Climate" eyebrow={`${campusLabel} Campus · Live Environmental Telemetry`}>
      <ScrollReveal direction="up" distance={14}>
        <PageHeading
          title="Plan well for the day outside"
          description="Real-time atmospheric insights mapped to student wellness, transit timing, and heat defense."
          action={
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Sun className="size-4 animate-spin [animation-duration:12s]" />
              <span>Solar Index: UV {weather.uvIndex} ({weather.uvIndex >= 8 ? "Very High" : weather.uvIndex >= 6 ? "High" : weather.uvIndex >= 3 ? "Moderate" : "Low"})</span>
            </div>
          }
        />
      </ScrollReveal>

      {/* Atmospheric Glass Hero */}
      <ScrollReveal direction="up" delayMs={60} distance={18}>
        <Interactive3DCard maxTilt={1.8} className="rounded-2xl">
          <section className="weather-band preserve-3d relative overflow-hidden rounded-2xl p-6 md:p-9 text-white shadow-3d-elevated">
            {/* Ambient Sun Orb Glow */}
            <div className="absolute -top-16 -right-16 size-72 rounded-full bg-amber-400/25 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 size-56 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/20">
                  <WeatherHeroIcon className="size-4" />
                  <span>{weather.condition} · {weather.conditionSub}</span>
                </div>

                <div className="mt-6 flex items-baseline gap-5">
                  <span className="tnum font-display text-7xl md:text-8xl font-black tracking-tighter drop-shadow-sm">
                    {weather.temperature}°
                  </span>
                  <div className="space-y-1 text-sm text-white/85">
                    <p className="font-semibold text-white">Feels like {weather.feelsLike}°C</p>
                    <p className="text-white/70">High {weather.tempMax}° · Low {weather.tempMin}°</p>
                    <p className="text-xs text-white/60">Wind {weather.windSpeed} km/h · Updated {weather.updatedAt}</p>
                  </div>
                </div>

                <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/85">
                  {weather.uvIndex >= 7
                    ? "High solar radiance with tropical campus warmth. Peak heat exhaustion risk occurs between 12:00 PM and 3:30 PM."
                    : "Moderate atmospheric conditions across campus. Favorable window for lecture transitions and outdoor student activity."}
                </p>
              </div>

              {/* Environmental Telemetry Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: Droplets,
                    val: `${weather.humidity}%`,
                    label: "Humidity",
                    sub: weather.humidity >= 70 ? "Humid tropical" : "Optimal",
                    color: "text-cyan-200",
                  },
                  {
                    icon: Sun,
                    val: `${weather.uvIndex}`,
                    label: "UV Index",
                    sub: weather.uvIndex >= 8 ? "Extreme Defense" : weather.uvIndex >= 6 ? "High Protection" : "Moderate",
                    color: "text-amber-200",
                  },
                  {
                    icon: Wind,
                    val: `${weather.aqi}`,
                    label: "AQI",
                    sub: weather.aqi <= 50 ? "Good" : weather.aqi <= 100 ? "Moderate" : "Sensitive",
                    color: "text-emerald-200",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="translate-z-10 flex flex-col justify-between rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/15 hover:scale-[1.03]"
                  >
                    <item.icon className={`size-5 ${item.color}`} />
                    <div className="mt-4">
                      <strong className="tnum block font-display text-xl font-bold tracking-tight text-white">
                        {item.val}
                      </strong>
                      <span className="block text-[11px] font-semibold text-white/80">{item.label}</span>
                      <span className="block text-[10px] text-white/60 truncate">{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Weather Strip */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/15">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">
                Campus Hourly Forecast & Heat Risk Gradient
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {weather.hourly.map((hour) => {
                  const HourIcon = getWeatherIcon(hour.code);
                  return (
                    <div
                      key={hour.time}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition-colors"
                    >
                      <span className="text-[11px] font-medium text-white/75">{hour.time}</span>
                      <HourIcon className="size-4.5 my-1.5 text-amber-200" />
                      <span className="tnum font-display text-sm font-bold text-white">{hour.temp}</span>
                      <span
                        className={`mt-1 rounded px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider ${
                          hour.heatRisk === "Extreme"
                            ? "bg-rose-500/40 text-rose-100"
                            : hour.heatRisk === "High"
                            ? "bg-amber-500/40 text-amber-100"
                            : "bg-emerald-500/30 text-emerald-100"
                        }`}
                      >
                        {hour.heatRisk}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </Interactive3DCard>
      </ScrollReveal>

      {/* Advisory Alert Banner */}
      <ScrollReveal direction="up" delayMs={150} distance={16}>
        <Interactive3DCard maxTilt={2} className="mt-6 rounded-2xl">
          <section className="card-3d preserve-3d p-6 rounded-2xl border border-warning/30 bg-warning-soft/60">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning-foreground shadow-xs ring-1 ring-warning/30">
                <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    High Temperature Advisory · 12:00 PM — 4:00 PM
                  </p>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    Active Precaution
                  </span>
                </div>
                <h3 className="mt-1 font-display text-xl font-bold tracking-tight">Stay shaded during lecture transitions</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The UV Index will exceed 8.0 between 12 PM and 2:30 PM. Use the covered walkways between the library and central labs. Make sure to refill your hydration flask at the ground floor water stations.
                </p>
              </div>
            </div>
          </section>
        </Interactive3DCard>
      </ScrollReveal>

      {/* Lifestyle Precautions Grid with Interactive Toggle */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Student Lifestyle Precautions</h2>
            <p className="text-sm text-muted-foreground">Tailored daily health habits based on current weather telemetry.</p>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Click to mark habits complete
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {guides.map((guide, idx) => {
            const isDone = completedPrecautions.includes(guide.id);
            return (
              <ScrollReveal key={guide.id} delayMs={180 + idx * 50} direction="up" distance={16}>
                <Interactive3DCard maxTilt={2.8} className="h-full rounded-2xl">
                  <article
                    onClick={() => togglePrecaution(guide.id)}
                    className={`card-3d preserve-3d flex h-full flex-col justify-between p-5.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isDone
                        ? "border-emerald-500/40 bg-emerald-500/5 shadow-xs"
                        : "border-border/70 hover:border-primary/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${guide.color} shadow-xs`}>
                          <guide.icon className="size-5" />
                        </span>
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                            isDone
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <CheckCircle2 className={`size-3.5 ${isDone ? "text-emerald-500" : "text-muted-foreground"}`} />
                          <span>{isDone ? "Done" : "Mark"}</span>
                        </button>
                      </div>

                      <div className="mt-5">
                        <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">{guide.badge}</span>
                        <h3 className="font-display text-lg font-bold tracking-tight">{guide.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{guide.text}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3 text-primary" />
                      <span>Updates based on local sensors</span>
                    </div>
                  </article>
                </Interactive3DCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Environmental telemetry recorded via Open-Meteo for {campusLabel} ({userLocation.lat.toFixed(4)}° N, {userLocation.lon.toFixed(4)}° E). Calibrated for student campus wellness.
      </p>
    </AppShell>
  );
}