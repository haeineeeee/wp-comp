import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SyncService } from "@/services/sync.service";

// POST /api/cron/sync — 크론 배치 동기화 (CRON_SECRET 인증)
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 모든 활성 사이트 조회
  const sites = await prisma.wordPressSite.findMany({
    where: { status: "active" },
    select: { id: true, userId: true },
  });

  let synced = 0;
  let errors = 0;
  const results = [];

  for (const site of sites) {
    const result = await SyncService.syncFull(site.id, site.userId);
    results.push(result);

    if (result.status === "error") errors++;
    else synced++;
  }

  return NextResponse.json({
    success: true,
    total: sites.length,
    synced,
    errors,
    results,
  });
}
