import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SyncService } from "@/services/sync.service";

// POST /api/sites/[id]/sync — 전체 동기화 (WP + Google)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;
  const result = await SyncService.syncFull(id, session.user.id);

  if (result.status === "error") {
    return NextResponse.json(
      { error: "동기화에 실패했습니다", result },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, result });
}
