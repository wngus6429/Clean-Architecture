// ===== 게시글 목록 페이지 =====
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "../api/posts";

type Page = { type: "list" } | { type: "detail"; id: number } | { type: "create" } | { type: "edit"; id: number };

interface Props {
  navigate: (page: Page) => void;
}

export default function PostListPage({ navigate }: Props) {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="marble-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="marble-card p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 font-semibold">에러가 발생했습니다</p>
          <p className="text-gray-600 mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">📋 게시글 목록</h1>
        <p className="text-gray-600 text-lg">주식 투자 정보와 의견을 공유해보세요</p>
      </div>

      {posts && posts.length === 0 && (
        <div className="marble-card p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-xl text-gray-700 font-semibold mb-2">아직 게시글이 없습니다</p>
          <p className="text-gray-500">첫 게시글을 작성해보세요!</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {posts?.map((post) => (
          <button
            key={post.id}
            onClick={() => navigate({ type: "detail", id: post.id })}
            className="marble-card p-6 text-left group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-slate-700 flex-1 mr-3">{post.title}</h2>
              {post.stockCode && (
                <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  {post.stockName || post.stockCode}
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">{post.content}</p>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-lg">👤</span>
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-lg">📅</span>
                <span>
                  {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200/50">
              <span className="text-sm text-slate-700 font-semibold flex items-center gap-1">
                자세히 보기 <span>→</span>
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
