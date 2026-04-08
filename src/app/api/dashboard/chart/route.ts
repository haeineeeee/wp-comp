import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DashboardService } from "@/services/dashboard.service";

// GET /api/dashboard/chart — 차트 시계열 데이터
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const days = Number(new URL(req.url).searchParams.get("days") ?? 30);

  const [traffic, revenue] = await Promise.all([
    DashboardService.getTrafficTrend(session.user.id, days),
    DashboardService.getRevenueTrend(session.user.id, days),
  ]);

  return NextResponse.json({ traffic, revenue });
}
