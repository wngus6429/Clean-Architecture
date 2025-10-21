// ===== 게시글 목록 페이지 (react-table 적용) =====
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState, PaginationState } from "@tanstack/react-table";
import { getPostsPage, getTrendingStocks } from "../api/posts";
import type { Post, Sentiment, PositionType } from "../types/post";
import { SentimentBadge } from "../components/SentimentBadge";
import { PositionBadge } from "../components/PositionBadge";
import { TrendingStocksPanel } from "../components/TrendingStocksPanel";

type Page = { type: "list" } | { type: "detail"; id: number } | { type: "create" } | { type: "edit"; id: number };

interface Props {
  navigate: (page: Page) => void;
}

const sentimentOptions = [
  { label: "전체 의견", value: "all" },
  { label: "강세 (Bullish)", value: "bullish" },
  { label: "중립 (Neutral)", value: "neutral" },
  { label: "약세 (Bearish)", value: "bearish" },
] as const;

const positionOptions = [
  { label: "모든 포지션", value: "all" },
  { label: "매수", value: "buy" },
  { label: "관망", value: "hold" },
  { label: "매도", value: "sell" },
] as const;

export default function PostListPage({ navigate }: Props) {
  // 서버 페이지네이션 상태
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [sentimentFilter, setSentimentFilter] = useState<(typeof sentimentOptions)[number]["value"]>("all");
  const [positionFilter, setPositionFilter] = useState<(typeof positionOptions)[number]["value"]>("all");
  const [stockFilter, setStockFilter] = useState<string | null>(null);

  const appliedSentiment = sentimentFilter === "all" ? undefined : (sentimentFilter as Sentiment);
  const appliedPosition = positionFilter === "all" ? undefined : (positionFilter as PositionType);
  const appliedStock = stockFilter ?? undefined;

  const { data, isLoading, error } = useQuery<{
    items: Post[];
    total: number;
    page: number;
    pageSize: number;
  }>({
    queryKey: [
      "posts",
      "page",
      pagination.pageIndex,
      pagination.pageSize,
      appliedSentiment ?? "all",
      appliedPosition ?? "all",
      appliedStock ?? "all",
    ],
    queryFn: () =>
      getPostsPage({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sentiment: appliedSentiment,
        positionType: appliedPosition,
        stockCode: appliedStock,
      }),
    // v5: keepPreviousData 대체
    placeholderData: (previousData) => previousData,
    staleTime: 3000, // 리스트 캐시 3초
  });

  const {
    data: trending,
    isLoading: isTrendingLoading,
    error: trendingError,
  } = useQuery({
    queryKey: ["posts", "trending"],
    queryFn: () => getTrendingStocks({ limit: 6, days: 7 }),
    staleTime: 60_000,
  });
  const trendingErrorObj = trendingError instanceof Error ? trendingError : null;

  // total/pageSize 변화에 따라 pageIndex가 범위를 벗어나면 보정
  useEffect(() => {
    if (!data) return;
    const lastPageIndex = Math.max(0, Math.ceil((data.total || 0) / (data.pageSize || pagination.pageSize)) - 1);
    if (pagination.pageIndex > lastPageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: lastPageIndex }));
    }
  }, [data, pagination.pageIndex, pagination.pageSize]);

  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [sentimentFilter, positionFilter, stockFilter]);

  // 컬럼 정의
  const columns = useMemo<ColumnDef<Post>[]>(
    () => [
      {
        accessorKey: "title",
        header: () => <div className="font-semibold text-slate-900 dark:text-slate-300">제목</div>,
        cell: ({ row, getValue }) => (
          <div
            className="text-slate-900 dark:text-slate-100 font-medium line-clamp-1 cursor-pointer hover:text-blue-700 dark:hover:text-cyan-300"
            onClick={() => navigate({ type: "detail", id: row.original.id })}
            title={String(getValue() ?? "")}
          >
            {String(getValue() ?? "")}
          </div>
        ),
      },
      {
        id: "stock",
        header: () => <div className="font-semibold text-slate-900 dark:text-slate-300">종목</div>,
        accessorFn: (row) => row.stockName || row.stockCode || "",
        cell: ({ row }) =>
          row.original.stockCode ? (
            <div className="flex flex-col gap-1">
              <span className="px-2.5 py-1 bg-blue-600 dark:bg-pink-600 text-white text-xs font-semibold rounded-full">
                {row.original.stockName || row.original.stockCode}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{row.original.stockCode}</span>
            </div>
          ) : (
            <span className="text-gray-400 dark:text-slate-500 text-sm">-</span>
          ),
        enableSorting: false,
      },
      {
        accessorKey: "sentiment",
        header: () => <div className="font-semibold text-slate-900 dark:text-slate-300">투자 의견</div>,
        cell: ({ row }) => <SentimentBadge sentiment={row.original.sentiment} />,
      },
      {
        accessorKey: "positionType",
        header: () => <div className="font-semibold text-slate-900 dark:text-slate-300">포지션</div>,
        cell: ({ row }) => <PositionBadge position={row.original.positionType} />,
      },
      {
        accessorKey: "author",
        header: () => <div className="font-semibold text-slate-900 dark:text-slate-300">작성자</div>,
        cell: ({ getValue }) => <div className="text-slate-800 dark:text-slate-200">{String(getValue() ?? "")}</div>,
      },
      {
        accessorKey: "viewCount",
        header: () => <div className="font-semibold text-slate-900 dark:text-slate-300">조회수</div>,
        cell: ({ getValue }) => (
          <div className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1">
            <span>👁️</span>
            <span>{Number(getValue() ?? 0).toLocaleString("ko-KR")}</span>
          </div>
        ),
      },
      {
        accessorKey: "likeCount",
        header: () => <div className="font-semibold text-slate-900 dark:text-slate-300">공감</div>,
        cell: ({ getValue }) => (
          <div className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1">
            <span>👍</span>
            <span>{Number(getValue() ?? 0).toLocaleString("ko-KR")}</span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: () => <div className="font-semibold text-slate-900 dark:text-slate-300">작성일</div>,
        cell: ({ getValue }) => {
          const date = new Date(String(getValue() ?? ""));
          const formatted = isNaN(date.getTime())
            ? "-"
            : date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
          return <div className="text-slate-800 dark:text-slate-300">{formatted}</div>;
        },
        sortingFn: (a, b, colId) => {
          const da = new Date(String(a.getValue(colId) ?? ""));
          const db = new Date(String(b.getValue(colId) ?? ""));
          return (da.getTime() || 0) - (db.getTime() || 0);
        },
      },
      {
        id: "actions",
        header: () => <div className="font-semibold text-slate-900 dark:text-slate-300">액션</div>,
        cell: ({ row }) => (
          <button
            className="text-sm font-semibold text-blue-600 dark:text-slate-200 hover:text-blue-800 dark:hover:text-cyan-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate({ type: "detail", id: row.original.id });
            }}
          >
            자세히 보기 →
          </button>
        ),
        enableSorting: false,
        enableGlobalFilter: false,
      },
    ],
    [navigate]
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      pagination: { pageSize: 10, pageIndex: 0 },
    },
    manualPagination: true,
    pageCount: data ? Math.ceil((data.total || 0) / (data.pageSize || 10)) : -1,
  });

  const totalViewsOnPage =
    data?.items.reduce((sum, item) => sum + (item.viewCount ?? 0), 0) ?? 0;
  const totalLikesOnPage =
    data?.items.reduce((sum, item) => sum + (item.likeCount ?? 0), 0) ?? 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="marble-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
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
          <p className="text-slate-700 dark:text-gray-600 mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-2 flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-800 mb-1">📋 게시글 목록</h1>
        <p className="text-slate-700 dark:text-gray-600 text-lg">주식 투자 정보와 의견을 공유해보세요</p>
      </div>

      <TrendingStocksPanel
        data={trending}
        isLoading={isTrendingLoading}
        error={trendingErrorObj}
        onSelectStock={(code) => setStockFilter((prev) => (prev === code ? null : code))}
        selectedStock={stockFilter}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="marble-card p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">현재 페이지 조회수</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalViewsOnPage.toLocaleString("ko-KR")}회</p>
        </div>
        <div className="marble-card p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">현재 페이지 공감 수</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalLikesOnPage.toLocaleString("ko-KR")}개</p>
        </div>
        <div className="marble-card p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">총 게시글</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{(data?.total ?? 0).toLocaleString("ko-KR")}건</p>
        </div>
      </div>

      {data && (data.total ?? 0) === 0 ? (
        <div className="marble-card p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-xl text-slate-900 dark:text-gray-700 font-semibold mb-2">아직 게시글이 없습니다</p>
          <p className="text-slate-600 dark:text-gray-500">첫 게시글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="marble-card p-0 overflow-hidden">
          {/* 상단 툴바 */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-transparent">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-900 dark:text-slate-300 font-semibold">
              <span>총 {data?.total ?? 0}건</span>
              {stockFilter && (
                <button
                  onClick={() => setStockFilter(null)}
                  className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 text-xs font-semibold hover:bg-blue-200 transition"
                >
                  {stockFilter} 필터 해제 ✕
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value as (typeof sentimentOptions)[number]["value"])}
                className="px-3 py-2 rounded-md border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              >
                {sentimentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value as (typeof positionOptions)[number]["value"])}
                className="px-3 py-2 rounded-md border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              >
                {positionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="제목/작성자/종목 검색"
                className="px-3 py-2 rounded-md border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-cyan-500/30 text-sm w-48 md:w-64"
              />

              {(sentimentFilter !== "all" || positionFilter !== "all" || stockFilter) && (
                <button
                  onClick={() => {
                    setSentimentFilter("all");
                    setPositionFilter("all");
                    setStockFilter(null);
                  }}
                  className="px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
              <thead className="bg-slate-100 dark:bg-slate-800/60">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sortDir = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 ${
                            canSort ? "cursor-pointer select-none" : ""
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              <span className="text-slate-400">
                                {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : "▴▾"}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-[#101523] divide-y divide-slate-200 dark:divide-white/5">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate({ type: "detail", id: row.original.id })}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-transparent">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              페이지 {pagination.pageIndex + 1} / {table.getPageCount() || 1}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded-md border border-slate-300 dark:border-white/10 text-sm disabled:opacity-40"
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                disabled={pagination.pageIndex === 0}
              >
                이전
              </button>
              <button
                className="px-3 py-2 rounded-md border border-slate-300 dark:border-white/10 text-sm disabled:opacity-40"
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                disabled={pagination.pageIndex + 1 >= (table.getPageCount() || 1)}
              >
                다음
              </button>
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: Number(e.target.value),
                    pageIndex: 0,
                  }))
                }
                className="px-3 py-2 rounded-md border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300"
              >
                {[10, 20, 30, 50].map((size) => (
                  <option key={size} value={size}>
                    페이지당 {size}건
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
