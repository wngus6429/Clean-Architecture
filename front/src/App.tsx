// ===== 메인 앱 컴포넌트 =====
// 간단한 라우팅 시스템 구현 (TanStack Router 대신 수동 라우팅)

import { useState, useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import { ToastContainer } from "./components/ToastContainer";
import PostListPage from "./pages/PostListPage.tsx";
import PostDetailPage from "./pages/PostDetailPage.tsx";
import PostCreatePage from "./pages/PostCreatePage.tsx";
import PostEditPage from "./pages/PostEditPage.tsx";

// 현재 페이지 타입
type Page = { type: "list" } | { type: "detail"; id: number } | { type: "create" } | { type: "edit"; id: number };

function App() {
  // 현재 페이지 상태
  const [currentPage, setCurrentPage] = useState<Page>({ type: "list" });
  const { theme, resolvedTheme, toggle, setTheme } = useTheme();

  // URL 해시로 라우팅 처리 (새로고침 시에도 유지)
  useEffect(() => {
    const hash = window.location.hash.slice(1); // # 제거

    if (hash === "" || hash === "/") {
      setCurrentPage({ type: "list" });
    } else if (hash === "/posts/new") {
      setCurrentPage({ type: "create" });
    } else if (hash.startsWith("/posts/") && hash.endsWith("/edit")) {
      const id = Number(hash.split("/")[2]);
      setCurrentPage({ type: "edit", id });
    } else if (hash.startsWith("/posts/")) {
      const id = Number(hash.split("/")[2]);
      setCurrentPage({ type: "detail", id });
    }
  }, []);

  // 페이지 변경 함수
  const navigate = (page: Page) => {
    setCurrentPage(page);

    // URL 해시 업데이트
    if (page.type === "list") {
      window.location.hash = "/";
    } else if (page.type === "create") {
      window.location.hash = "/posts/new";
    } else if (page.type === "detail") {
      window.location.hash = `/posts/${page.id}`;
    } else if (page.type === "edit") {
      window.location.hash = `/posts/${page.id}/edit`;
    }
  };

  // 페이지 렌더링
  let content;
  if (currentPage.type === "list") {
    content = <PostListPage navigate={navigate} />;
  } else if (currentPage.type === "detail") {
    content = <PostDetailPage id={currentPage.id} navigate={navigate} />;
  } else if (currentPage.type === "create") {
    content = <PostCreatePage navigate={navigate} />;
  } else if (currentPage.type === "edit") {
    content = <PostEditPage id={currentPage.id} navigate={navigate} />;
  }

  return (
    <div className="min-h-screen relative bg-slate-50 text-slate-900 dark:bg-[#0b0f17] dark:text-slate-100">
      {/* 전역 토스트 컨테이너 */}
      <ToastContainer />

      {/* 헤더 */}
      <header className="sticky top-0 z-50 marble-card mx-4 my-4">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate({ type: "list" })}
              className="group flex items-center gap-3 transition-all duration-150"
            >
              <div className="text-4xl">📈</div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-cyan-300 dark:neon-cyan">주식 게시판</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Stock Discussion Board</p>
              </div>
            </button>

            <div className="flex items-center gap-3">
              {/* 다크모드 토글 */}
              <button
                onClick={toggle}
                aria-label="Toggle theme"
                title={`현재 테마: ${resolvedTheme}`}
                className="px-3 py-2 rounded-lg border-2 border-slate-300 dark:border-white/10 bg-white dark:bg-[#0b0f17] hover:bg-slate-50 dark:hover:bg-white/10 transition-colors dark:neon-ring"
              >
                {resolvedTheme === "dark" ? "🌙" : "☀️"}
              </button>
              {/* 선택 드롭다운 (옵션) */}
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="hidden sm:block px-2 py-2 rounded-lg border-2 border-slate-300 dark:border-white/10 bg-white dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 text-sm font-medium"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>

              <button
                onClick={() => navigate({ type: "create" })}
                className="px-6 py-3 bg-blue-600 dark:bg-gradient-to-br dark:from-pink-600 dark:to-pink-700 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-150"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">✏️</span>
                  <span>글쓰기</span>
                </span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-6 content-visibility-auto">{content}</main>
    </div>
  );
}

export default App;
