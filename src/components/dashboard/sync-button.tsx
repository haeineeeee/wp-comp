"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { useSites } from "@/hooks/use-sites";

export function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();
  const { data: sites } = useSites();

  async function handleSync() {
    if (!sites?.length) return;
    setSyncing(true);

    try {
      // 모든 활성 사이트 순차 동기화
      for (const site of sites) {
        await fetch(`/api/sites/${site.id}/sync`, { method: "POST" });
      }
      // 대시보드 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-chart"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      queryClient.invalidateQueries({ queryKey: ["seo"] });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing || !sites?.length}
      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950 dark:text-emerald-400"
    >
      {syncing ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <RefreshCw className="h-3 w-3" />
      )}
      {syncing ? "동기화 중..." : "Sync Now"}
    </button>
  );
}
