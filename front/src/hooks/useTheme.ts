import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(): Theme | null {
  try {
    const v = getStorage()?.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" || v === "system" ? v : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme): "light" | "dark" {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;
  root.classList.remove("theme-light");
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
    root.classList.add("theme-light");
  }
  (root.style as any).colorScheme = resolved;
  return resolved;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? "system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => applyTheme(readStoredTheme() ?? "system"));

  useEffect(() => {
    try {
      getStorage()?.setItem(STORAGE_KEY, theme);
    } catch {}
    setResolvedTheme(applyTheme(theme));

    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => setResolvedTheme(applyTheme("system"));
      if (mql.addEventListener) mql.addEventListener("change", onChange);
      else mql.addListener(onChange);
      return () => {
        if (mql.removeEventListener) mql.removeEventListener("change", onChange);
        else mql.removeListener(onChange);
      };
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, resolvedTheme, toggle };
}
