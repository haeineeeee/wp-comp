import { prisma } from "@/lib/prisma";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export class RevenueService {
  /** 수익 요약 (전체 + 사이트별) */
  static async getSummary(userId: string, days = 30) {
    const sites = await prisma.wordPressSite.findMany({
      where: { userId },
      select: { id: true, name: true },
    });
    const siteIds = sites.map((s) => s.id);
    if (siteIds.length === 0) return { total: 0, avgRpm: 0, bySite: [] };

    const since = daysAgo(days);

    const total = await prisma.revenueSnapshot.aggregate({
      where: { siteId: { in: siteIds }, date: { gte: since } },
      _sum: { estimatedEarnings: true },
      _avg: { rpm: true },
    });

    // 사이트별 수익
    const bySite = await Promise.all(
      sites.map(async (site) => {
        const agg = await prisma.revenueSnapshot.aggregate({
          where: { siteId: site.id, date: { gte: since } },
          _sum: { estimatedEarnings: true },
          _avg: { rpm: true },
        });
        return {
          siteId: site.id,
          siteName: site.name,
          revenue: agg._sum.estimatedEarnings ?? 0,
          avgRpm: Math.round((agg._avg.rpm ?? 0) * 100) / 100,
        };
      })
    );

    return {
      total: total._sum.estimatedEarnings ?? 0,
      avgRpm: Math.round((total._avg.rpm ?? 0) * 100) / 100,
      bySite: bySite.sort((a, b) => b.revenue - a.revenue),
    };
  }

  /** 수익 시계열 (사이트별 필터 가능) */
  static async getTimeSeries(userId: string, days = 30, siteId?: string) {
    const siteIds = siteId
      ? [siteId]
      : (await prisma.wordPressSite.findMany({
          where: { userId },
          select: { id: true },
        })).map((s) => s.id);

    if (siteIds.length === 0) return [];

    const snapshots = await prisma.revenueSnapshot.findMany({
      where: { siteId: { in: siteIds }, date: { gte: daysAgo(days) } },
      orderBy: { date: "asc" },
    });

    const map = new Map<string, { revenue: number; rpm: number; count: number }>();
    for (const s of snapshots) {
      const key = s.date.toISOString().slice(0, 10);
      const prev = map.get(key) ?? { revenue: 0, rpm: 0, count: 0 };
      prev.revenue += s.estimatedEarnings;
      prev.rpm += s.rpm;
      prev.count++;
      map.set(key, prev);
    }

    return Array.from(map.entries())
      .map(([date, d]) => ({
        date,
        revenue: Math.round(d.revenue * 100) / 100,
        rpm: d.count > 0 ? Math.round((d.rpm / d.count) * 100) / 100 : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
