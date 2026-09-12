import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BellRing, LockKeyhole, LogOut, Ruler, Save, UserRound } from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeading } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Interactive3DCard } from "@/components/ui/interactive-3d-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { supabase } from "@/integrations/supabase/client";
import { student } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — Syncare" },
      { name: "description", content: "Manage your Syncare profile, goals, notifications, and privacy." },
      { property: "og:title", content: "Profile & Settings — Syncare" },
      { property: "og:description", content: "Manage your Syncare profile, goals, notifications, and privacy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <AppShell title="Profile" eyebrow="Personal settings">
      <ScrollReveal direction="up" distance={14}>
        <PageHeading
          title="Make Syncare yours"
          description="Keep your profile current and shape goals that work with your real student routine."
        />
      </ScrollReveal>

      <form
        className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <ScrollReveal direction="up" delayMs={60} distance={16}>
          <Interactive3DCard maxTilt={1.8} className="rounded-2xl">
            <section className="card-3d preserve-3d p-6 md:p-8 rounded-2xl border border-border/80">
              <div className="flex items-center gap-4">
                <span className="relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 font-display text-xl font-bold text-white shadow-3d-card">
                  {student.initials}
                  <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-400 border-2 border-card" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-2xl font-bold tracking-tight">Profile Information</h2>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                      Active Student
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">Calibrates your daily wellness and hydration baselines.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full name</Label>
                  <Input id="name" defaultValue="Rxnmenn" maxLength={100} required className="h-11 rounded-xl bg-card shadow-xs" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Age</Label>
                  <Input id="age" type="number" defaultValue="19" min="13" max="100" className="h-11 rounded-xl bg-card shadow-xs" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="city" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campus / City</Label>
                  <Input id="city" defaultValue="SRM Kattankulathur" maxLength={100} required className="h-11 rounded-xl bg-card shadow-xs" />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/60">
                <h3 className="font-display text-lg font-bold tracking-tight">Daily Baseline Targets</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Personalize thresholds for your daily score ring.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="water" className="text-xs text-muted-foreground">Water (ml)</Label>
                    <Input id="water" type="number" defaultValue="2500" className="h-10 rounded-xl bg-card" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="steps" className="text-xs text-muted-foreground">Steps Target</Label>
                    <Input id="steps" type="number" defaultValue="10000" className="h-10 rounded-xl bg-card" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleep" className="text-xs text-muted-foreground">Sleep Goal (hrs)</Label>
                    <Input id="sleep" type="number" defaultValue="8" className="h-10 rounded-xl bg-card" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button className="tactile-btn gap-2" type="submit">
                  <Save className="size-4" />
                  Save Preferences
                </Button>
                {saved && (
                  <span className="text-sm font-semibold text-success animate-in fade-in duration-300 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-success animate-ping" />
                    Preferences synchronized
                  </span>
                )}
              </div>
            </section>
          </Interactive3DCard>
        </ScrollReveal>

        <aside className="space-y-4">
          {[
            { icon: BellRing, title: "Smart Notifications", text: "Circadian check-in alerts and hydration prompts" },
            { icon: Ruler, title: "Metric System", text: "Kilometres, litres, Celsius, and kilograms" },
            { icon: LockKeyhole, title: "Zero-Knowledge Privacy", text: "All biometrics encrypted with client-side key" },
          ].map((item, i) => (
            <ScrollReveal key={item.title} delayMs={100 + i * 50} direction="up" distance={14}>
              <Interactive3DCard maxTilt={2.2} className="rounded-2xl">
                <div className="card-3d preserve-3d flex items-center justify-between gap-4 p-5 rounded-2xl border border-border/80">
                  <div className="flex items-center gap-3.5">
                    <span className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground shadow-xs">
                      <item.icon className="size-5 text-primary" />
                    </span>
                    <div>
                      <p className="text-sm font-bold tracking-tight">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.text}</p>
                    </div>
                  </div>
                  {i < 2 ? (
                    <Switch defaultChecked aria-label={item.title} />
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                      <UserRound className="size-3.5" />
                      Encrypted
                    </span>
                  )}
                </div>
              </Interactive3DCard>
            </ScrollReveal>
          ))}

          <ScrollReveal delayMs={260} direction="up" distance={14}>
            <section className="card-3d p-6 rounded-2xl border border-border/80">
              <h3 className="font-display text-lg font-bold tracking-tight">Account & Session</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Signed in as <span className="font-semibold text-foreground">rxnmenn@srmist.edu.in</span>. Multi-device sync active.
              </p>
              <div className="mt-5 flex gap-2.5">
                <Button asChild variant="outline" className="tactile-btn flex-1">
                  <Link to="/auth">Switch Account</Link>
                </Button>
                <Button type="button" variant="ghost" className="tactile-btn text-coral hover:bg-coral-soft hover:text-coral" onClick={logout}>
                  <LogOut className="size-4" />
                  Sign Out
                </Button>
              </div>
            </section>
          </ScrollReveal>
        </aside>
      </form>
    </AppShell>
  );
}