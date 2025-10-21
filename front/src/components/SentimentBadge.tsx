import type { Sentiment } from "../types/post";

const SENTIMENT_LABEL: Record<Sentiment, string> = {
  bullish: "강세",
  neutral: "중립",
  bearish: "약세",
};

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  bullish: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/30",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-200 border border-slate-200/70 dark:border-slate-600/40",
  bearish: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-500/30",
};

interface SentimentBadgeProps {
  sentiment: Sentiment;
  className?: string;
}

export function SentimentBadge({ sentiment, className = "" }: SentimentBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${SENTIMENT_STYLES[sentiment]} ${className}`}
    >
      {sentiment === "bullish" ? "🐮" : sentiment === "bearish" ? "🐻" : "⚖️"} {SENTIMENT_LABEL[sentiment]}
    </span>
  );
}
