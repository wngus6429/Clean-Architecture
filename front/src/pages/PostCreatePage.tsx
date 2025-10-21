// ===== 게시글 작성 페이지 =====
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createPost } from "../api/posts";
import { useToastStore } from "../stores/useToastStore";
import type { CreatePostInput } from "../types/post";

type Page = { type: "list" } | { type: "detail"; id: number } | { type: "create" } | { type: "edit"; id: number };

interface Props {
  navigate: (page: Page) => void;
}

export default function PostCreatePage({ navigate }: Props) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  const [formData, setFormData] = useState<CreatePostInput>({
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

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "trending"] });
      addToast("게시글이 작성되었습니다!", "success");
      navigate({ type: "detail", id: data.id });
    },
    onError: (error) => {
      addToast(`작성 실패: ${(error as Error).message}`, "error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      addToast("제목을 입력해주세요.", "warning");
      return;
    }
    if (!formData.content.trim()) {
      addToast("내용을 입력해주세요.", "warning");
      return;
    }
    if (!formData.author.trim()) {
      addToast("작성자를 입력해주세요.", "warning");
      return;
    }

    const payload: CreatePostInput = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      author: formData.author.trim(),
      stockCode: formData.stockCode?.trim() || undefined,
      stockName: formData.stockName?.trim() || undefined,
      sentiment: formData.sentiment,
      positionType: formData.positionType,
      entryPrice: formData.entryPrice ?? undefined,
      targetPrice: formData.targetPrice ?? undefined,
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:bg-gradient-to-r dark:from-cyan-300 dark:via-pink-300 dark:to-cyan-200 dark:bg-clip-text dark:text-transparent mb-2">
          ✏️ 새 게시글 작성
        </h1>
        <p className="text-slate-600 dark:text-slate-400">주식 투자 정보를 공유해주세요</p>
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
            placeholder="게시글 제목을 입력하세요"
          />
        </div>

        {/* 투자 의견 & 포지션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">투자 의견</label>
            <select
              value={formData.sentiment ?? "neutral"}
              onChange={(e) => setFormData({ ...formData, sentiment: e.target.value as CreatePostInput["sentiment"] })}
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
                setFormData({ ...formData, positionType: e.target.value as CreatePostInput["positionType"] })
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
                      ? undefined
                      : Number(e.target.value),
                }))
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="예: 68000"
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
                      ? undefined
                      : Number(e.target.value),
                }))
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="예: 82000"
            />
          </div>
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
            placeholder="이름을 입력하세요"
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
              placeholder="예: 005930"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">종목명 (선택)</label>
            <input
              type="text"
              value={formData.stockName}
              onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-cyan-500/20 transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="예: 삼성전자"
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
            placeholder="게시글 내용을 입력하세요"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate({ type: "list" })}
            className="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-300"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-8 py-3 bg-blue-600 dark:bg-gradient-to-r dark:from-pink-600 dark:to-pink-700 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? "작성 중..." : "작성하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
