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
import { getPostsPage } from "../api/posts";
import type { Post } from "../types/post";

type Page = { type: "list" } | { type: "detail"; id: number } | { type: "create" } | { type: "edit"; id: number };

interface Props {
  navigate: (page: Page) => void;
}

export default function PostListPage({ navigate }: Props) {
  // 서버 페이지네이션 상태
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading, error, isFetching } = useQuery<{
    items: Post[];
    total: number;
    page: number;
    pageSize: number;
  }>({
    queryKey: ["posts", "page", pagination.pageIndex, pagination.pageSize],
    queryFn: () => getPostsPage({ page: pagination.pageIndex + 1, pageSize: pagination.pageSize }),
    // v5: keepPreviousData 대체
    placeholderData: (previousData) => previousData,
    staleTime: 3000, // 리스트 캐시 3초
  });

  // total/pageSize 변화에 따라 pageIndex가 범위를 벗어나면 보정
  useEffect(() => {
    if (!data) return;
    const lastPageIndex = Math.max(0, Math.ceil((data.total || 0) / (data.pageSize || pagination.pageSize)) - 1);
    if (pagination.pageIndex > lastPageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: lastPageIndex }));
    }
  }, [data?.total, data?.pageSize]);
  // 정렬/검색 상태
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // 컬럼 정의
  const columns = useMemo<ColumnDef<Post>[]>(
    () => [
      {
        accessorKey: "title",
        header: () => <div className="font-semibold text-slate-700 dark:text-slate-300">제목</div>,
        cell: ({ row, getValue }) => (
          <div
            className="text-slate-800 dark:text-slate-100 font-medium line-clamp-1 cursor-pointer hover:text-slate-700 dark:hover:text-cyan-300"
            onClick={() => navigate({ type: "detail", id: row.original.id })}
            title={String(getValue() ?? "")}
          >
            {String(getValue() ?? "")}
          </div>
        ),
      },
      {
        id: "stock",
        header: () => <div className="font-semibold text-slate-700 dark:text-slate-300">종목</div>,
        accessorFn: (row) => row.stockName || row.stockCode || "",
        cell: ({ row }) =>
          row.original.stockCode ? (
            <span className="px-2.5 py-1 bg-blue-600 dark:bg-pink-600 text-white text-xs font-semibold rounded-full">
              {row.original.stockName || row.original.stockCode}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-slate-500 text-sm">-</span>
          ),
        enableSorting: false,
      },
      {
        accessorKey: "author",
        header: () => <div className="font-semibold text-slate-700 dark:text-slate-300">작성자</div>,
        cell: ({ getValue }) => <div className="text-gray-700 dark:text-slate-200">{String(getValue() ?? "")}</div>,
      },
      {
        accessorKey: "createdAt",
        header: () => <div className="font-semibold text-slate-700 dark:text-slate-300">작성일</div>,
        cell: ({ getValue }) => {
          const date = new Date(String(getValue() ?? ""));
          const formatted = isNaN(date.getTime())
            ? "-"
            : date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
          return <div className="text-gray-600 dark:text-slate-300">{formatted}</div>;
        },
        sortingFn: (a, b, colId) => {
          const da = new Date(String(a.getValue(colId) ?? ""));
          const db = new Date(String(b.getValue(colId) ?? ""));
          return (da.getTime() || 0) - (db.getTime() || 0);
        },
      },
      {
        id: "actions",
        header: () => <div className="font-semibold text-slate-700 dark:text-slate-300">액션</div>,
        cell: ({ row }) => (
          <button
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-cyan-300"
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="marble-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">로딩 중...</p>
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
          <p className="text-gray-600 mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-1">📋 게시글 목록</h1>
        <p className="text-gray-600 text-lg">주식 투자 정보와 의견을 공유해보세요</p>
      </div>

      {data && (data.total ?? 0) === 0 ? (
        <div className="marble-card p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-xl text-gray-700 font-semibold mb-2">아직 게시글이 없습니다</p>
          <p className="text-gray-500">첫 게시글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="marble-card p-0 overflow-hidden">
          {/* 상단 툴바 */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 border-b border-gray-200/60 dark:border-white/10">
            <div className="text-sm text-slate-700 dark:text-slate-300 font-semibold">총 {data?.total ?? 0}건</div>
            <div className="flex items-center gap-2">
              <input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="제목/작성자/종목 검색"
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-cyan-500/30 text-sm w-64"
              />
              {isFetching && <span className="text-xs text-gray-500 dark:text-slate-400">불러오는 중...</span>}
            </div>
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
              <thead className="bg-gray-50/60 dark:bg-slate-800/60">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sortDir = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 select-none"
                        >
                          {canSort ? (
                            <button
                              className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-100"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <span className="text-slate-400 dark:text-slate-500">
                                {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : ""}
                              </span>
                            </button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                    onClick={() => navigate({ type: "detail", id: row.original.id })}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle text-slate-800 dark:text-slate-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200/60 dark:border-white/10 text-sm">
            <div className="text-gray-600 dark:text-slate-400">
              페이지 {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1} · 총 {data?.total ?? 0}건
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5 disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                이전
              </button>
              <button
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5 disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                다음
              </button>
              <select
                className="ml-2 px-2 py-1 rounded-md border border-gray-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {[10, 20, 30, 50].map((ps) => (
                  <option key={ps} value={ps}>
                    {ps}개씩 보기
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
