import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, CalendarDays, CloudSun, HeartPulse, Home, LineChart, Moon, Quote, Settings, Sparkles, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useWellnessStore } from "@/lib/wellness-store";
import { useTheme } from "@/lib/theme";
import { useFirebaseAuth } from "@/lib/firebase-auth";

const items = [
  { to: "/" as const, label: "Home", icon: Home },
  { to: "/health" as const, label: "Health", icon: HeartPulse },
  { to: "/weather" as const, label: "Weather", icon: CloudSun },
  { to: "/weekly" as const, label: "Weekly", icon: LineChart },
  { to: "/profile" as const, label: "Profile", icon: Settings },
];

export function AppShell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useFirebaseAuth();
  const [scrolled, setScrolled] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const { isDark, toggleTheme } = useTheme();
  const { userInitials, isSyncing } = useWellnessStore();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 16);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPercent(Math.min(100, Math.max(0, (currentScrollY / totalHeight) * 100)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 animate-pulse">
            <Sparkles className="size-7" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight">Syncare</h1>
            <p className="text-xs text-muted-foreground mt-1">Connecting to your wellness space…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Subtle Atmospheric Depth Orbs (Pseudo-3D Ambience) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-36 right-12 size-[32rem] rounded-full bg-primary/6 blur-[120px] animate-[ambient-drift_12s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] -left-28 size-[30rem] rounded-full bg-coral/5 blur-[130px] animate-[ambient-drift_16s_ease-in-out_infinite_reverse]" />
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-sidebar/95 px-5 py-7 backdrop-blur-xl lg:flex lg:flex-col">
        <Link to="/" className="group flex items-center gap-3 px-2 transition-transform duration-200 hover:scale-[1.01]">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="size-5" />
          </span>
          <div>
            <strong className="block font-display text-lg font-bold tracking-tight">Syncare</strong>
            <span className="text-[11px] font-medium text-muted-foreground">Student wellness suite</span>
          </div>
        </Link>

        {/* Live Status Pill */}
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-foreground">SRM Campus Sync</span>
          <span className="ml-auto text-[10px] text-muted-foreground font-semibold">SRM KTR</span>
        </div>

        <nav className="mt-8 space-y-1.5" aria-label="Main navigation">
          {items.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground/90" />
                )}
                <item.icon className={`size-[18px] transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Redesigned Gentle Reminder */}
        <div className="mt-auto card-3d p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Quote className="size-3.5" />
            Daily Mindfulness
          </div>
          <p className="mt-2 text-xs font-medium leading-relaxed text-muted-foreground">
            Small, steady habits compound into lifelong resilience. Prioritize rest when your body signals.
          </p>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-64">
        <header
          className={`sticky top-0 z-30 transition-all duration-300 ${
            scrolled
              ? "border-b border-border/90 bg-background/85 px-4 py-3 shadow-sm backdrop-blur-xl md:px-8 lg:px-10"
              : "border-b border-border/60 bg-background/90 px-4 py-4 backdrop-blur-md md:px-8 lg:px-10"
          }`}
        >
          {/* Scroll Progress Hairline Bar */}
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 h-[2px] bg-gradient-to-r from-primary via-coral to-primary transition-all duration-150"
            style={{ width: `${scrollPercent}%`, opacity: scrolled ? 0.9 : 0 }}
          />

          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <CalendarDays className="size-3.5 text-primary" />
                {eyebrow}
              </p>
              <h1 className="mt-0.5 font-display text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="grid size-10 place-items-center rounded-xl border border-border bg-card/80 text-muted-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:text-foreground active:scale-95"
              >
                {isDark ? <Sun className="size-[18px] text-warning" /> : <Moon className="size-[18px]" />}
              </button>

              {/* Notification Bell */}
              <button
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-xl border border-border bg-card/80 text-muted-foreground shadow-xs transition-all duration-150 hover:border-primary/40 hover:text-foreground active:scale-95"
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-coral animate-pulse" />
              </button>

              {/* Profile Avatar */}
              <Link
                to="/profile"
                aria-label="Open profile"
                className="grid size-10 place-items-center rounded-xl bg-secondary font-display text-sm font-bold text-secondary-foreground shadow-xs transition-all duration-150 hover:scale-105 active:scale-95"
              >
                {userInitials}
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-6 md:px-8 lg:px-10 lg:pb-10">{children}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-border bg-background/90 px-2 pb-[max(.45rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        {items.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-semibold transition-transform active:scale-95 ${
                active ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`size-5 ${active ? "scale-105" : ""}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><h2 className="font-display text-2xl font-semibold md:text-3xl">{title}</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p></div>{action}</div>;
}