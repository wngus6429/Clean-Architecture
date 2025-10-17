// ===== 게시글 수정 페이지 =====
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getPost, updatePost } from "../api/posts";
import type { UpdatePostInput } from "../types/post";

type Page = { type: "list" } | { type: "detail"; id: number } | { type: "create" } | { type: "edit"; id: number };

interface Props {
  id: number;
  navigate: (page: Page) => void;
}

export default function PostEditPage({ id, navigate }: Props) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UpdatePostInput>({
    title: "",
    content: "",
    author: "",
    stockCode: "",
    stockName: "",
  });

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id),
  });

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

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePostInput) => updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      alert("게시글이 수정되었습니다!");
      navigate({ type: "detail", id });
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
    return (
      <div className="flex justify-center items-center py-20">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-700 font-semibold">게시글을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 bg-clip-text text-transparent mb-2">
          ✏️ 게시글 수정
        </h1>
        <p className="text-gray-600">내용을 수정해주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="marble-card p-8 space-y-6 content-visibility-auto">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/70"
          />
        </div>

        {/* 작성자 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            작성자 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/70"
          />
        </div>

        {/* 주식 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">종목 코드 (선택)</label>
            <input
              type="text"
              value={formData.stockCode}
              onChange={(e) => setFormData({ ...formData, stockCode: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/70"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">종목명 (선택)</label>
            <input
              type="text"
              value={formData.stockName}
              onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/70"
            />
          </div>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={12}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/70 resize-none"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate({ type: "detail", id })}
            className="px-6 py-3 bg-white/80 border border-white/20 text-gray-700 font-semibold rounded-xl hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {updateMutation.isPending ? "수정 중..." : "수정하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
