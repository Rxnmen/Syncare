import React, { useState } from "react";
import {
  Activity,
  ArrowRight,
  Brain,
  Droplets,
  Dumbbell,
  Loader2,
  MoonStar,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingMetrics } from "@/lib/wellness-store";

interface OnboardingModalProps {
  open: boolean;
  userName: string;
  onSubmit: (metrics: OnboardingMetrics) => Promise<void>;
}

export function OnboardingModal({ open, userName, onSubmit }: OnboardingModalProps) {
  const [water, setWater] = useState("1000");
  const [steps, setSteps] = useState("3500");
  const [sleep, setSleep] = useState("7.0");
  const [exercise, setExercise] = useState("30");
  const [mood, setMood] = useState("Focused");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const waterNum = parseInt(water, 10);
    const stepsNum = parseInt(steps, 10);
    const sleepNum = parseFloat(sleep);
    const exerciseNum = parseInt(exercise, 10);

    if (isNaN(waterNum) || waterNum < 0) {
      setError("Please provide a valid water intake amount (e.g. 500 ml).");
      return;
    }
    if (isNaN(stepsNum) || stepsNum < 0) {
      setError("Please enter a valid step count (e.g. 3,000 steps).");
      return;
    }
    if (isNaN(sleepNum) || sleepNum < 0 || sleepNum > 24) {
      setError("Please enter realistic sleep hours (0 to 24 hrs).");
      return;
    }
    if (isNaN(exerciseNum) || exerciseNum < 0) {
      setError("Please enter valid exercise minutes.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        water: waterNum,
        steps: stepsNum,
        sleep: sleepNum,
        exercise: exerciseNum,
        mood,
      });
    } catch (err: any) {
      setError(err?.message || "Could not save baseline metrics. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-xl max-h-[90vh] overflow-y-auto border-emerald-500/30 bg-card/95 backdrop-blur-xl shadow-2xl p-6 md:p-8"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3 text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 w-fit">
            <Sparkles className="size-3.5 animate-pulse text-emerald-500" />
            <span>Initial Baseline Calibration</span>
          </div>
          <DialogTitle className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Welcome to Syncare, {userName || "Student"}!
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            To calibrate your circadian wellness score and dashboard accurately, please log your starting metrics for today.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Water Intake */}
          <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Droplets className="size-4 text-blue-500" />
                Water Intake Today (ml)
              </Label>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {(parseInt(water || "0", 10) / 1000).toFixed(1)} L
              </span>
            </div>
            <Input
              type="number"
              min="0"
              max="10000"
              required
              value={water}
              onChange={(e) => setWater(e.target.value)}
              placeholder="e.g. 1000"
              className="h-10 bg-background/80"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[500, 1000, 1500, 2000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWater(String(preset))}
                  className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                >
                  +{preset >= 1000 ? `${(preset / 1000).toFixed(1)} L` : `${preset} ml`}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Steps */}
          <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Activity className="size-4 text-emerald-500" />
                Steps Walked Today
              </Label>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {parseInt(steps || "0", 10).toLocaleString()} steps
              </span>
            </div>
            <Input
              type="number"
              min="0"
              max="100000"
              required
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="e.g. 3500"
              className="h-10 bg-background/80"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[2000, 4000, 6000, 8000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSteps(String(preset))}
                  className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Hours */}
          <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MoonStar className="size-4 text-amber-500" />
                Sleep Last Night (hours)
              </Label>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {parseFloat(sleep || "0").toFixed(1)} hrs
              </span>
            </div>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="24"
              required
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              placeholder="e.g. 7.5"
              className="h-10 bg-background/80"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[6.0, 7.0, 7.5, 8.0, 8.5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSleep(String(preset))}
                  className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                >
                  {preset} hrs
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Minutes */}
          <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Dumbbell className="size-4 text-coral" />
                Exercise & Physical Activity (minutes)
              </Label>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {parseInt(exercise || "0", 10)} mins
              </span>
            </div>
            <Input
              type="number"
              min="0"
              max="720"
              required
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              placeholder="e.g. 30"
              className="h-10 bg-background/80"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[15, 30, 45, 60].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setExercise(String(preset))}
                  className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-coral/40 hover:bg-coral-soft hover:text-coral transition-colors"
                >
                  {preset} min
                </button>
              ))}
            </div>
          </div>

          {/* Current Mood */}
          <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
            <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Brain className="size-4 text-primary" />
              Current State of Mind / Mood
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { name: "Energized", icon: "⚡" },
                { name: "Calm", icon: "🌿" },
                { name: "Focused", icon: "🎯" },
                { name: "Tired", icon: "🌙" },
              ].map((m) => {
                const isSelected = mood === m.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setMood(m.name)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "border-border/70 bg-background/80 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-center text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="tactile-btn w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/20 text-sm gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Calibrating Biometrics & Saving...
              </>
            ) : (
              <>
                Save Metrics & Enter Dashboard
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
