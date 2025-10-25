import { useTheme } from "../hooks/useTheme";

/**
 * Lightweight neon dark-mode toggle button.
 * - No external UI libs; Tailwind + minimal custom CSS
 * - Uses useTheme hook (light/dark/system) with emoji icon
 */
export function DarkModeToggle() {
  const { resolvedTheme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={resolvedTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="neon-toggle px-3 py-2 text-sm font-medium"
    >
      <span className="icon align-middle mr-1.5">{resolvedTheme === "dark" ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline align-middle">{resolvedTheme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
