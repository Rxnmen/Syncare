import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RadialGaugeProps {
  value: number; // 0 - 100
  size?: number; // size in px
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  inverted?: boolean;
  className?: string;
}

export function RadialGauge({
  value,
  size = 170,
  strokeWidth = 12,
  label = "Wellness Score",
  sublabel = "out of 100",
  inverted = false,
  className,
}: RadialGaugeProps) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    // Smooth initial count-up
    const timer = setTimeout(() => {
      setCurrentValue(value);
    }, 150);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentValue / 100) * circumference;

  const gradientId = inverted ? "gaugeGradientInverted" : "gaugeGradient";
  const glowId = inverted ? "gaugeGlowInverted" : "gaugeGlow";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-2 select-none",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg] transform will-change-transform"
      >
        <defs>
          {inverted ? (
            <>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#34d399" floodOpacity="0.6" />
              </filter>
            </>
          ) : (
            <>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="60%" stopColor="color-mix(in oklab, var(--primary) 80%, var(--coral))" />
                <stop offset="100%" stopColor="var(--coral)" />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--coral)" floodOpacity="0.4" />
              </filter>
            </>
          )}
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={inverted ? "rgba(255, 255, 255, 0.15)" : "color-mix(in oklab, var(--muted) 85%, transparent)"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Central Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span
          className={cn(
            "tnum font-display text-4xl font-bold tracking-tight md:text-5xl",
            inverted ? "text-white drop-shadow-sm" : "text-foreground"
          )}
        >
          {currentValue}
        </span>
        <span
          className={cn(
            "mt-0.5 text-[11px] font-semibold tracking-wider uppercase",
            inverted ? "text-white/75" : "text-muted-foreground"
          )}
        >
          {sublabel}
        </span>
      </div>
    </div>
  );
}
