import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DashboardService } from "@/services/dashboard.service";

// GET /api/dashboard — 종합 개요 메트릭
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const [overview, topPosts] = await Promise.all([
    DashboardService.getOverview(session.user.id),
    DashboardService.getTopPosts(session.user.id),
  ]);

  return NextResponse.json({ overview, topPosts });
}
