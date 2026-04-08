import { prisma } from "@/lib/prisma";
import {
  GoogleAuthManager,
  SearchConsoleClient,
  GA4Client,
  AdSenseClient,
  buildPostMaps,
  matchUrlToPostId,
} from "@/integrations/google";
import type { SyncStepResult } from "@/integrations/google";

/** 30일 전 날짜를 YYYY-MM-DD로 반환 */
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Date 객체를 { year, month, day }로 변환 */
function toDateParts(dateStr: string) {
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export class GoogleSyncService {
  /** Search Console 동기화 → SearchPerformance + PostCache 메트릭 */
  static async syncSearchConsole(
    siteId: string,
    userId: string
  ): Promise<SyncStepResult> {
    const site = await prisma.wordPressSite.findFirst({
      where: { id: siteId, userId },
    });
    if (!site?.gscProperty) {
      return { type: "gsc", status: "skipped", recordsWritten: 0 };
    }

    try {
      const token = await GoogleAuthManager.getAccessToken(userId);
      const client = new SearchConsoleClient(token);
      const startDate = daysAgo(30);
      const endDate = daysAgo(1);
      let recordsWritten = 0;

      // 1) 일별 집계 → SearchPerformance
      const dailyData = await client.queryAnalytics({
        siteUrl: site.gscProperty,
        startDate,
        endDate,
        dimensions: ["date"],
      });

      for (const row of dailyData.rows ?? []) {
        const date = new Date(row.keys[0]);
        await prisma.searchPerformance.upsert({
          where: { siteId_date: { siteId, date } },
          create: {
            siteId,
            date,
            clicks: row.clicks,
            impressions: row.impressions,
            avgCtr: row.ctr,
            avgPosition: row.position,
          },
          update: {
            clicks: row.clicks,
            impressions: row.impressions,
            avgCtr: row.ctr,
            avgPosition: row.position,
          },
        });
        recordsWritten++;
      }

      // 2) 페이지별 집계 → PostCache 메트릭 업데이트
      const pageData = await client.queryAnalytics({
        siteUrl: site.gscProperty,
        startDate,
        endDate,
        dimensions: ["page"],
        rowLimit: 25000,
      });

      const posts = await prisma.postCache.findMany({
        where: { siteId },
        select: { id: true, slug: true },
      });
      const { urlMap, slugMap } = buildPostMaps(posts, site.url);

      for (const row of pageData.rows ?? []) {
        const postId = matchUrlToPostId(row.keys[0], urlMap, slugMap);
        if (postId) {
          await prisma.postCache.update({
            where: { id: postId },
            data: {
              clicks30d: row.clicks,
              impressions30d: row.impressions,
              avgPosition: row.position,
            },
          });
        }
      }

      return { type: "gsc", status: "success", recordsWritten };
    } catch (error) {
      return {
        type: "gsc",
        status: "error",
        recordsWritten: 0,
        error: error instanceof Error ? error.message : "GSC 동기화 오류",
      };
    }
  }

  /** GA4 동기화 → TrafficSnapshot + PostCache.pageviews30d */
  static async syncGA4(
    siteId: string,
    userId: string
  ): Promise<SyncStepResult> {
    const site = await prisma.wordPressSite.findFirst({
      where: { id: siteId, userId },
    });
    if (!site?.ga4PropertyId) {
      return { type: "ga4", status: "skipped", recordsWritten: 0 };
    }

    try {
      const token = await GoogleAuthManager.getAccessToken(userId);
      const client = new GA4Client(token);
      const startDate = daysAgo(30);
      const endDate = daysAgo(1);
      let recordsWritten = 0;

      // 1) 일별 트래픽 + organic 구분 → TrafficSnapshot
      const report = await client.runReport({
        propertyId: site.ga4PropertyId,
        startDate,
        endDate,
        dimensions: ["date", "sessionDefaultChannelGroup"],
        metrics: ["screenPageViews", "sessions", "totalUsers"],
      });

      // 날짜별로 집계
      const dailyMap = new Map<
        string,
        { pageviews: number; sessions: number; users: number; organicSessions: number }
      >();

      for (const row of report.rows ?? []) {
        const dateStr = row.dimensionValues[0].value; // YYYYMMDD
        const channel = row.dimensionValues[1].value;
        const pageviews = parseInt(row.metricValues[0].value, 10);
        const sessions = parseInt(row.metricValues[1].value, 10);
        const users = parseInt(row.metricValues[2].value, 10);

        const existing = dailyMap.get(dateStr) ?? {
          pageviews: 0,
          sessions: 0,
          users: 0,
          organicSessions: 0,
        };
        existing.pageviews += pageviews;
        existing.sessions += sessions;
        existing.users += users;
        if (channel === "Organic Search") {
          existing.organicSessions += sessions;
        }
        dailyMap.set(dateStr, existing);
      }

      for (const [dateStr, data] of dailyMap) {
        // YYYYMMDD → Date
        const date = new Date(
          `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
        );
        await prisma.trafficSnapshot.upsert({
          where: { siteId_date: { siteId, date } },
          create: { siteId, date, ...data },
          update: data,
        });
        recordsWritten++;
      }

      // 2) 페이지별 PV → PostCache.pageviews30d
      const pageReport = await client.runReport({
        propertyId: site.ga4PropertyId,
        startDate,
        endDate,
        dimensions: ["pagePath"],
        metrics: ["screenPageViews"],
        limit: 10000,
      });

      const posts = await prisma.postCache.findMany({
        where: { siteId },
        select: { id: true, slug: true },
      });
      const { urlMap, slugMap } = buildPostMaps(posts, site.url);

      for (const row of pageReport.rows ?? []) {
        const pagePath = row.dimensionValues[0].value;
        // pagePath는 /slug/ 형태이므로 siteUrl + pagePath로 매칭
        const fullUrl = site.url + pagePath;
        const postId = matchUrlToPostId(fullUrl, urlMap, slugMap);
        if (postId) {
          await prisma.postCache.update({
            where: { id: postId },
            data: {
              pageviews30d: parseInt(row.metricValues[0].value, 10),
            },
          });
        }
      }

      return { type: "ga4", status: "success", recordsWritten };
    } catch (error) {
      return {
        type: "ga4",
        status: "error",
        recordsWritten: 0,
        error: error instanceof Error ? error.message : "GA4 동기화 오류",
      };
    }
  }

  /** AdSense 동기화 → RevenueSnapshot */
  static async syncAdSense(
    siteId: string,
    userId: string
  ): Promise<SyncStepResult> {
    const site = await prisma.wordPressSite.findFirst({
      where: { id: siteId, userId },
    });
    if (!site?.adsenseAccountId) {
      return { type: "adsense", status: "skipped", recordsWritten: 0 };
    }

    try {
      const token = await GoogleAuthManager.getAccessToken(userId);
      const client = new AdSenseClient(token);
      let recordsWritten = 0;

      const report = await client.generateReport({
        accountId: site.adsenseAccountId,
        startDate: toDateParts(daysAgo(30)),
        endDate: toDateParts(daysAgo(1)),
      });

      for (const row of report.rows ?? []) {
        // cells: [DATE, ESTIMATED_EARNINGS, PAGE_VIEWS_RPM, COST_PER_CLICK, PAGE_VIEWS_CTR]
        const dateStr = row.cells[0].value; // YYYY-MM-DD
        const date = new Date(dateStr);

        await prisma.revenueSnapshot.upsert({
          where: { siteId_date: { siteId, date } },
          create: {
            siteId,
            date,
            estimatedEarnings: parseFloat(row.cells[1].value) || 0,
            rpm: parseFloat(row.cells[2].value) || 0,
            cpc: parseFloat(row.cells[3].value) || 0,
            ctr: parseFloat(row.cells[4].value) || 0,
          },
          update: {
            estimatedEarnings: parseFloat(row.cells[1].value) || 0,
            rpm: parseFloat(row.cells[2].value) || 0,
            cpc: parseFloat(row.cells[3].value) || 0,
            ctr: parseFloat(row.cells[4].value) || 0,
          },
        });
        recordsWritten++;
      }

      return { type: "adsense", status: "success", recordsWritten };
    } catch (error) {
      return {
        type: "adsense",
        status: "error",
        recordsWritten: 0,
        error: error instanceof Error ? error.message : "AdSense 동기화 오류",
      };
    }
  }
}
