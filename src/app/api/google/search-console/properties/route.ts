import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleAuthManager, SearchConsoleClient } from "@/integrations/google";

// GET /api/google/search-console/properties — GSC 속성 목록
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  try {
    const token = await GoogleAuthManager.getAccessToken(session.user.id);
    const client = new SearchConsoleClient(token);
    const response = await client.getSiteList();

    return NextResponse.json({
      properties: (response.siteEntry ?? []).map((s) => ({
        siteUrl: s.siteUrl,
        permissionLevel: s.permissionLevel,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GSC 속성 조회 실패" },
      { status: 500 }
    );
  }
}
