import { Card } from "@/components/ui/card";

const metrics = [
  { label: "Pageviews", value: "—", change: null },
  { label: "Revenue", value: "—", change: null },
  { label: "Index Rate", value: "—", change: null },
  { label: "Sites", value: "0", change: null },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{metric.value}</p>
            {metric.change !== null && (
              <p className="mt-1 text-xs text-muted-foreground">{metric.change}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Empty state */}
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
          <span className="text-xl">🌐</span>
        </div>
        <h2 className="mt-4 text-base font-semibold">사이트를 추가해주세요</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          워드프레스 사이트를 연결하면 트래픽, 수익, SEO 데이터를 한 곳에서 확인할 수 있습니다.
        </p>
        <a
          href="/sites/new"
          className="mt-4 inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + 사이트 추가
        </a>
      </Card>
    </div>
  );
}
