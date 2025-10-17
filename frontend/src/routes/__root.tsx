// ===== 루트 라우트 =====
import { createRootRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              📈 주식 게시판
            </Link>
            <Link to="/posts/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              ✏️ 글쓰기
            </Link>
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
