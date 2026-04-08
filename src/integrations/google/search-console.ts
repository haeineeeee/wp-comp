import { GoogleBaseClient } from "./base-client";
import type { GSCAnalyticsResponse, GSCSiteListResponse } from "./types";

const GSC_BASE = "https://www.googleapis.com/webmasters/v3";

export class SearchConsoleClient extends GoogleBaseClient {
  /** 검색 분석 데이터 조회 */
  async queryAnalytics(params: {
    siteUrl: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;
    dimensions?: ("date" | "page" | "query")[];
    rowLimit?: number;
  }): Promise<GSCAnalyticsResponse> {
    const encodedUrl = encodeURIComponent(params.siteUrl);
    return this.post<GSCAnalyticsResponse>(
      `${GSC_BASE}/sites/${encodedUrl}/searchAnalytics/query`,
      {
        startDate: params.startDate,
        endDate: params.endDate,
        dimensions: params.dimensions ?? ["date"],
        rowLimit: params.rowLimit ?? 25000,
      }
    );
  }

  /** 사용 가능한 GSC 속성 목록 */
  async getSiteList(): Promise<GSCSiteListResponse> {
    return this.request<GSCSiteListResponse>(`${GSC_BASE}/sites`);
  }
}
