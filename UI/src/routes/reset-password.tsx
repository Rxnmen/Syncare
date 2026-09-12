import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Syncare" },
      { name: "description", content: "Set a new secure Syncare password." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Reset password — Syncare" },
      { property: "og:description", content: "Set a new secure Syncare password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [valid, setValid] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check search params or hash for Firebase action code
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, "?"));
    const rawCode = urlParams.get("oobCode") || hashParams.get("oobCode");

    // Strict validation of reset token format
    if (rawCode && /^[a-zA-Z0-9_-]{10,250}$/.test(rawCode)) {
      setOobCode(rawCode);
      verifyPasswordResetCode(auth, rawCode)
        .then((userEmail) => {
          setEmail(userEmail);
          setValid(true);
        })
        .catch((err) => {
          console.warn("Invalid or expired password reset code:", err);
          setValid(false);
        });
    } else {
      setValid(false);
    }
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }

    if (!oobCode) {
      setError("Reset link code is invalid or missing.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      navigate({ to: "/auth" });
    } catch (err: any) {
      setError(err?.message ? String(err.message).replace(/^Firebase:\s*/, "") : "Failed to reset password.");
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card">
        <h1 className="font-display text-2xl font-semibold">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {email ? `Resetting password for ${email}.` : "Use at least eight characters you don’t use elsewhere."}
        </p>
        {valid ? (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                name="password"
                type="password"
                minLength={8}
                maxLength={128}
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full tactile-btn" disabled={submitting}>
              {submitting ? "Updating…" : "Update password"}
            </Button>
          </form>
        ) : (
          <div className="mt-6">
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              This reset link is invalid or has expired.
            </p>
            <Button asChild variant="outline" className="mt-4 w-full tactile-btn">
              <Link to="/auth">Request a new link</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}