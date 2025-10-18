// ===== 게시글 상세 페이지 =====
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPost, deletePost } from "../api/posts";
import { useToastStore } from "../stores/useToastStore";

type Page = { type: "list" } | { type: "detail"; id: number } | { type: "create" } | { type: "edit"; id: number };

interface Props {
  id: number;
  navigate: (page: Page) => void;
}

export default function PostDetailPage({ id, navigate }: Props) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id),
    staleTime: 60_000, // 상세 캐시 1분
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      addToast("게시글이 삭제되었습니다.", "success");
      navigate({ type: "list" });
    },
    onError: (error) => {
      addToast(`삭제 실패: ${(error as Error).message}`, "error");
    },
  });

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      deleteMutation.mutate();
    }
  };

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

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="marble-card p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-700 font-semibold">게시글을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 상세 내용 카드 */}
      <div className="marble-card p-8 mb-6">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 flex-1 mr-4">{post.title}</h1>
          {post.stockCode && (
            <span className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-full whitespace-nowrap dark:bg-pink-600">
              {post.stockName || post.stockCode}
            </span>
          )}
        </div>

        {/* 메타 정보 */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-slate-400 mb-8 pb-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <span className="font-semibold dark:text-slate-200">{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <span>
              작성:{" "}
              {new Date(post.createdAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {post.updatedAt !== post.createdAt && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">✏️</span>
              <span>
                수정:{" "}
                {new Date(post.updatedAt).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {/* 내용 */}
        <div className="prose max-w-none">
          <p className="text-gray-700 dark:text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-between items-center gap-4">
        <button
          onClick={() => navigate({ type: "list" })}
          className="px-6 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/15 text-gray-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5"
        >
          ← 목록으로
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate({ type: "edit", id })}
            className="px-6 py-3 bg-blue-600 dark:bg-pink-600 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-pink-700"
          >
            ✏️ 수정
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
