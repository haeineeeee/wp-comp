import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SiteService } from "@/services/site.service";

// POST /api/sites/test — WP 연결 테스트
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { url, wpUsername, appPassword } = await req.json();

  if (!url || !wpUsername || !appPassword) {
    return NextResponse.json(
      { error: "URL, 사용자명, 앱 비밀번호를 모두 입력해주세요" },
      { status: 400 }
    );
  }

  const result = await SiteService.testConnection(url, wpUsername, appPassword);
  return NextResponse.json(result);
}
