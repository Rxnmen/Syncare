import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Interactive3DCard } from "@/components/ui/interactive-3d-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

import { useFirebaseAuth } from "@/lib/firebase-auth";
import { FirebaseError } from "firebase/app";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Syncare" },
      { name: "description", content: "Sign in or create your Syncare wellness profile." },
      { property: "og:title", content: "Sign in — Syncare" },
      { property: "og:description", content: "Sign in or create your Syncare wellness profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

function formatFirebaseError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password. Please verify your credentials.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Please sign in.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 8 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/popup-closed-by-user":
        return "Google sign-in popup was closed before completion.";
      case "auth/too-many-requests":
        return "Too many unsuccessful attempts. Please wait a few minutes.";
      default:
        return err.message.replace(/^Firebase:\s*/, "");
    }
  }
  return err instanceof Error ? err.message : "An unexpected error occurred.";
}

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset } = useFirebaseAuth();

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

    try {
      if (mode === "forgot") {
        await sendPasswordReset(emailResult.data);
        setLoading(false);
        setMessage("Firebase password reset link sent! Check your inbox.");
        return;
      }

      const password = String(fd.get("password") ?? "");
      if (password.length < 8 || password.length > 128) {
        setLoading(false);
        setError("Password must be between 8 and 128 characters.");
        return;
      }

      if (mode === "signup") {
        const rawName = String(fd.get("fullName") ?? "").replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
        const rawCity = String(fd.get("city") ?? "").replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
        const age = Number(fd.get("age"));

        if (!rawName || rawName.length > 100 || !rawCity || rawCity.length > 100 || isNaN(age) || age < 13 || age > 100) {
          setLoading(false);
          setError("Please check your profile details (valid name, city up to 100 chars, age between 13-100).");
          return;
        }

        await signUpWithEmail(emailResult.data, password, { fullName: rawName, age, city: rawCity });
        setLoading(false);
        setMessage("Account created successfully with Firebase!");
        navigate({ to: "/" });
        return;
      }

      // Default: Sign in
      await signInWithEmail(emailResult.data, password);
      setLoading(false);
      navigate({ to: "/" });
    } catch (err) {
      setLoading(false);
      setError(formatFirebaseError(err));
    }
  };

  const google = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate({ to: "/" });
    } catch (err) {
      setError(formatFirebaseError(err));
    }
  };

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[.9fr_1.1fr]">
      <section className="flex items-center justify-center px-5 py-10">
        <ScrollReveal direction="up" distance={16} className="w-full max-w-md">
          <Link to="/" className="group inline-flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="size-5" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">Syncare</span>
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
                  <Input id="fullName" name="fullName" required maxLength={100} placeholder="Rxnmenn" className="h-10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" name="age" type="number" min="13" max="100" required placeholder="19" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Campus / City</Label>
                    <Input id="city" name="city" required maxLength={100} placeholder="SRM Kattankulathur" className="h-10" />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="rxnmenn@srmist.edu.in" className="h-10" />
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
                    maxLength={128}
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
              <Button variant="outline" type="button" className="tactile-btn h-11 w-full gap-2.5 font-medium" onClick={google}>
                <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </Button>
            </>
          )}
          <button
            className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "New to Syncare? Create an account" : "Already have an account? Sign in"}
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