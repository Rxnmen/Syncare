import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  direction = "up",
  distance = 18,
  ...props
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (elementRef.current) {
              observer.unobserve(elementRef.current);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const el = elementRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0) scale3d(1, 1, 1)";
    switch (direction) {
      case "up":
        return `translate3d(0, ${distance}px, 0) scale3d(0.985, 0.985, 1)`;
      case "down":
        return `translate3d(0, -${distance}px, 0) scale3d(0.985, 0.985, 1)`;
      case "left":
        return `translate3d(${distance}px, 0, 0) scale3d(0.985, 0.985, 1)`;
      case "right":
        return `translate3d(-${distance}px, 0, 0) scale3d(0.985, 0.985, 1)`;
      case "none":
      default:
        return "scale3d(0.985, 0.985, 1)";
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn("will-change-[transform,opacity]", className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 650ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 650ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
