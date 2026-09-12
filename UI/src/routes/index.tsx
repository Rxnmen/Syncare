import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, Plus, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { QuickHealthHelp } from "@/components/quick-health-help";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Interactive3DCard } from "@/components/ui/interactive-3d-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { RadialGauge } from "@/components/ui/radial-gauge";
import { metrics, student } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Syncare — Daily Wellness Companion" },
      { name: "description", content: "Track daily student wellness, habits, health guidance, and personalised insights." },
      { property: "og:title", content: "Syncare — Daily Wellness Companion" },
      { property: "og:description", content: "Track daily student wellness, habits, health guidance, and personalised insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [logged, setLogged] = useState<string | null>(null);
  const date = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <AppShell title={`Good morning, ${student.name}`} eyebrow={date}>
      <ScrollReveal direction="up" distance={16}>
        <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
          <Interactive3DCard maxTilt={2.5} className="rounded-2xl">
            <section className="score-card preserve-3d relative overflow-hidden rounded-2xl p-6 text-primary-foreground md:p-8">
              <div className="flex h-full flex-col justify-between gap-8 md:flex-row md:items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold backdrop-blur-md transition-transform group-hover:translate-z-10">
                    <Sparkles className="size-3.5 text-white animate-pulse" />
                    <span>Today’s Wellness Score</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-200">
                      <TrendingUp className="size-3" /> +4 pts vs yesterday
                    </span>
                  </div>
                  <h2 className="max-w-md font-display text-3xl font-bold leading-tight md:text-4xl text-white">
                    You’re doing well. A little more rest will go a long way.
                  </h2>
                  <p className="max-w-lg text-sm leading-relaxed text-white/80">
                    Your movement and hydration are on track. Sleep is the clearest opportunity to improve today.
                  </p>
                </div>

                {/* Animated SVG Radial Gauge */}
                <div className="relative flex shrink-0 items-center justify-center">
                  <div className="relative rounded-full bg-white/5 p-2 backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                    <RadialGauge
                      value={78}
                      size={152}
                      strokeWidth={11}
                      inverted={true}
                      sublabel="out of 100"
                    />
                  </div>
                </div>
              </div>
            </section>
          </Interactive3DCard>

          <Interactive3DCard maxTilt={2.8} className="rounded-2xl">
            <section className="card-3d preserve-3d flex h-full flex-col justify-between p-6 md:p-7 rounded-2xl border border-border/80 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 size-36 rounded-full bg-coral/10 blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-coral-soft text-coral shadow-xs ring-1 ring-coral/20">
                      <Sparkles className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-coral">Today’s Insight</p>
                      <h2 className="font-display text-xl font-bold tracking-tight">Protect your sleep window</h2>
                    </div>
                  </div>
                  <span className="rounded-full bg-coral/10 px-2.5 py-0.5 text-[11px] font-semibold text-coral border border-coral/20">
                    High Impact
                  </span>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  Your physical activity and movement are in the top 15% today, but your sleep deficit is accumulating. Winding down 30 minutes earlier tonight will restore your cognitive focus for tomorrow.
                </p>
                <div className="mt-4 rounded-xl bg-muted/40 p-3 border border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Optimal bedtime target</span>
                  <span className="font-semibold text-foreground tnum">10:45 PM — 11:15 PM</span>
                </div>
              </div>
              <Button variant="outline" className="tactile-btn mt-6 w-fit gap-2 border-coral/30 text-coral hover:bg-coral-soft hover:text-coral">
                View recommendations <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </section>
          </Interactive3DCard>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" delayMs={100} distance={12}>
        <div className="mt-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Today at a glance</h2>
            <p className="mt-1 text-sm text-muted-foreground">Six essential signals tracked in real-time.</p>
          </div>
          <span className="hidden items-center gap-1.5 text-xs font-semibold text-success sm:inline-flex bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Live sync active
          </span>
        </div>
      </ScrollReveal>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric, idx) => (
          <ScrollReveal key={metric.label} delayMs={120 + idx * 50} direction="up" distance={16}>
            <MetricCard metric={metric} />
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delayMs={350} direction="up" distance={14}>
        <section className="card-3d mt-8 p-6 rounded-2xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight">Quick log</h2>
              <p className="mt-1 text-sm text-muted-foreground">Update metrics instantly without leaving your dashboard.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Add water", presets: ["+250 ml", "+500 ml", "+750 ml"] },
                { name: "Update steps", presets: ["+1,000 steps", "+2,500 steps", "+5,000 steps"] },
                { name: "Log sleep", presets: ["7.5 hrs", "8.0 hrs", "8.5 hrs"] },
                { name: "Log exercise", presets: ["15 min walk", "30 min workout", "45 min run"] },
                { name: "Set mood", presets: ["Energized", "Calm", "Focused", "Tired"] },
                { name: "Add meal", presets: ["Balanced Lunch", "Healthy Snack", "Nutritious Dinner"] },
              ].map((item) => (
                <Dialog key={item.name}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="tactile-btn shadow-xs hover:border-primary/50 hover:bg-primary-soft">
                      <Plus className="size-3.5 text-primary" />
                      {item.name}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl">{item.name}</DialogTitle>
                      <DialogDescription>Select a quick preset or enter custom value for today.</DialogDescription>
                    </DialogHeader>
                    <form
                      className="space-y-4 pt-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setLogged(item.name);
                      }}
                    >
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Quick Presets</Label>
                        <div className="flex flex-wrap gap-2">
                          {item.presets.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                const input = document.getElementById(item.name) as HTMLInputElement;
                                if (input) input.value = preset;
                              }}
                              className="text-xs px-2.5 py-1 rounded-lg border border-border/80 bg-muted/40 hover:bg-primary-soft hover:border-primary/40 hover:text-primary transition-all duration-150 font-medium"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={item.name}>Custom value</Label>
                        <Input id={item.name} required placeholder="Enter value" className="h-10" />
                      </div>
                      <Button type="submit" className="tactile-btn w-full">
                        <Check className="size-4" />
                        Save update
                      </Button>
                      {logged === item.name && (
                        <p className="text-center text-sm font-semibold text-success animate-in fade-in duration-300">
                          Saved to today’s summary.
                        </p>
                      )}
                    </form>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <QuickHealthHelp />
    </AppShell>
  );
}
