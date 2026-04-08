"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { columns, type PostRow } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface PostsResponse {
  posts: PostRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface PostTableProps {
  sites: { id: string; name: string }[];
}

export function PostTable({ sites }: PostTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading } = useQuery<PostsResponse>({
    queryKey: [
      "posts",
      pagination.pageIndex,
      pagination.pageSize,
      sortBy,
      sortOrder,
      search,
      siteFilter,
      statusFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(pagination.pageIndex + 1));
      params.set("pageSize", String(pagination.pageSize));
      if (sortBy) {
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);
      }
      if (search) params.set("search", search);
      if (siteFilter) params.set("siteId", siteFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const table = useReactTable({
    data: data?.posts ?? [],
    columns,
    pageCount: data?.totalPages ?? 0,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="제목 검색..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            className="pl-9"
          />
        </div>
        {sites.length > 1 && (
          <select
            value={siteFilter}
            onChange={(e) => {
              setSiteFilter(e.target.value);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">모든 사이트</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">모든 상태</option>
          <option value="publish">발행</option>
          <option value="draft">임시글</option>
          <option value="private">비공개</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {search || siteFilter || statusFilter
                    ? "검색 결과가 없습니다"
                    : "동기화된 글이 없습니다. 사이트를 추가하고 동기화를 실행해주세요."}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            총 {data?.total.toLocaleString()}건 중{" "}
            {pagination.pageIndex * pagination.pageSize + 1}–
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              data?.total ?? 0
            )}
            건
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="tabular-nums">
              {pagination.pageIndex + 1} / {data?.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
