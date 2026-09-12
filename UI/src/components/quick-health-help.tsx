import { useState } from "react";
import { HeartPulse, Loader2, Send, ShieldAlert, Sparkles, Stethoscope, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { healthHelp, type HealthTopic } from "@/lib/mock-data";
import { useWellnessStore } from "@/lib/wellness-store";

export function QuickHealthHelp() {
  const { todayLog, userCity } = useWellnessStore();
  const [selected, setSelected] = useState<HealthTopic>("Headache");
  const [customQuestion, setCustomQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);

  const content = healthHelp[selected];

  const fetchAiAdvice = async (customPrompt?: string) => {
    const promptText =
      customPrompt ||
      customQuestion.trim() ||
      `I am a university student at ${userCity || "SRM Kattankulathur"} experiencing symptoms of ${selected}. Typical contributing factors include ${content.factors}. What practical self-care steps, hydration tips, and lifestyle adjustments should I take today?`;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          context: {
            topic: selected,
            campus: userCity || "SRM Kattankulathur",
            waterLoggedMl: todayLog.water,
            sleepHours: todayLog.sleep,
            steps: todayLog.steps,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setAiResponse(data.text || "No guidance available at this time.");
      setAiModel(data.model || "llama-3.3-70b-versatile");
      setCustomQuestion("");
    } catch (err: any) {
      console.warn("AI help request error:", err);
      setAiResponse(
        "Could not contact AI service. Maintain gentle hydration, rest in a cool shaded room, and visit the Campus Triage Desk if discomfort continues."
      );
      setAiModel("Offline Safe Fallback");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="tactile-btn fixed bottom-24 right-4 z-40 size-12 rounded-full p-0 shadow-float transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_color-mix(in_oklab,var(--primary)_60%,transparent)] active:translate-y-0.5 active:scale-95 lg:bottom-7 lg:right-8 lg:h-12 lg:w-auto lg:px-5"
          size="lg"
          aria-label="Quick Health Help"
        >
          <HeartPulse className="size-5 transition-transform duration-300 hover:scale-110" />
          <span className="hidden font-semibold lg:inline">Quick Health Help</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto border-l-border bg-background p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border px-6 py-5 text-left">
          <div className="flex items-center justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="size-5" />
            </span>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X />
              </Button>
            </SheetClose>
          </div>
          <SheetTitle className="pt-3 font-display text-2xl">Quick Health Help</SheetTitle>
          <SheetDescription>
            General self-care guidance and Groq AI assistance for student wellness.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {/* Quick Concern Pills */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(healthHelp) as HealthTopic[]).map((topic) => (
              <Button
                key={topic}
                variant={selected === topic ? "default" : "outline"}
                size="sm"
                className="tactile-btn"
                onClick={() => {
                  setSelected(topic);
                  setAiResponse(null);
                }}
              >
                {topic}
              </Button>
            ))}
          </div>

          {/* Static Clinical Guidance Card */}
          <section className="card-3d p-5 rounded-2xl border border-border/80">
            <p className="text-xs font-semibold uppercase text-primary tracking-wider">Selected concern</p>
            <h3 className="mt-1 font-display text-2xl font-semibold">{selected}</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Common contributing factors</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{content.factors}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Immediate relief suggestions</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{content.tips}</p>
              </div>
            </div>
          </section>

          {/* Groq AI Interactive Assistance */}
          <section className="card-3d p-5 rounded-2xl border border-primary/30 bg-primary/5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <Sparkles className="size-4" />
                <span>Syncare Groq AI Assistant</span>
              </div>
              {aiModel && (
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  {aiModel.replace("llama-3.3-70b-versatile", "Llama 3.3 (70B)")}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Ask any student wellness or health inquiry, or generate targeted AI advice tailored to your campus telemetry.
            </p>

            <div className="flex gap-2">
              <Input
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value.slice(0, 300))}
                onKeyDown={(e) => e.key === "Enter" && fetchAiAdvice()}
                placeholder={`Ask about ${selected.toLowerCase()} or other symptoms...`}
                className="h-10 text-xs bg-card"
                disabled={aiLoading}
              />
              <Button
                size="sm"
                onClick={() => fetchAiAdvice()}
                disabled={aiLoading}
                className="tactile-btn px-3"
                aria-label="Send query"
              >
                {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>

            {!aiResponse && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAiAdvice()}
                disabled={aiLoading}
                className="tactile-btn w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Sparkles className="size-3.5" />
                {aiLoading ? "Consulting AI..." : `Get Groq AI Guidance for ${selected}`}
              </Button>
            )}

            {aiLoading && (
              <div className="py-4 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-xs font-medium">Generating student health guidance via Groq...</span>
              </div>
            )}

            {aiResponse && !aiLoading && (
              <div className="mt-3 rounded-xl border border-primary/20 bg-card p-4 space-y-2">
                <p className="text-xs font-semibold text-foreground">AI Health Guidance:</p>
                <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                  {aiResponse}
                </div>
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-primary hover:text-primary"
                    onClick={() => fetchAiAdvice()}
                  >
                    Refresh Advice
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Safety Disclaimers */}
          <div className="flex gap-3 rounded-xl bg-warning-soft p-4 text-sm shadow-xs border border-warning/20">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning-foreground" />
            <p className="leading-relaxed text-xs">
              <strong className="block font-semibold">Educational guidance only</strong>
              <span className="text-muted-foreground">
                Syncare and its AI tools provide general student self-care suggestions and do not provide medical diagnosis or treatment.
              </span>
            </p>
          </div>

          <div className="flex gap-3 rounded-xl border border-coral/25 bg-coral-soft p-4 shadow-xs">
            <Stethoscope className="mt-0.5 size-5 shrink-0 text-coral" />
            <div>
              <p className="text-xs font-semibold text-coral">Seek campus clinical support</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Visit SRM Campus Triage (Building C) or call emergency hotline 112 if symptoms are severe, worsening, or persistent.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}