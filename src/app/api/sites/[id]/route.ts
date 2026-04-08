import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SiteService } from "@/services/site.service";

// GET /api/sites/[id] — 단일 사이트 조회
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;
  const site = await SiteService.getById(session.user.id, id);

  if (!site) {
    return NextResponse.json(
      { error: "사이트를 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  return NextResponse.json({ site });
}

// PUT /api/sites/[id] — 사이트 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const result = await SiteService.update(session.user.id, id, body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, site: result.site });
}

// DELETE /api/sites/[id] — 사이트 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;
  const result = await SiteService.delete(session.user.id, id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
