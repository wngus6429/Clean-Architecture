// ===== 게시글 수정 페이지 =====
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getPost, updatePost } from "../api/posts";
import { useToastStore } from "../stores/useToastStore";
import type { UpdatePostInput } from "../types/post";

type Page = { type: "list" } | { type: "detail"; id: number } | { type: "create" } | { type: "edit"; id: number };

interface Props {
  id: number;
  navigate: (page: Page) => void;
}

export default function PostEditPage({ id, navigate }: Props) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  const [formData, setFormData] = useState<UpdatePostInput>({
    title: "",
    content: "",
    author: "",
    stockCode: "",
    stockName: "",
    sentiment: "neutral",
    positionType: "hold",
    entryPrice: undefined,
    targetPrice: undefined,
  });

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id, { recordView: false }),
    staleTime: 60_000, // 상세 캐시 1분 (수정 페이지도 동일)
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        author: post.author,
        stockCode: post.stockCode || "",
        stockName: post.stockName || "",
        sentiment: post.sentiment,
        positionType: post.positionType,
        entryPrice: post.entryPrice ?? null,
        targetPrice: post.targetPrice ?? null,
      });
    }
  }, [post]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePostInput) => updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts", "trending"] });
      addToast("게시글이 수정되었습니다!", "success");
      navigate({ type: "detail", id });
    },
    onError: (error) => {
      addToast(`수정 실패: ${(error as Error).message}`, "error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      addToast("제목을 입력해주세요.", "warning");
      return;
    }
    if (!formData.content?.trim()) {
      addToast("내용을 입력해주세요.", "warning");
      return;
    }

    const payload: UpdatePostInput = {
      title: formData.title?.trim(),
      content: formData.content?.trim(),
      author: formData.author?.trim(),
      stockCode: formData.stockCode?.trim(),
      stockName: formData.stockName?.trim(),
      sentiment: formData.sentiment,
      positionType: formData.positionType,
      entryPrice: formData.entryPrice ?? null,
      targetPrice: formData.targetPrice ?? null,
    };

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 dark:text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-slate-800 dark:text-gray-700 font-semibold">게시글을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:bg-gradient-to-r dark:from-cyan-300 dark:via-pink-300 dark:to-cyan-200 dark:bg-clip-text dark:text-transparent mb-2">
          ✏️ 게시글 수정
        </h1>
        <p className="text-slate-600 dark:text-slate-400">내용을 수정해주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="marble-card p-8 space-y-6 content-visibility-auto">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
            제목 <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* 작성자 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
            작성자 <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* 주식 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">종목 코드 (선택)</label>
            <input
              type="text"
              value={formData.stockCode}
              onChange={(e) => setFormData({ ...formData, stockCode: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">종목명 (선택)</label>
            <input
              type="text"
              value={formData.stockName}
              onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* 투자 의견 & 포지션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">투자 의견</label>
            <select
              value={formData.sentiment ?? "neutral"}
              onChange={(e) => setFormData({ ...formData, sentiment: e.target.value as UpdatePostInput["sentiment"] })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="bullish">강세 (Bullish)</option>
              <option value="neutral">중립 (Neutral)</option>
              <option value="bearish">약세 (Bearish)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">포지션</label>
            <select
              value={formData.positionType ?? "hold"}
              onChange={(e) =>
                setFormData({ ...formData, positionType: e.target.value as UpdatePostInput["positionType"] })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="buy">매수</option>
              <option value="hold">관망</option>
              <option value="sell">매도</option>
            </select>
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">진입가 (선택)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.entryPrice ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  entryPrice:
                    e.target.value === "" || Number.isNaN(Number(e.target.value))
                      ? null
                      : Number(e.target.value),
                }))
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">목표가 (선택)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.targetPrice ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  targetPrice:
                    e.target.value === "" || Number.isNaN(Number(e.target.value))
                      ? null
                      : Number(e.target.value),
                }))
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
            내용 <span className="text-red-600">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={12}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate({ type: "detail", id })}
            className="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-300"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-8 py-3 bg-blue-600 dark:bg-gradient-to-r dark:from-pink-600 dark:to-pink-700 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? "수정 중..." : "수정하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
