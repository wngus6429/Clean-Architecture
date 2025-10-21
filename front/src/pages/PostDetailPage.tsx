// ===== 게시글 상세 페이지 =====
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getPost, deletePost, likePost, unlikePost } from "../api/posts";
import { useToastStore } from "../stores/useToastStore";
import { SentimentBadge } from "../components/SentimentBadge";
import { PositionBadge } from "../components/PositionBadge";

type Page = { type: "list" } | { type: "detail"; id: number } | { type: "create" } | { type: "edit"; id: number };

interface Props {
  id: number;
  navigate: (page: Page) => void;
}

const LIKED_STORAGE_KEY = "stock-board-liked-posts";

function readLikedIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LIKED_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function writeLikedIds(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // ignore storage errors (private mode 등)
  }
}

export default function PostDetailPage({ id, navigate }: Props) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const [isLiked, setIsLiked] = useState(() => readLikedIds().includes(id));

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id),
    staleTime: 60_000, // 상세 캐시 1분
  });

  useEffect(() => {
    setIsLiked(readLikedIds().includes(id));
  }, [id]);

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "trending"] });
      addToast("게시글이 삭제되었습니다.", "success");
      navigate({ type: "list" });
    },
    onError: (err) => {
      addToast(`삭제 실패: ${(err as Error).message}`, "error");
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => likePost(id),
    onSuccess: (updatedPost) => {
      setIsLiked(true);
      writeLikedIds([...readLikedIds(), id]);
      queryClient.setQueryData(["post", id], updatedPost);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      addToast("공감했어요!", "success");
    },
    onError: (err) => {
      addToast(`공감 실패: ${(err as Error).message}`, "error");
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikePost(id),
    onSuccess: (updatedPost) => {
      setIsLiked(false);
      writeLikedIds(readLikedIds().filter((storedId) => storedId !== id));
      queryClient.setQueryData(["post", id], updatedPost);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      addToast("공감을 취소했습니다.", "info");
    },
    onError: (err) => {
      addToast(`취소 실패: ${(err as Error).message}`, "error");
    },
  });

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      deleteMutation.mutate();
    }
  };

  const handleToggleLike = () => {
    if (!post) return;
    if (isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const isMutatingLike = likeMutation.isPending || unlikeMutation.isPending;

  const priceSummary = useMemo(() => {
    if (!post) return null;
    const entry = post.entryPrice ?? null;
    const target = post.targetPrice ?? null;
    if (entry === null && target === null) return null;

    const diff =
      entry !== null && target !== null ? target - entry : null;
    const diffLabel =
      diff !== null
        ? `${diff >= 0 ? "+" : ""}${Math.round(diff).toLocaleString("ko-KR")}원`
        : null;

    return {
      entry,
      target,
      diff,
      diffLabel,
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="marble-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 dark:text-gray-600 font-medium">로딩 중...</p>
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
          <p className="text-slate-600 dark:text-gray-600 mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="marble-card p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-slate-800 dark:text-gray-700 font-semibold">게시글을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 상세 내용 카드 */}
      <div className="marble-card p-8">
        {/* 헤더 */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{post.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {post.stockCode && (
                <span className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-full whitespace-nowrap dark:bg-pink-600">
                  {post.stockName || post.stockCode}
                </span>
              )}
              <SentimentBadge sentiment={post.sentiment} />
              <PositionBadge position={post.positionType} />
            </div>
          </div>

          <button
            onClick={handleToggleLike}
            disabled={isMutatingLike}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isLiked
                ? "bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-60"
                : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            }`}
          >
            {isLiked ? "공감 취소" : "공감하기"} · {post.likeCount.toLocaleString("ko-KR")}
          </button>
        </div>

        {/* 메타 정보 */}
        <div className="flex flex-wrap gap-6 text-sm text-slate-700 dark:text-slate-400 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{post.author}</span>
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
          <div className="flex items-center gap-2">
            <span className="text-2xl">👁️</span>
            <span>조회 {post.viewCount.toLocaleString("ko-KR")}회</span>
          </div>
        </div>

        {/* 가격/통계 정보 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50/60 dark:bg-white/5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">포지션 인사이트</p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
              <li>투자 의견: <strong>{post.sentiment === "bullish" ? "강세" : post.sentiment === "bearish" ? "약세" : "중립"}</strong></li>
              <li>현재 포지션: <strong>{post.positionType === "buy" ? "매수" : post.positionType === "sell" ? "매도" : "관망"}</strong></li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50/60 dark:bg-white/5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">가격 메모</p>
            {priceSummary ? (
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>
                  진입가: <strong>{priceSummary.entry !== null ? `${Math.round(priceSummary.entry).toLocaleString("ko-KR")}원` : "-"}</strong>
                </li>
                <li>
                  목표가: <strong>{priceSummary.target !== null ? `${Math.round(priceSummary.target).toLocaleString("ko-KR")}원` : "-"}</strong>
                </li>
                {priceSummary.diffLabel && (
                  <li>
                    기대 차익:{" "}
                    <strong className={priceSummary.diff !== null && priceSummary.diff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                      {priceSummary.diffLabel}
                    </strong>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">가격 정보가 제공되지 않았습니다.</p>
            )}
          </div>
        </div>

        {/* 내용 */}
        <div className="prose max-w-none mt-8">
          <p className="text-slate-900 dark:text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <button
          onClick={() => navigate({ type: "list" })}
          className="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          ← 목록으로
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate({ type: "edit", id })}
            className="px-6 py-3 bg-blue-600 dark:bg-pink-600 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-pink-700 transition-colors"
          >
            ✏️ 수정
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🗑️ 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
