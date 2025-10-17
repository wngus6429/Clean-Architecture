// ===== 게시글 작성 페이지 =====
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createPost } from "../api/posts";
import type { CreatePostInput } from "../types/post";

export const Route = createFileRoute("/posts/new")({
  component: PostCreatePage,
});

function PostCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreatePostInput>({
    title: "",
    content: "",
    author: "",
    stockCode: "",
    stockName: "",
  });

  // 생성 mutation
  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      alert("게시글이 작성되었습니다!");
      navigate({ to: "/posts/$id", params: { id: String(data.id) } });
    },
    onError: (error) => {
      alert(`작성 실패: ${(error as Error).message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 항목 체크
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    if (!formData.author.trim()) {
      alert("작성자를 입력해주세요.");
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">✏️ 새 게시글 작성</h1>

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
            placeholder="게시글 제목을 입력하세요"
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
            placeholder="이름을 입력하세요"
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
              placeholder="예: 005930"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">종목명 (선택)</label>
            <input
              type="text"
              value={formData.stockName}
              onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 삼성전자"
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
            placeholder="게시글 내용을 입력하세요"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "작성 중..." : "작성하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
