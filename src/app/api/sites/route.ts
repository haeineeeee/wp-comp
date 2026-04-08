import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SiteService } from "@/services/site.service";

// GET /api/sites — 사이트 목록 조회
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const sites = await SiteService.list(session.user.id);
  return NextResponse.json({ sites });
}

// POST /api/sites — 사이트 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = await req.json();
  const { url, name, wpUsername, appPassword } = body;

  if (!url || !name || !wpUsername || !appPassword) {
    return NextResponse.json(
      { error: "모든 필드를 입력해주세요" },
      { status: 400 }
    );
  }

  const result = await SiteService.create(session.user.id, {
    url,
    name,
    wpUsername,
    appPassword,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ success: true, site: result.site }, { status: 201 });
}
