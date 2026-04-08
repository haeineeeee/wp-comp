import { GoogleBaseClient } from "./base-client";
import type { AdSenseReportResponse, AdSenseAccountsResponse } from "./types";

const ADSENSE_BASE = "https://adsense.googleapis.com/v2";

export class AdSenseClient extends GoogleBaseClient {
  /** AdSense 수익 리포트 생성 */
  async generateReport(params: {
    accountId: string; // "accounts/pub-1234567890123456"
    startDate: { year: number; month: number; day: number };
    endDate: { year: number; month: number; day: number };
  }): Promise<AdSenseReportResponse> {
    const qs = new URLSearchParams();
    qs.set("dateRange", "CUSTOM");
    qs.set("startDate.year", String(params.startDate.year));
    qs.set("startDate.month", String(params.startDate.month));
    qs.set("startDate.day", String(params.startDate.day));
    qs.set("endDate.year", String(params.endDate.year));
    qs.set("endDate.month", String(params.endDate.month));
    qs.set("endDate.day", String(params.endDate.day));
    qs.append("dimensions", "DATE");
    qs.append("metrics", "ESTIMATED_EARNINGS");
    qs.append("metrics", "PAGE_VIEWS_RPM");
    qs.append("metrics", "COST_PER_CLICK");
    qs.append("metrics", "PAGE_VIEWS_CTR");

    return this.request<AdSenseReportResponse>(
      `${ADSENSE_BASE}/${params.accountId}/reports:generate?${qs.toString()}`
    );
  }

  /** 사용 가능한 AdSense 계정 목록 */
  async listAccounts(): Promise<AdSenseAccountsResponse> {
    return this.request<AdSenseAccountsResponse>(`${ADSENSE_BASE}/accounts`);
  }
}
