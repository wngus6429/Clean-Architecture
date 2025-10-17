// ===== 메인 앱 컴포넌트 =====
// 간단한 라우팅 시스템 구현 (TanStack Router 대신 수동 라우팅)

import { useState, useEffect } from "react";
import PostListPage from "./pages/PostListPage.tsx";
import PostDetailPage from "./pages/PostDetailPage.tsx";
import PostCreatePage from "./pages/PostCreatePage.tsx";
import PostEditPage from "./pages/PostEditPage.tsx";

// 현재 페이지 타입
type Page = { type: "list" } | { type: "detail"; id: number } | { type: "create" } | { type: "edit"; id: number };

function App() {
  // 현재 페이지 상태
  const [currentPage, setCurrentPage] = useState<Page>({ type: "list" });

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
    <div className="min-h-screen relative">
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
                <h1 className="text-2xl font-bold text-slate-800">주식 게시판</h1>
                <p className="text-xs text-gray-500">Stock Discussion Board</p>
              </div>
            </button>

            <button
              onClick={() => navigate({ type: "create" })}
              className="px-6 py-3 bg-gradient-to-br from-slate-700 to-slate-900 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-150"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">✏️</span>
                <span>글쓰기</span>
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-6 content-visibility-auto">{content}</main>
    </div>
  );
}

export default App;
