import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SiteService } from "@/services/site.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Settings } from "lucide-react";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const site = await SiteService.getById(session.user.id, id);

  if (!site) redirect("/dashboard");

  const googleConnections = [
    { label: "Search Console", connected: !!site.gscProperty },
    { label: "Analytics 4", connected: !!site.ga4PropertyId },
    { label: "AdSense", connected: !!site.adsenseAccountId },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{site.name}</h1>
        <Badge variant={site.status === "active" ? "default" : "secondary"}>
          {site.status === "active" ? "활성" : site.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">사이트 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">URL</span>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              {site.url}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">마지막 동기화</span>
            <span>
              {site.lastSyncAt
                ? new Date(site.lastSyncAt).toLocaleString("ko-KR")
                : "아직 동기화하지 않음"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">등록일</span>
            <span>{new Date(site.createdAt).toLocaleDateString("ko-KR")}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Google 연결</CardTitle>
          <Link
            href={`/sites/${id}/settings`}
            className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
          >
            <Settings className="h-3.5 w-3.5" />
            설정
          </Link>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {googleConnections.map((conn) => (
            <div key={conn.label} className="flex justify-between">
              <span className="text-muted-foreground">{conn.label}</span>
              <Badge variant={conn.connected ? "default" : "outline"}>
                {conn.connected ? "연결됨" : "미연결"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
