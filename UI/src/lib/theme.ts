import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const VALID_THEMES: readonly Theme[] = ["light", "dark", "system"] as const;

function sanitizeTheme(value: unknown): Theme {
  if (typeof value === "string" && (VALID_THEMES as readonly string[]).includes(value)) {
    return value as Theme;
  }
  return "system";
}

function getStoredTheme(): Theme {
  try {
    if (typeof window === "undefined" || !window.localStorage) return "system";
    const raw =
      localStorage.getItem("syncare-theme") ??
      localStorage.getItem("vitastudent-theme");
    return sanitizeTheme(raw);
  } catch {
    return "system";
  }
}

function setStoredTheme(theme: Theme): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("syncare-theme", theme);
    }
  } catch {
    // Graceful fallback for restricted storage environments
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = getStoredTheme();
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof document === "undefined") return;
    const validated = sanitizeTheme(t);
    const root = document.documentElement;
    const systemDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effectiveDark = validated === "dark" || (validated === "system" && systemDark);

    if (effectiveDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setIsDark(effectiveDark);
  };

  const setTheme = (t: Theme) => {
    const validated = sanitizeTheme(t);
    setThemeState(validated);
    setStoredTheme(validated);
    applyTheme(validated);
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
  };

  return { theme, isDark, setTheme, toggleTheme };
}
