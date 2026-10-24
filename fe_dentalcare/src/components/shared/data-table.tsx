"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "./search-input";
import { EmptyState } from "./empty-state";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filterComponent?: React.ReactNode;
  actionButton?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  // Controlled / Server-side pagination support
  manualPagination?: boolean;
  pageCount?: number;
  currentPage?: number; // 1-indexed
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Cari data...",
  searchValue,
  onSearchChange,
  filterComponent,
  actionButton,
  emptyTitle = "Belum ada data",
  emptyDescription = "Data akan muncul di sini setelah ditambahkan.",
  emptyAction,
  className,
  manualPagination = false,
  pageCount = 1,
  currentPage = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [localSearch, setLocalSearch] = React.useState("");
  const [showColumnToggle, setShowColumnToggle] = React.useState(false);

  const search = searchValue !== undefined ? searchValue : localSearch;
  const handleSearchChange = onSearchChange || setLocalSearch;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount: Math.max(1, pageCount),
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      ...(manualPagination
        ? {
            pagination: {
              pageIndex: Math.max(0, currentPage - 1),
              pageSize: pageSize || 10,
            },
          }
        : {}),
    },
    initialState: {
      pagination: {
        pageSize: pageSize || 10,
      },
    },
  });

  const handleExportDummy = () => {
    alert("Export file PDF / Excel sedang disiapkan.");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Toolbar: Search, Filters, Column Toggle, Export, Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="w-full sm:w-72">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
          {filterComponent}
        </div>

        <div className="flex items-center gap-2 shrink-0 relative">
          {/* Column Visibility Toggle */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnToggle(!showColumnToggle)}
              className="gap-1.5 text-xs text-slate-600"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Kolom</span>
            </Button>

            {showColumnToggle && (
              <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="text-xs font-semibold px-2 py-1 text-slate-500">
                  Tampilkan Kolom
                </div>
                <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <label
                          key={column.id}
                          className="flex items-center gap-2 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={column.getIsVisible()}
                            onChange={(e) => column.toggleVisibility(!!e.target.checked)}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="capitalize">{column.id}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Export button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportDummy}
            className="gap-1.5 text-xs text-slate-600"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>

          {/* Primary Action Button */}
          {actionButton}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="h-10 px-4 py-2 align-middle select-none">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={cn("divide-y divide-slate-100 text-sm text-slate-700 dark:divide-slate-800 dark:text-slate-300 transition-opacity duration-150", isLoading && data.length > 0 && "opacity-50 pointer-events-none")}>
              {isLoading && !data.length ? (
                <tr>
                  <td colSpan={columns.length} className="h-48 text-center text-xs text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-teal-50/30 transition-colors dark:hover:bg-slate-800/40 data-[state=selected]:bg-teal-50/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle text-xs sm:text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-48 text-center">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Bar: Pagination, Row count, Size selector */}
        {(() => {
          const effectiveTotal = manualPagination && totalItems !== undefined ? totalItems : data.length;
          const effectiveCurrentPage = manualPagination ? Math.max(1, currentPage) : table.getState().pagination.pageIndex + 1;
          const effectivePageSize = manualPagination ? (pageSize || 10) : table.getState().pagination.pageSize;
          const effectivePageCount = manualPagination ? Math.max(1, pageCount) : Math.max(1, table.getPageCount() || 1);

          const startRecord = effectiveTotal === 0 ? 0 : (effectiveCurrentPage - 1) * effectivePageSize + 1;
          const endRecord = Math.min(effectiveCurrentPage * effectivePageSize, effectiveTotal);

          const canPrev = effectiveCurrentPage > 1;
          const canNext = effectiveCurrentPage < effectivePageCount;

          const handleGoPage = (p: number) => {
            const clamped = Math.max(1, Math.min(effectivePageCount, p));
            if (manualPagination) {
              onPageChange?.(clamped);
            } else {
              table.setPageIndex(clamped - 1);
            }
          };

          const handlePageSizeChange = (newSize: number) => {
            if (manualPagination) {
              onPageSizeChange?.(newSize);
            } else {
              table.setPageSize(newSize);
            }
          };

          const getPageNumbers = () => {
            const pages: (number | string)[] = [];
            if (effectivePageCount <= 5) {
              for (let i = 1; i <= effectivePageCount; i++) pages.push(i);
            } else {
              if (effectiveCurrentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", effectivePageCount);
              } else if (effectiveCurrentPage >= effectivePageCount - 2) {
                pages.push(1, "...", effectivePageCount - 3, effectivePageCount - 2, effectivePageCount - 1, effectivePageCount);
              } else {
                pages.push(1, "...", effectiveCurrentPage - 1, effectiveCurrentPage, effectiveCurrentPage + 1, "...", effectivePageCount);
              }
            }
            return pages;
          };

          if (effectiveTotal === 0 && data.length === 0) return null;

          return (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>
                  Menampilkan <strong className="text-slate-800 dark:text-slate-200">{startRecord}</strong> - <strong className="text-slate-800 dark:text-slate-200">{endRecord}</strong> dari <strong className="text-slate-800 dark:text-slate-200">{effectiveTotal}</strong> data
                </span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span>Baris:</span>
                  <select
                    value={effectivePageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:border-teal-500"
                  >
                    {[5, 10, 20, 25, 50].map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Halaman Pertama"
                  onClick={() => handleGoPage(1)}
                  disabled={!canPrev}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Halaman Sebelumnya"
                  onClick={() => handleGoPage(effectiveCurrentPage - 1)}
                  disabled={!canPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-1">
                  {getPageNumbers().map((p, idx) =>
                    typeof p === "number" ? (
                      <button
                        key={idx}
                        onClick={() => handleGoPage(p)}
                        className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-all ${
                          p === effectiveCurrentPage
                            ? "bg-teal-600 text-white shadow-xs"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={idx} className="px-1 text-slate-400">
                        {p}
                      </span>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Halaman Selanjutnya"
                  onClick={() => handleGoPage(effectiveCurrentPage + 1)}
                  disabled={!canNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Halaman Terakhir"
                  onClick={() => handleGoPage(effectivePageCount)}
                  disabled={!canNext}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

