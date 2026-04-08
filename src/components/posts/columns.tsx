"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

interface PostRow {
  id: string;
  wpPostId: number;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  pageviews30d: number;
  clicks30d: number;
  impressions30d: number;
  avgPosition: number | null;
  indexingStatus: string;
  site: { id: string; name: string; url: string };
}

const statusLabels: Record<string, string> = {
  publish: "발행",
  draft: "임시글",
  private: "비공개",
  pending: "검토 대기",
  future: "예약",
};

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  publish: "default",
  draft: "secondary",
  private: "outline",
  pending: "secondary",
  future: "outline",
};

function SortHeader({
  column,
  children,
}: {
  column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | "asc" | "desc" };
  children: React.ReactNode;
}) {
  return (
    <button
      className="flex items-center gap-1 hover:text-foreground"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );
}

export const columns: ColumnDef<PostRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <SortHeader column={column}>제목</SortHeader>,
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <p className="truncate font-medium text-sm">{row.original.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          /{row.original.slug}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "site.name",
    header: "사이트",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.site.name}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "상태",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={statusVariants[status] ?? "secondary"}>
          {statusLabels[status] ?? status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "publishedAt",
    header: ({ column }) => <SortHeader column={column}>게시일</SortHeader>,
    cell: ({ row }) =>
      row.original.publishedAt ? (
        <span className="text-sm tabular-nums">
          {new Date(row.original.publishedAt).toLocaleDateString("ko-KR")}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "pageviews30d",
    header: ({ column }) => <SortHeader column={column}>PV 30d</SortHeader>,
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.pageviews30d.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "clicks30d",
    header: ({ column }) => <SortHeader column={column}>클릭 30d</SortHeader>,
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.clicks30d.toLocaleString()}
      </span>
    ),
  },
  {
    id: "action",
    header: "추천",
    cell: ({ row }) => {
      const { pageviews30d, clicks30d, impressions30d, indexingStatus } =
        row.original;

      // 규칙 기반 액션 추천
      if (
        pageviews30d > 100 &&
        (indexingStatus === "not_indexed" || indexingStatus === "pending")
      ) {
        return (
          <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
            색인 요청
          </Badge>
        );
      }
      if (impressions30d > 500 && clicks30d > 0 && clicks30d / impressions30d < 0.02) {
        return (
          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            제목 개선
          </Badge>
        );
      }
      if (pageviews30d === 0 && row.original.status === "publish") {
        return (
          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            홍보 필요
          </Badge>
        );
      }
      return <span className="text-xs text-muted-foreground">—</span>;
    },
  },
];

export type { PostRow };
