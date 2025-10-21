import type { TrendingStock } from "../types/post";

interface TrendingStocksPanelProps {
  data?: TrendingStock[];
  isLoading: boolean;
  error?: Error | null;
  onSelectStock?: (stockCode: string) => void;
  selectedStock?: string | null;
}

function formatPrice(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "-";
  }
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

export function TrendingStocksPanel({
  data,
  isLoading,
  error,
  onSelectStock,
  selectedStock,
}: TrendingStocksPanelProps) {
  return (
    <div className="marble-card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111827]/60">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">📊 트렌딩 종목</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">최근 7일 동안 게시글이 활발한 종목</p>
        </div>
        {selectedStock && (
          <button
            onClick={() => onSelectStock?.(selectedStock!)}
            className="text-xs text-blue-600 dark:text-cyan-300 hover:underline"
          >
            필터 해제
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-sm text-red-600 dark:text-red-400">트렌딩 데이터를 불러오지 못했습니다.</div>
      ) : data && data.length > 0 ? (
        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {data.map((item) => {
            const bullishRatio = item.postCount ? Math.round((item.bullishCount / item.postCount) * 100) : 0;
            const bearishRatio = item.postCount ? Math.round((item.bearishCount / item.postCount) * 100) : 0;
            const isSelected = selectedStock === item.stockCode;
            return (
              <button
                key={item.stockCode}
                type="button"
                onClick={() => onSelectStock?.(item.stockCode)}
                className={`w-full text-left px-4 py-4 transition-colors ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : "hover:bg-slate-100/70 dark:hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-semibold text-slate-900 dark:text-white">
                        {item.stockName || item.stockCode}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{item.stockCode}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      최근 게시글 {item.postCount}건 · 평균 목표가 {formatPrice(item.avgTargetPrice)}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    강세 {bullishRatio}% · 약세 {bearishRatio}%
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
                    style={{
                      width: `${Math.min(100, Math.max(10, bullishRatio + 10))}%`,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>강세 {item.bullishCount} · 중립 {item.neutralCount} · 약세 {item.bearishCount}</span>
                  <span>
                    {new Date(item.lastPostedAt).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    기준
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">표시할 트렌딩 종목이 없습니다.</div>
      )}
    </div>
  );
}
