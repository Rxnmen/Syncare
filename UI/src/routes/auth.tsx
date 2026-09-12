import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

import { Interactive3DCard } from "@/components/ui/interactive-3d-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — VitaStudent" },
      { name: "description", content: "Sign in or create your VitaStudent wellness profile." },
      { property: "og:title", content: "Sign in — VitaStudent" },
      { property: "og:description", content: "Sign in or create your VitaStudent wellness profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const fd = new FormData(event.currentTarget);
    const emailResult = emailSchema.safeParse(fd.get("email"));
    if (!emailResult.success) {
      setError(emailResult.error.issues[0]?.message ?? "Check your email");
      return;
    }
    setLoading(true);
    if (mode === "forgot") {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(emailResult.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (authError) setError(authError.message);
      else setMessage("Check your email for a secure reset link.");
      return;
    }
    const password = String(fd.get("password") ?? "");
    if (password.length < 8) {
      setLoading(false);
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signup") {
      const fullName = String(fd.get("fullName") ?? "").trim();
      const age = Number(fd.get("age"));
      const city = String(fd.get("city") ?? "").trim();
      if (!fullName || fullName.length > 100 || !city || city.length > 100 || age < 13 || age > 100) {
        setLoading(false);
        setError("Please check your profile details.");
        return;
      }
      const { data, error: authError } = await supabase.auth.signUp({
        email: emailResult.data,
        password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: fullName, age, city } },
      });
      setLoading(false);
      if (authError) setError(authError.message);
      else if (!data.session) setMessage("Check your email to confirm your account.");
      else navigate({ to: "/" });
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({ email: emailResult.data, password });
    setLoading(false);
    if (authError) setError(authError.message);
    else navigate({ to: "/" });
  };

  const google = async () => {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setError(result.error.message);
    else if (!result.redirected) navigate({ to: "/" });
  };

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[.9fr_1.1fr]">
      <section className="flex items-center justify-center px-5 py-10">
        <ScrollReveal direction="up" distance={16} className="w-full max-w-md">
          <Link to="/" className="group inline-flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="size-5" />
            </span>
            <span className="font-display text-xl font-semibold">VitaStudent</span>
          </Link>
          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {mode === "signin" ? "Welcome back" : mode === "signup" ? "Start your journey" : "Account recovery"}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">
              {mode === "signin"
                ? "Feel better, one day at a time."
                : mode === "signup"
                ? "Create your wellness space."
                : "Reset your password."}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "forgot"
                ? "We’ll send a secure reset link to your email."
                : "A calmer way to understand your daily wellbeing."}
            </p>
          </div>
          <form className="mt-8 space-y-4" onSubmit={submit}>
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" name="fullName" required maxLength={100} placeholder="Alex Kumar" className="h-10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" name="age" type="number" min="13" max="100" required placeholder="20" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" required maxLength={100} placeholder="Chennai" className="h-10" />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="alex@college.edu" className="h-10" />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-xs font-semibold text-primary hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={show ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    minLength={8}
                    required
                    className="h-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Show password"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            )}
            {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            {message && <p className="rounded-lg bg-success-soft p-3 text-sm font-medium text-success">{message}</p>}
            <Button className="tactile-btn h-11 w-full font-semibold" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
          </form>
          {mode !== "forgot" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or continue with
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button variant="outline" className="tactile-btn h-11 w-full gap-2" onClick={google}>
                <span className="font-bold">G</span>Google
              </Button>
            </>
          )}
          <button
            className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "New to VitaStudent? Create an account" : "Already have an account? Sign in"}
          </button>
        </ScrollReveal>
      </section>

      <aside className="auth-visual hidden items-center justify-center p-12 lg:flex">
        <ScrollReveal direction="up" delayMs={150} distance={20} className="max-w-lg">
          <div className="grid size-14 place-items-center rounded-2xl bg-card shadow-3d-card">
            <ShieldCheck className="size-8 text-primary" />
          </div>
          <p className="mt-8 font-display text-4xl font-semibold leading-tight">
            Wellness guidance that fits between lectures, deadlines, and real life.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {["Private by design", "Made for students", "Simple daily habits"].map((x, i) => (
              <Interactive3DCard key={x} maxTilt={4} className="rounded-xl">
                <div className="card-3d preserve-3d flex h-full items-center justify-center p-4 text-center text-sm font-semibold">
                  {x}
                </div>
              </Interactive3DCard>
            ))}
          </div>
        </ScrollReveal>
      </aside>
    </main>
  );
}