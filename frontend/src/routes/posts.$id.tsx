// ===== 게시글 상세 페이지 =====
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPost, deletePost } from "../api/posts";

export const Route = createFileRoute("/posts/$id")({
  component: PostDetailPage,
});

function PostDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 게시글 조회
  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(Number(id)),
  });

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(Number(id)),
    onSuccess: () => {
      // 삭제 성공 시 목록 페이지로 이동
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      alert("게시글이 삭제되었습니다.");
      navigate({ to: "/" });
    },
    onError: (error) => {
      alert(`삭제 실패: ${(error as Error).message}`);
    },
  });

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">에러: {(error as Error).message}</div>;
  }

  if (!post) {
    return <div className="text-center py-8">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{post.title}</h1>
          {post.stockCode && (
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded">{post.stockName || post.stockCode}</span>
          )}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
          <span>✍️ {post.author}</span>
          <div className="space-x-4">
            <span>
              작성일:{" "}
              {new Date(post.createdAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {post.updatedAt !== post.createdAt && (
              <span>
                수정일:{" "}
                {new Date(post.updatedAt).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* 내용 */}
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={() => navigate({ to: "/" })}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          ← 목록으로
        </button>

        <div className="space-x-2">
          <button
            onClick={() => navigate({ to: "/posts/$id/edit", params: { id } })}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ✏️ 수정
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            🗑️ 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
