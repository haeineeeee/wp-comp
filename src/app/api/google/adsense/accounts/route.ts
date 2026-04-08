import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleAuthManager, AdSenseClient } from "@/integrations/google";

// GET /api/google/adsense/accounts — AdSense 계정 목록
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  try {
    const token = await GoogleAuthManager.getAccessToken(session.user.id);
    const client = new AdSenseClient(token);
    const response = await client.listAccounts();

    return NextResponse.json({
      accounts: (response.accounts ?? []).map((a) => ({
        accountId: a.name,
        displayName: a.displayName,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "AdSense 계정 조회 실패",
      },
      { status: 500 }
    );
  }
}
