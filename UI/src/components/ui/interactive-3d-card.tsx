import React, { useRef, useState, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Interactive3DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  maxTilt?: number; // maximum tilt angle in degrees, defaults to 3.5 for minimalism
  specular?: boolean; // whether to show subtle dynamic light reflection
  depth?: boolean; // enable preserve-3d for child layer separation
}

export function Interactive3DCard({
  children,
  className,
  maxTilt = 3.5,
  specular = true,
  depth = true,
  ...props
}: Interactive3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.012, 1.012, 1.012)`);
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.18 });
  }, [maxTilt]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlarePosition(prev => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative transition-transform duration-300 ease-out will-change-transform",
        depth && "preserve-3d",
        className
      )}
      style={{
        transform: transformStyle,
        transition: isHovered
          ? "transform 80ms ease-out, box-shadow 250ms ease"
          : "transform 450ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 450ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
      {...props}
    >
      {children}
      {specular && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.28), transparent 60%)`,
          }}
        />
      )}
    </div>
  );
}
