import { useState } from "react";
import { HeartPulse, ShieldAlert, Stethoscope, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { healthHelp, type HealthTopic } from "@/lib/mock-data";

export function QuickHealthHelp() {
  const [selected, setSelected] = useState<HealthTopic>("Headache");
  const content = healthHelp[selected];
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
      <SheetHeader className="border-b border-border px-6 py-5 text-left"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><HeartPulse className="size-5" /></span><SheetClose asChild><Button variant="ghost" size="icon" aria-label="Close"><X /></Button></SheetClose></div><SheetTitle className="pt-3 font-display text-2xl">Quick Health Help</SheetTitle><SheetDescription>General self-care guidance for common student health concerns.</SheetDescription></SheetHeader>
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(healthHelp) as HealthTopic[]).map((topic) => (
            <Button
              key={topic}
              variant={selected === topic ? "default" : "outline"}
              size="sm"
              className="tactile-btn"
              onClick={() => setSelected(topic)}
            >
              {topic}
            </Button>
          ))}
        </div>
        <section className="card-3d p-5">
          <p className="text-xs font-semibold uppercase text-primary">Selected concern</p>
          <h3 className="mt-1 font-display text-2xl font-semibold">{selected}</h3>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm font-semibold">Common contributing factors</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{content.factors}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Things that may help</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{content.tips}</p>
            </div>
          </div>
        </section>
        <div className="flex gap-3 rounded-xl bg-warning-soft p-4 text-sm shadow-sm">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning-foreground" />
          <p className="leading-relaxed">
            <strong className="block">This is not a diagnosis</strong>
            <span className="text-muted-foreground">VitaStudent provides general information only and cannot replace advice from a qualified professional.</span>
          </p>
        </div>
        <div className="flex gap-3 rounded-xl border border-coral/25 bg-coral-soft p-4 shadow-sm">
          <Stethoscope className="mt-0.5 size-5 shrink-0 text-coral" />
          <div>
            <p className="text-sm font-semibold">Seek professional help</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Get medical support if symptoms are severe, worsening, persistent, or accompanied by fainting, breathing difficulty, confusion, or intense pain.
            </p>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
);
}