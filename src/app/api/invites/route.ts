import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { InviteService } from "@/services/invite.service";

// POST /api/invites — validate an invite code
export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "코드를 입력해주세요" }, { status: 400 });
  }

  const result = await InviteService.validateCode(code);
  return NextResponse.json(result);
}

// PUT /api/invites — use an invite code (requires auth)
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "코드를 입력해주세요" }, { status: 400 });
  }

  const result = await InviteService.useCode(code, session.user.id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
