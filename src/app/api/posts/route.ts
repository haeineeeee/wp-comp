import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PostService } from "@/services/post.service";

// GET /api/posts — 글 목록 (서버사이드 페이지네이션)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const result = await PostService.list(session.user.id, {
    siteId: searchParams.get("siteId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? undefined,
    page: searchParams.has("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.has("pageSize")
      ? Number(searchParams.get("pageSize"))
      : undefined,
  });

  return NextResponse.json(result);
}
