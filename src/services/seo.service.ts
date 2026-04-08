import { prisma } from "@/lib/prisma";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export class SeoService {
  /** 검색 성과 요약 */
  static async getSummary(userId: string, days = 30) {
    const siteIds = (
      await prisma.wordPressSite.findMany({
        where: { userId },
        select: { id: true },
      })
    ).map((s) => s.id);

    if (siteIds.length === 0) {
      return { totalClicks: 0, totalImpressions: 0, avgCtr: 0, avgPosition: 0 };
    }

    const agg = await prisma.searchPerformance.aggregate({
      where: { siteId: { in: siteIds }, date: { gte: daysAgo(days) } },
      _sum: { clicks: true, impressions: true },
      _avg: { avgCtr: true, avgPosition: true },
    });

    return {
      totalClicks: agg._sum.clicks ?? 0,
      totalImpressions: agg._sum.impressions ?? 0,
      avgCtr: Math.round((agg._avg.avgCtr ?? 0) * 10000) / 100, // 소수점 2자리 %
      avgPosition: Math.round((agg._avg.avgPosition ?? 0) * 10) / 10,
    };
  }

  /** 검색 성과 시계열 */
  static async getTimeSeries(userId: string, days = 30, siteId?: string) {
    const siteIds = siteId
      ? [siteId]
      : (await prisma.wordPressSite.findMany({
          where: { userId },
          select: { id: true },
        })).map((s) => s.id);

    if (siteIds.length === 0) return [];

    const snapshots = await prisma.searchPerformance.findMany({
      where: { siteId: { in: siteIds }, date: { gte: daysAgo(days) } },
      orderBy: { date: "asc" },
    });

    const map = new Map<string, { clicks: number; impressions: number }>();
    for (const s of snapshots) {
      const key = s.date.toISOString().slice(0, 10);
      const prev = map.get(key) ?? { clicks: 0, impressions: 0 };
      prev.clicks += s.clicks;
      prev.impressions += s.impressions;
      map.set(key, prev);
    }

    return Array.from(map.entries())
      .map(([date, d]) => ({ date, ...d }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** 색인 현황 */
  static async getIndexingOverview(userId: string) {
    const siteIds = (
      await prisma.wordPressSite.findMany({
        where: { userId },
        select: { id: true },
      })
    ).map((s) => s.id);

    if (siteIds.length === 0) {
      return { indexed: 0, pending: 0, notIndexed: 0, unknown: 0, total: 0 };
    }

    const [indexed, pending, notIndexed, total] = await Promise.all([
      prisma.postCache.count({
        where: { siteId: { in: siteIds }, indexingStatus: "indexed" },
      }),
      prisma.postCache.count({
        where: { siteId: { in: siteIds }, indexingStatus: "pending" },
      }),
      prisma.postCache.count({
        where: { siteId: { in: siteIds }, indexingStatus: "not_indexed" },
      }),
      prisma.postCache.count({
        where: { siteId: { in: siteIds } },
      }),
    ]);

    return {
      indexed,
      pending,
      notIndexed,
      unknown: total - indexed - pending - notIndexed,
      total,
    };
  }
}
