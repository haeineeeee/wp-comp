"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-12">
      <Card className="mx-auto max-w-md p-8 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">문제가 발생했습니다</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "예기치 못한 오류가 발생했습니다. 다시 시도해주세요."}
        </p>
        <Button onClick={reset} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
          다시 시도
        </Button>
      </Card>
    </div>
  );
}
