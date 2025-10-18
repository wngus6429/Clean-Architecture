import { useToastStore } from "../stores/useToastStore";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-md px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center justify-between gap-4 px-6 py-4 rounded-lg shadow-2xl
            backdrop-blur-sm border-2 animate-slide-down
            ${
              toast.type === "success"
                ? "bg-emerald-500/90 dark:bg-emerald-600/90 border-emerald-300 dark:border-emerald-400 text-white shadow-emerald-500/50"
                : toast.type === "error"
                ? "bg-red-500/90 dark:bg-red-600/90 border-red-300 dark:border-red-400 text-white shadow-red-500/50"
                : toast.type === "warning"
                ? "bg-amber-500/90 dark:bg-amber-600/90 border-amber-300 dark:border-amber-400 text-white shadow-amber-500/50"
                : "bg-blue-500/90 dark:bg-blue-600/90 border-blue-300 dark:border-blue-400 text-white shadow-blue-500/50"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {toast.type === "success" && "✓"}
              {toast.type === "error" && "✕"}
              {toast.type === "warning" && "⚠"}
              {toast.type === "info" && "ℹ"}
            </span>
            <p className="font-semibold text-sm">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/80 hover:text-white transition-colors text-xl font-bold leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
