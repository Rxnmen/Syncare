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
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { useWellnessStore } from "@/lib/wellness-store";
import { student } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — Syncare" },
      { name: "description", content: "Manage your Syncare profile, goals, notifications, and privacy." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Profile & Settings — Syncare" },
      { property: "og:description", content: "Manage your Syncare profile, goals, notifications, and privacy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profileData, logout, updateUserProfileData } = useFirebaseAuth();
  const { setUserCity } = useWellnessStore();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/auth", replace: true });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim().slice(0, 100);
    const city = String(fd.get("city") ?? "").replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim().slice(0, 100);
    const age = Math.min(Math.max(Number(fd.get("age")) || 19, 13), 100);
    const water = Math.min(Math.max(Number(fd.get("water")) || 2500, 500), 10000);
    const steps = Math.min(Math.max(Number(fd.get("steps")) || 10000, 1000), 100000);
    const sleep = Math.min(Math.max(Number(fd.get("sleep")) || 8, 3), 14);

    await updateUserProfileData({
      fullName: name || student.name,
      age,
      city: city || student.city,
      waterTarget: water,
      stepsTarget: steps,
      sleepTarget: sleep,
    });
    if (city) {
      await setUserCity(city);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const displayName = profileData?.fullName || user?.displayName || student.name;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || student.initials;

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
        onSubmit={handleSave}
      >
        <ScrollReveal direction="up" delayMs={60} distance={16}>
          <Interactive3DCard maxTilt={1.8} className="rounded-2xl">
            <section className="card-3d preserve-3d p-6 md:p-8 rounded-2xl border border-border/80">
              <div className="flex items-center gap-4">
                <span className="relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 font-display text-xl font-bold text-white shadow-3d-card">
                  {initials}
                  <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-400 border-2 border-card" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-2xl font-bold tracking-tight">{displayName}</h2>
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
                  <Input
                    id="name"
                    name="name"
                    defaultValue={profileData?.fullName || user?.displayName || student.name}
                    maxLength={100}
                    required
                    className="h-11 rounded-xl bg-card shadow-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    defaultValue={profileData?.age || student.age}
                    min="13"
                    max="100"
                    className="h-11 rounded-xl bg-card shadow-xs"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="city" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campus / City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={profileData?.city || student.city}
                    maxLength={100}
                    required
                    className="h-11 rounded-xl bg-card shadow-xs"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/60">
                <h3 className="font-display text-lg font-bold tracking-tight">Daily Baseline Targets</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Personalize thresholds for your daily score ring.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="water" className="text-xs text-muted-foreground">Water (ml)</Label>
                    <Input
                      id="water"
                      name="water"
                      type="number"
                      min={500}
                      max={10000}
                      defaultValue={profileData?.waterTarget || student.targets.water}
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="steps" className="text-xs text-muted-foreground">Steps Target</Label>
                    <Input
                      id="steps"
                      name="steps"
                      type="number"
                      min={1000}
                      max={100000}
                      defaultValue={profileData?.stepsTarget || student.targets.steps}
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleep" className="text-xs text-muted-foreground">Sleep Goal (hrs)</Label>
                    <Input
                      id="sleep"
                      name="sleep"
                      type="number"
                      min={3}
                      max={14}
                      defaultValue={profileData?.sleepTarget || student.targets.sleep}
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button className="tactile-btn gap-2" type="submit" disabled={saving}>
                  <Save className="size-4" />
                  {saving ? "Saving to Firebase…" : "Save Preferences"}
                </Button>
                {saved && (
                  <span className="text-sm font-semibold text-success animate-in fade-in duration-300 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-success animate-ping" />
                    Synchronized with Firebase
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
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold tracking-tight">Account & Session</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-500 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Firebase Cloud
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Signed in as <span className="font-semibold text-foreground">{user?.email || "rxnmenn@srmist.edu.in"}</span>. Connected to <span className="font-mono text-[11px] text-primary">syncare-f7ec3</span>.
              </p>
              <div className="mt-5 flex gap-2.5">
                <Button asChild variant="outline" className="tactile-btn flex-1">
                  <Link to="/auth">Switch Account</Link>
                </Button>
                <Button type="button" variant="ghost" className="tactile-btn text-coral hover:bg-coral-soft hover:text-coral" onClick={handleLogout}>
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