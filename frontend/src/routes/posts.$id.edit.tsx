// ===== 게시글 수정 페이지 =====
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getPost, updatePost } from "../api/posts";
import type { UpdatePostInput } from "../types/post";

export const Route = createFileRoute("/posts/$id/edit")({
  component: PostEditPage,
});

function PostEditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UpdatePostInput>({
    title: "",
    content: "",
    author: "",
    stockCode: "",
    stockName: "",
  });

  // 기존 게시글 조회
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(Number(id)),
  });

  // 폼 데이터 초기화
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        author: post.author,
        stockCode: post.stockCode || "",
        stockName: post.stockName || "",
      });
    }
  }, [post]);

  // 수정 mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdatePostInput) => updatePost(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      alert("게시글이 수정되었습니다!");
      navigate({ to: "/posts/$id", params: { id } });
    },
    onError: (error) => {
      alert(`수정 실패: ${(error as Error).message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content?.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (!post) {
    return <div className="text-center py-8">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">✏️ 게시글 수정</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 작성자 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            작성자 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 주식 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">종목 코드 (선택)</label>
            <input
              type="text"
              value={formData.stockCode}
              onChange={(e) => setFormData({ ...formData, stockCode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">종목명 (선택)</label>
            <input
              type="text"
              value={formData.stockName}
              onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/posts/$id", params: { id } })}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? "수정 중..." : "수정하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
