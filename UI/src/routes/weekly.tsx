import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  Check,
  CheckCircle2,
  Droplets,
  Footprints,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, PageHeading } from "@/components/app-shell";
import { Interactive3DCard } from "@/components/ui/interactive-3d-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useWellnessStore } from "@/lib/wellness-store";

export const Route = createFileRoute("/weekly")({
  head: () => ({
    meta: [
      { title: "Weekly Report — Syncare" },
      { name: "description", content: "Review weekly wellness trends, sleep consistency, hydration, and habit analytics." },
      { property: "og:title", content: "Weekly Report — Syncare" },
      { property: "og:description", content: "Review weekly wellness trends, sleep consistency, hydration, and habit analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WeeklyPage,
});

function WeeklyPage() {
  const { weeklyTelemetry, targets, completedMilestones, toggleMilestone } = useWellnessStore();
  const [activeChartMetric, setActiveChartMetric] = useState<"score-sleep" | "stress-exercise">("score-sleep");

  const kpis = useMemo(() => {
    const activeDays = weeklyTelemetry.filter(
      (d) => d.score > 0 || d.steps > 0 || d.water > 0 || d.sleep > 0
    );
    const n = activeDays.length;

    if (n === 0) {
      return {
        avgScore: 0,
        avgSleepStr: "0h 00m",
        avgSleepDec: 0,
        avgWater: "0.0",
        avgSteps: "0",
        rawAvgSteps: 0,
        activeDaysCount: 0,
      };
    }

    const avgScore = Math.round(activeDays.reduce((acc, d) => acc + d.score, 0) / n);
    const avgSleepDec = activeDays.reduce((acc, d) => acc + d.sleep, 0) / n;
    const avgSleepHrs = Math.floor(avgSleepDec);
    const avgSleepMins = Math.round((avgSleepDec - avgSleepHrs) * 60);
    const avgSleepStr = `${avgSleepHrs}h ${avgSleepMins < 10 ? `0${avgSleepMins}` : avgSleepMins}m`;

    const avgWater = (activeDays.reduce((acc, d) => acc + d.water, 0) / n).toFixed(1);
    const rawAvgSteps = Math.round(activeDays.reduce((acc, d) => acc + d.steps, 0) / n);
    const avgSteps = rawAvgSteps.toLocaleString();

    return { avgScore, avgSleepStr, avgSleepDec, avgWater, avgSteps, rawAvgSteps, activeDaysCount: n };
  }, [weeklyTelemetry]);

  const weekEyebrow = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmtStart = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(monday);
    const fmtEnd = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(sunday);
    return `${fmtStart} – ${fmtEnd} · Campus Cycle`;
  }, []);

  const maxStepsDay = useMemo(() => {
    return weeklyTelemetry.reduce((max, d) => (d.steps > max.steps ? d : max), {
      day: "None",
      steps: 0,
      score: 0,
      sleep: 0,
      water: 0,
      exercise: 0,
      stress: 0,
    });
  }, [weeklyTelemetry]);

  const waterTargetL = targets.water / 1000;
  const waterDiff = (waterTargetL - Number(kpis.avgWater)).toFixed(1);
  const sleepDiffMins = Math.round((targets.sleep - kpis.avgSleepDec) * 60);
  const stepsDiff = targets.steps - kpis.rawAvgSteps;

  return (
    <AppShell title="Weekly Telemetry & Report" eyebrow={weekEyebrow}>
      <ScrollReveal direction="up" distance={14}>
        <PageHeading
          title="A week of steady, measured progress"
          description="Synthesized performance metrics across your circadian cycle, hydration, steps, and study blocks."
          action={
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Trophy className="size-4 text-emerald-500" />
              <span>Campus Wellness Top 15%</span>
            </div>
          }
        />
      </ScrollReveal>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: Target,
            label: "Average Score",
            value: String(kpis.avgScore),
            unit: "/ 100",
            note:
              kpis.activeDaysCount === 0
                ? "Awaiting daily inputs"
                : kpis.avgScore >= 80
                ? "Optimal zone"
                : kpis.avgScore >= 60
                ? "Steady baseline"
                : "Building momentum",
            isPositive: kpis.avgScore >= 60,
            iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
          },
          {
            icon: BedDouble,
            label: "Average Sleep",
            value: kpis.avgSleepStr,
            unit: "daily",
            note:
              kpis.activeDaysCount === 0
                ? "No sleep logged"
                : sleepDiffMins <= 0
                ? "Target achieved"
                : `${sleepDiffMins}m under target`,
            isPositive: kpis.activeDaysCount > 0 && sleepDiffMins <= 0,
            iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
          },
          {
            icon: Droplets,
            label: "Daily Hydration",
            value: `${kpis.avgWater} L`,
            unit: `/ ${waterTargetL.toFixed(1)} L`,
            note:
              kpis.activeDaysCount === 0
                ? "No hydration logged"
                : Number(kpis.avgWater) >= waterTargetL
                ? "Target achieved"
                : `${waterDiff} L to goal`,
            isPositive: kpis.activeDaysCount > 0 && Number(kpis.avgWater) >= waterTargetL,
            iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
          },
          {
            icon: Footprints,
            label: "Average Daily Steps",
            value: kpis.avgSteps,
            unit: "steps",
            note:
              kpis.activeDaysCount === 0
                ? "No steps logged"
                : stepsDiff <= 0
                ? "Goal completed"
                : `${stepsDiff.toLocaleString()} to goal`,
            isPositive: kpis.activeDaysCount > 0 && stepsDiff <= 0,
            iconBg: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
          },
        ].map((x, idx) => (
          <ScrollReveal key={x.label} delayMs={idx * 50} direction="up" distance={16}>
            <Interactive3DCard maxTilt={2.8} className="h-full rounded-2xl">
              <article className="card-3d preserve-3d flex h-full flex-col justify-between p-5.5 rounded-2xl border border-border/80">
                <div className="flex items-center justify-between">
                  <span className={`grid size-10 place-items-center rounded-xl ${x.iconBg} shadow-xs ring-1 ring-black/5`}>
                    <x.icon className="size-5" />
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      x.isPositive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {x.isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                    {x.note}
                  </span>
                </div>
                <div className="mt-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{x.label}</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <strong className="tnum font-display text-3xl font-bold tracking-tight text-foreground">
                      {x.value}
                    </strong>
                    <span className="text-xs text-muted-foreground font-medium">{x.unit}</span>
                  </div>
                </div>
              </article>
            </Interactive3DCard>
          </ScrollReveal>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <ScrollReveal direction="up" delayMs={200} distance={18}>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          {/* Main Trend Chart */}
          <section className="card-3d p-6 rounded-2xl border border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="font-display text-lg font-bold tracking-tight">Circadian Trends</h3>
                <p className="text-xs text-muted-foreground">Comparative daily wellness and physiological correlation</p>
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/50">
                <button
                  onClick={() => setActiveChartMetric("score-sleep")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    activeChartMetric === "score-sleep"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Wellness & Sleep
                </button>
                <button
                  onClick={() => setActiveChartMetric("stress-exercise")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    activeChartMetric === "stress-exercise"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Stress & Exercise
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTelemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/50" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background: "color-mix(in oklab, var(--card) 92%, transparent)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                      color: "var(--foreground)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  {activeChartMetric === "score-sleep" ? (
                    <>
                      <Area
                        name="Wellness Score"
                        type="monotone"
                        dataKey="score"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#scoreGradient)"
                      />
                      <Area
                        name="Sleep (hrs x10)"
                        type="monotone"
                        dataKey={(d) => Math.round(d.sleep * 10)}
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fill="url(#secondaryGradient)"
                      />
                    </>
                  ) : (
                    <>
                      <Area
                        name="Exercise (mins)"
                        type="monotone"
                        dataKey="exercise"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#scoreGradient)"
                      />
                      <Area
                        name="Stress Level"
                        type="monotone"
                        dataKey="stress"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fill="url(#secondaryGradient)"
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span>{activeChartMetric === "score-sleep" ? "Wellness Score" : "Exercise (mins)"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-rose-500" />
                <span>{activeChartMetric === "score-sleep" ? "Sleep Index" : "Stress Index"}</span>
              </div>
            </div>
          </section>

          {/* Daily Steps Bar Chart */}
          <section className="card-3d p-6 rounded-2xl border border-border/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight">Movement Distribution</h3>
                  <p className="text-xs text-muted-foreground">Daily step volume vs 10,000 baseline</p>
                </div>
                <span className="tnum text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Avg {kpis.activeDaysCount > 0 ? (kpis.rawAvgSteps / 1000).toFixed(1) : "0"}k
                </span>
              </div>

              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTelemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/50" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(val: number) => [`${val.toLocaleString()} steps`, "Steps"]}
                      contentStyle={{
                        borderRadius: 14,
                        border: "1px solid var(--border)",
                        background: "color-mix(in oklab, var(--card) 92%, transparent)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                        color: "var(--foreground)",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    />
                    <Bar dataKey="steps" fill="url(#barGradient)" radius={[8, 8, 2, 2]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
              <span>Goal: {targets.steps.toLocaleString()} steps/day</span>
              <span className="font-semibold text-foreground">
                Highest: {maxStepsDay.steps > 0 ? `${maxStepsDay.day} (${maxStepsDay.steps.toLocaleString()})` : "No steps recorded"}
              </span>
            </div>
          </section>
        </div>
      </ScrollReveal>

      {/* Review & Next Week Milestone Planning */}
      <ScrollReveal direction="up" delayMs={280} distance={16}>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* Week in Review */}
          <Interactive3DCard maxTilt={2} className="rounded-2xl">
            <section className="preserve-3d relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 md:p-7 text-white shadow-3d-elevated h-full flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm border border-white/20">
                    <Sparkles className="size-3.5" />
                    Synthesis Report
                  </span>
                  <span className="text-xs font-medium text-emerald-200">Confidence 94%</span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-white">
                  {kpis.activeDaysCount === 0
                    ? "Awaiting weekly activity logs"
                    : kpis.avgScore >= 75
                    ? "High mobility and balanced recovery"
                    : "Active weekly calibration in progress"}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  {kpis.activeDaysCount === 0
                    ? "Welcome to Syncare! Your weekly circadian analysis and trend synthesis will appear here once daily biometric telemetry is recorded."
                    : `You have recorded ${kpis.activeDaysCount} active day${kpis.activeDaysCount > 1 ? "s" : ""} this week with an average wellness score of ${kpis.avgScore}/100 and ${kpis.avgWater} L daily hydration.`}
                </p>
              </div>

              <div className="mt-6 rounded-xl bg-white/10 p-3.5 backdrop-blur-xs border border-white/15 text-xs text-white/90 flex items-center justify-between">
                <span>Key Highlight</span>
                <span className="font-bold text-emerald-200">
                  {maxStepsDay.steps > 0
                    ? `${maxStepsDay.steps.toLocaleString()} steps on ${maxStepsDay.day}`
                    : "Log daily activity to unlock highlights"}
                </span>
              </div>
            </section>
          </Interactive3DCard>

          {/* Next Week's Strategic Action Items */}
          <Interactive3DCard maxTilt={2} className="rounded-2xl">
            <section className="card-3d preserve-3d p-6 md:p-7 rounded-2xl border border-border/80 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
                    <Zap className="size-3.5" />
                    Action Items
                  </span>
                  <span className="text-xs text-muted-foreground">Click to toggle focus</span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">Next Week’s Focus</h3>
                <p className="mt-1 text-sm text-muted-foreground">3 high-leverage micro-adjustments for next week.</p>

                <div className="mt-5 space-y-3 text-sm">
                  {[
                    { id: 1, text: "Set a 11:15 PM wind-down reminder on weekdays to guard sleep window." },
                    { id: 2, text: "Refill 750ml flask before each 2:00 PM lecture block." },
                    { id: 3, text: "Keep two lighter recovery days between high-intensity training sessions." },
                  ].map((goal) => {
                    const isDone = Boolean(completedMilestones[goal.id]);
                    return (
                      <div
                        key={goal.id}
                        onClick={() => toggleMilestone(goal.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                          isDone
                            ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                            : "bg-muted/40 border-border/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-lg text-xs font-bold transition-colors ${
                            isDone ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isDone ? <Check className="size-3.5" /> : goal.id}
                        </span>
                        <span className={`text-sm leading-snug ${isDone ? "line-through opacity-80" : ""}`}>
                          {goal.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span>Targets auto-sync with Syncare schedule</span>
                <span className="font-semibold text-primary">All systems active</span>
              </div>
            </section>
          </Interactive3DCard>
        </div>
      </ScrollReveal>
    </AppShell>
  );
}