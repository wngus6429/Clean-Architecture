// ===== 게시글 목록 페이지 (메인 페이지) =====
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "../api/posts";

export const Route = createFileRoute("/")({
  component: PostListPage,
});

function PostListPage() {
  // React Query로 데이터 가져오기
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">에러: {(error as Error).message}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📋 게시글 목록</h1>

      {/* 게시글이 없을 때 */}
      {posts && posts.length === 0 && (
        <div className="text-center py-8 text-gray-500">게시글이 없습니다. 첫 게시글을 작성해보세요!</div>
      )}

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {posts?.map((post) => (
          <Link
            key={post.id}
            to="/posts/$id"
            params={{ id: String(post.id) }}
            className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold text-gray-800">{post.title}</h2>
              {post.stockCode && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {post.stockName || post.stockCode}
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>✍️ {post.author}</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
