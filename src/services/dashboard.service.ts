import { prisma } from "@/lib/prisma";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export class DashboardService {
  /** 종합 개요 메트릭 (전체 사이트 합산) */
  static async getOverview(userId: string) {
    const sites = await prisma.wordPressSite.findMany({
      where: { userId },
      select: { id: true },
    });
    const siteIds = sites.map((s) => s.id);
    if (siteIds.length === 0) {
      return {
        totalPageviews: 0,
        totalRevenue: 0,
        indexRate: 0,
        siteCount: 0,
        postCount: 0,
        pvChange: 0,
        revenueChange: 0,
      };
    }

    const now30 = daysAgo(30);
    const now7 = daysAgo(7);
    const prev7 = daysAgo(14);

    // 총 PV (30일)
    const pvAgg = await prisma.trafficSnapshot.aggregate({
      where: { siteId: { in: siteIds }, date: { gte: now30 } },
      _sum: { pageviews: true },
    });

    // 총 수익 (30일)
    const revAgg = await prisma.revenueSnapshot.aggregate({
      where: { siteId: { in: siteIds }, date: { gte: now30 } },
      _sum: { estimatedEarnings: true },
    });

    // 색인율
    const [indexedCount, totalPosts] = await Promise.all([
      prisma.postCache.count({
        where: { siteId: { in: siteIds }, indexingStatus: "indexed" },
      }),
      prisma.postCache.count({
        where: { siteId: { in: siteIds } },
      }),
    ]);

    // 7일 변화량 (현재 7일 vs 이전 7일)
    const [pvRecent, pvPrev] = await Promise.all([
      prisma.trafficSnapshot.aggregate({
        where: { siteId: { in: siteIds }, date: { gte: now7 } },
        _sum: { pageviews: true },
      }),
      prisma.trafficSnapshot.aggregate({
        where: {
          siteId: { in: siteIds },
          date: { gte: prev7, lt: now7 },
        },
        _sum: { pageviews: true },
      }),
    ]);

    const [revRecent, revPrev] = await Promise.all([
      prisma.revenueSnapshot.aggregate({
        where: { siteId: { in: siteIds }, date: { gte: now7 } },
        _sum: { estimatedEarnings: true },
      }),
      prisma.revenueSnapshot.aggregate({
        where: {
          siteId: { in: siteIds },
          date: { gte: prev7, lt: now7 },
        },
        _sum: { estimatedEarnings: true },
      }),
    ]);

    const pvRecentVal = pvRecent._sum.pageviews ?? 0;
    const pvPrevVal = pvPrev._sum.pageviews ?? 0;
    const revRecentVal = revRecent._sum.estimatedEarnings ?? 0;
    const revPrevVal = revPrev._sum.estimatedEarnings ?? 0;

    return {
      totalPageviews: pvAgg._sum.pageviews ?? 0,
      totalRevenue: revAgg._sum.estimatedEarnings ?? 0,
      indexRate: totalPosts > 0 ? Math.round((indexedCount / totalPosts) * 100) : 0,
      siteCount: siteIds.length,
      postCount: totalPosts,
      pvChange: pvPrevVal > 0 ? Math.round(((pvRecentVal - pvPrevVal) / pvPrevVal) * 100) : 0,
      revenueChange: revPrevVal > 0 ? Math.round(((revRecentVal - revPrevVal) / revPrevVal) * 100) : 0,
    };
  }

  /** 트래픽 트렌드 시계열 (전체 사이트 합산) */
  static async getTrafficTrend(userId: string, days = 30) {
    const siteIds = (
      await prisma.wordPressSite.findMany({
        where: { userId },
        select: { id: true },
      })
    ).map((s) => s.id);

    if (siteIds.length === 0) return [];

    const snapshots = await prisma.trafficSnapshot.findMany({
      where: { siteId: { in: siteIds }, date: { gte: daysAgo(days) } },
      orderBy: { date: "asc" },
    });

    // 날짜별 합산
    const map = new Map<string, { pageviews: number; sessions: number; organicSessions: number }>();
    for (const s of snapshots) {
      const key = s.date.toISOString().slice(0, 10);
      const prev = map.get(key) ?? { pageviews: 0, sessions: 0, organicSessions: 0 };
      prev.pageviews += s.pageviews;
      prev.sessions += s.sessions;
      prev.organicSessions += s.organicSessions;
      map.set(key, prev);
    }

    return Array.from(map.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** 수익 트렌드 시계열 */
  static async getRevenueTrend(userId: string, days = 30) {
    const siteIds = (
      await prisma.wordPressSite.findMany({
        where: { userId },
        select: { id: true },
      })
    ).map((s) => s.id);

    if (siteIds.length === 0) return [];

    const snapshots = await prisma.revenueSnapshot.findMany({
      where: { siteId: { in: siteIds }, date: { gte: daysAgo(days) } },
      orderBy: { date: "asc" },
    });

    const map = new Map<string, number>();
    for (const s of snapshots) {
      const key = s.date.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + s.estimatedEarnings);
    }

    return Array.from(map.entries())
      .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** PV 상위 글 */
  static async getTopPosts(userId: string, limit = 5) {
    return prisma.postCache.findMany({
      where: { site: { userId }, status: "publish" },
      include: { site: { select: { name: true } } },
      orderBy: { pageviews30d: "desc" },
      take: limit,
    });
  }
}
