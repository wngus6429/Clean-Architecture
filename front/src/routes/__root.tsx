// ===== 루트 라우트 =====
import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { useTheme } from "../hooks/useTheme";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { theme, resolvedTheme, toggle, setTheme } = useTheme();

  return (
    <div className="min-h-screen text-slate-900 bg-gray-50 dark:bg-[#0b0f17] dark:text-slate-100">
      {/* 헤더 */}
      <header className="bg-white shadow dark:bg-[#0f1522] dark:shadow-black/20">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-cyan-300 neon-cyan">
              📈 주식 게시판
            </Link>
            <div className="flex items-center gap-3">
              {/* 테마 토글 */}
              <button
                onClick={toggle}
                aria-label="Toggle theme"
                title={`현재 테마: ${resolvedTheme}`}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f17] hover:bg-gray-50 dark:hover:bg-white/10 transition-colors neon-ring"
              >
                {resolvedTheme === "dark" ? "🌙" : "☀️"}
              </button>
              {/* 선택 드롭다운 (옵션) */}
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="hidden sm:block px-2 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f17] text-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
              <Link
                to="/posts/new"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-pink-600 dark:hover:bg-pink-700"
              >
                ✏️ 글쓰기
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
