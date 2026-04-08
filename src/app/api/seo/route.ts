import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SeoService } from "@/services/seo.service";

// GET /api/seo — SEO 데이터
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId") ?? undefined;

  const [summary, timeSeries, indexing] = await Promise.all([
    SeoService.getSummary(session.user.id),
    SeoService.getTimeSeries(session.user.id, 30, siteId),
    SeoService.getIndexingOverview(session.user.id),
  ]);

  return NextResponse.json({ summary, timeSeries, indexing });
}
