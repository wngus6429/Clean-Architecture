import type { PositionType } from "../types/post";

const POSITION_LABEL: Record<PositionType, string> = {
  buy: "매수",
  hold: "관망",
  sell: "매도",
};

const POSITION_STYLE: Record<PositionType, string> = {
  buy: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200 border border-green-300/70 dark:border-green-500/30",
  hold: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200 border border-indigo-300/70 dark:border-indigo-500/30",
  sell: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 border border-red-300/70 dark:border-red-500/30",
};

interface PositionBadgeProps {
  position: PositionType;
  className?: string;
}

export function PositionBadge({ position, className = "" }: PositionBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${POSITION_STYLE[position]} ${className}`}
    >
      {position === "buy" ? "📈" : position === "sell" ? "📉" : "⏳"} {POSITION_LABEL[position]}
    </span>
  );
}
