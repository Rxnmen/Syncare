import type { Metric } from "@/lib/mock-data";
import { Interactive3DCard } from "@/components/ui/interactive-3d-card";

const toneStyles = {
  blue: "bg-info-soft text-info border border-info/20 shadow-[0_2px_12px_-2px_color-mix(in_oklab,var(--info)_25%,transparent)]",
  green: "bg-success-soft text-success border border-success/20 shadow-[0_2px_12px_-2px_color-mix(in_oklab,var(--success)_25%,transparent)]",
  yellow: "bg-warning-soft text-warning-foreground border border-warning/20 shadow-[0_2px_12px_-2px_color-mix(in_oklab,var(--warning)_25%,transparent)]",
  coral: "bg-coral-soft text-coral border border-coral/20 shadow-[0_2px_12px_-2px_color-mix(in_oklab,var(--coral)_25%,transparent)]",
};

const barStyles = {
  blue: "bg-gradient-to-r from-info/80 to-info shadow-[0_0_8px_color-mix(in_oklab,var(--info)_60%,transparent)]",
  green: "bg-gradient-to-r from-success/80 to-success shadow-[0_0_8px_color-mix(in_oklab,var(--success)_60%,transparent)]",
  yellow: "bg-gradient-to-r from-warning/80 to-warning shadow-[0_0_8px_color-mix(in_oklab,var(--warning)_60%,transparent)]",
  coral: "bg-gradient-to-r from-coral/80 to-coral shadow-[0_0_8px_color-mix(in_oklab,var(--coral)_60%,transparent)]",
};

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Interactive3DCard maxTilt={3} className="h-full rounded-2xl">
      <article className="metric-card group preserve-3d flex h-full flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <span
              className={`grid size-10 place-items-center rounded-xl transition-all duration-300 group-hover:translate-z-20 group-hover:scale-105 ${toneStyles[metric.tone]}`}
            >
              <metric.icon className="size-5" />
            </span>
            <span className="translate-z-10 rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground backdrop-blur-xs transition-transform duration-300 group-hover:translate-z-15">
              {metric.trend}
            </span>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-transform duration-300 group-hover:translate-z-10">
            {metric.label}
          </p>

          <div className="mt-1 flex items-baseline justify-between gap-2">
            <strong className="tnum font-display text-3xl font-bold tracking-tight text-foreground transition-transform duration-300 group-hover:translate-z-20">
              {metric.value}
            </strong>
            <span className="text-xs font-medium text-muted-foreground transition-transform duration-300 group-hover:translate-z-10">
              {metric.target}
            </span>
          </div>
        </div>

        <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-muted/60 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${barStyles[metric.tone]}`}
            style={{ width: `${metric.progress}%` }}
          />
        </div>
      </article>
    </Interactive3DCard>
  );
}