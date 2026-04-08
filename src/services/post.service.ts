import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface PostListParams {
  siteId?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export class PostService {
  /** 글 목록 조회 (서버사이드 필터/정렬/페이지네이션) */
  static async list(userId: string, params: PostListParams = {}) {
    const {
      siteId,
      status,
      search,
      sortBy = "publishedAt",
      sortOrder = "desc",
      page = 1,
      pageSize = 20,
    } = params;

    const where: Prisma.PostCacheWhereInput = {
      site: { userId },
      ...(siteId && { siteId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const allowedSortFields = [
      "title",
      "publishedAt",
      "pageviews30d",
      "clicks30d",
      "avgPosition",
      "status",
    ];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : "publishedAt";

    const [posts, total] = await Promise.all([
      prisma.postCache.findMany({
        where,
        include: {
          site: { select: { id: true, name: true, url: true } },
        },
        orderBy: { [orderField]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.postCache.count({ where }),
    ]);

    return { posts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
