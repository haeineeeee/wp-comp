import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleAuthManager, GA4Client } from "@/integrations/google";

// GET /api/google/analytics/properties — GA4 속성 목록
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  try {
    const token = await GoogleAuthManager.getAccessToken(session.user.id);
    const client = new GA4Client(token);
    const response = await client.listProperties();

    const properties =
      response.accountSummaries?.flatMap(
        (account) =>
          account.propertySummaries?.map((p) => ({
            propertyId: p.property.replace("properties/", ""),
            displayName: p.displayName,
            accountName: account.displayName,
          })) ?? []
      ) ?? [];

    return NextResponse.json({ properties });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GA4 속성 조회 실패" },
      { status: 500 }
    );
  }
}
