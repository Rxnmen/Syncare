import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("vitastudent-theme") as Theme) || "system";
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effectiveDark = t === "dark" || (t === "system" && systemDark);

    if (effectiveDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setIsDark(effectiveDark);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("vitastudent-theme", t);
    applyTheme(t);
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
  };

  return { theme, isDark, setTheme, toggleTheme };
}
