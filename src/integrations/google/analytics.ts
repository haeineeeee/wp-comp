import { GoogleBaseClient } from "./base-client";
import type {
  GA4ReportResponse,
  GA4AccountSummariesResponse,
} from "./types";

const GA4_DATA_BASE = "https://analyticsdata.googleapis.com/v1beta";
const GA4_ADMIN_BASE = "https://analyticsadmin.googleapis.com/v1beta";

export class GA4Client extends GoogleBaseClient {
  /** GA4 리포트 실행 */
  async runReport(params: {
    propertyId: string; // 숫자만 (예: "123456789")
    startDate: string; // YYYY-MM-DD 또는 "30daysAgo"
    endDate: string;
    dimensions: string[];
    metrics: string[];
    limit?: number;
    dimensionFilter?: unknown;
  }): Promise<GA4ReportResponse> {
    return this.post<GA4ReportResponse>(
      `${GA4_DATA_BASE}/properties/${params.propertyId}:runReport`,
      {
        dateRanges: [
          { startDate: params.startDate, endDate: params.endDate },
        ],
        dimensions: params.dimensions.map((name) => ({ name })),
        metrics: params.metrics.map((name) => ({ name })),
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.dimensionFilter ? { dimensionFilter: params.dimensionFilter } : {}),
      }
    );
  }

  /** 사용 가능한 GA4 속성 목록 */
  async listProperties(): Promise<GA4AccountSummariesResponse> {
    return this.request<GA4AccountSummariesResponse>(
      `${GA4_ADMIN_BASE}/accountSummaries?pageSize=200`
    );
  }
}
