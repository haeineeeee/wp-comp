import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { WordPressClient } from "@/integrations/wordpress";
import type { WPPost } from "@/integrations/wordpress";
import { GoogleSyncService } from "@/services/google-sync.service";
import type { SyncStepResult } from "@/integrations/google";

interface SyncResult {
  siteId: string;
  status: "success" | "partial" | "error";
  postsCreated: number;
  postsUpdated: number;
  postsRemoved: number;
  error?: string;
}

interface FullSyncResult {
  siteId: string;
  status: "success" | "partial" | "error";
  steps: {
    posts: SyncResult;
    gsc: SyncStepResult;
    ga4: SyncStepResult;
    adsense: SyncStepResult;
  };
}

/** 100-500ms 랜덤 jitter */
function jitter(): Promise<void> {
  return new Promise((r) => setTimeout(r, 100 + Math.random() * 400));
}

export class SyncService {
  /** 단일 사이트 글 동기화 */
  static async syncPosts(siteId: string, userId: string): Promise<SyncResult> {
    // 사이트 조회 + 소유권 확인
    const site = await prisma.wordPressSite.findFirst({
      where: { id: siteId, userId },
    });
    if (!site) {
      return {
        siteId,
        status: "error",
        postsCreated: 0,
        postsUpdated: 0,
        postsRemoved: 0,
        error: "사이트를 찾을 수 없습니다",
      };
    }

    // SyncLog 생성
    const syncLog = await prisma.syncLog.create({
      data: { siteId, syncType: "manual", status: "running" },
    });

    try {
      // 자격 증명 복호화 + WP 클라이언트 생성
      const { username, appPassword } = JSON.parse(decrypt(site.apiKey));
      const client = new WordPressClient(site.url, username, appPassword);

      // WP에서 전체 글 수집
      const allPosts = await this.fetchAllPosts(client);

      // DB 기존 글 ID 조회
      const existingPosts = await prisma.postCache.findMany({
        where: { siteId },
        select: { id: true, wpPostId: true },
      });
      const existingMap = new Map(
        existingPosts.map((p) => [p.wpPostId, p.id])
      );

      let postsCreated = 0;
      let postsUpdated = 0;

      // Upsert 처리
      for (const post of allPosts) {
        const data = {
          title: post.title.rendered,
          slug: post.slug,
          status: post.status,
          publishedAt: post.date ? new Date(post.date) : null,
        };

        if (existingMap.has(post.id)) {
          await prisma.postCache.update({
            where: { siteId_wpPostId: { siteId, wpPostId: post.id } },
            data,
          });
          postsUpdated++;
          existingMap.delete(post.id);
        } else {
          await prisma.postCache.create({
            data: { siteId, wpPostId: post.id, ...data },
          });
          postsCreated++;
        }
      }

      // WP에서 삭제된 글 제거 (existingMap에 남은 것들)
      const removedIds = Array.from(existingMap.values());
      let postsRemoved = 0;
      if (removedIds.length > 0) {
        const { count } = await prisma.postCache.deleteMany({
          where: { id: { in: removedIds } },
        });
        postsRemoved = count;
      }

      // SyncLog, lastSyncAt 업데이트
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: { status: "success", completedAt: new Date() },
      });
      await prisma.wordPressSite.update({
        where: { id: siteId },
        data: { lastSyncAt: new Date() },
      });

      return {
        siteId,
        status: "success",
        postsCreated,
        postsUpdated,
        postsRemoved,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";

      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "error",
          completedAt: new Date(),
          errorMessage,
        },
      });
      await prisma.wordPressSite.update({
        where: { id: siteId },
        data: { status: "error" },
      });

      return {
        siteId,
        status: "error",
        postsCreated: 0,
        postsUpdated: 0,
        postsRemoved: 0,
        error: errorMessage,
      };
    }
  }

  /** 전체 동기화: WP 글 + GSC + GA4 + AdSense */
  static async syncFull(
    siteId: string,
    userId: string
  ): Promise<FullSyncResult> {
    // WP 글 동기화
    const posts = await this.syncPosts(siteId, userId);

    await jitter();

    // Google API 동기화 (각 단계 사이 jitter)
    const gsc = await GoogleSyncService.syncSearchConsole(siteId, userId);
    await jitter();
    const ga4 = await GoogleSyncService.syncGA4(siteId, userId);
    await jitter();
    const adsense = await GoogleSyncService.syncAdSense(siteId, userId);

    // 상태 결정: 모두 성공/skipped → success, 부분 실패 → partial, 전부 실패 → error
    const stepStatuses = [posts.status, gsc.status, ga4.status, adsense.status];
    const hasError = stepStatuses.includes("error");
    const hasSuccess =
      stepStatuses.includes("success") ||
      posts.status === "success";

    let status: "success" | "partial" | "error" = "success";
    if (hasError && hasSuccess) status = "partial";
    else if (hasError && !hasSuccess) status = "error";

    return { siteId, status, steps: { posts, gsc, ga4, adsense } };
  }

  /** 사용자의 모든 사이트 전체 동기화 */
  static async syncAllSites(userId: string): Promise<FullSyncResult[]> {
    const sites = await prisma.wordPressSite.findMany({
      where: { userId, status: "active" },
      select: { id: true },
    });

    const results: FullSyncResult[] = [];
    for (const site of sites) {
      const result = await this.syncFull(site.id, userId);
      results.push(result);
    }
    return results;
  }

  /** WP API에서 전체 글을 페이지네이션으로 수집 */
  private static async fetchAllPosts(
    client: WordPressClient
  ): Promise<WPPost[]> {
    const allPosts: WPPost[] = [];
    let page = 1;

    while (true) {
      const { posts, totalPages } = await client.getPosts({
        page,
        per_page: 100,
      });
      allPosts.push(...posts);

      if (page >= totalPages) break;
      page++;
    }

    return allPosts;
  }
}
