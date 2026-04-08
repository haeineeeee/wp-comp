import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { RevenueService } from "@/services/revenue.service";

// GET /api/revenue — 수익 데이터
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? 30);
  const siteId = searchParams.get("siteId") ?? undefined;

  const [summary, timeSeries] = await Promise.all([
    RevenueService.getSummary(session.user.id, days),
    RevenueService.getTimeSeries(session.user.id, days, siteId),
  ]);

  return NextResponse.json({ summary, timeSeries });
}
