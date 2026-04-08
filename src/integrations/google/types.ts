/** Google API 공통 + GSC/GA4/AdSense 응답 타입 */

// ─── 공통 ───────────────────────────────────────

export interface GoogleApiError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

export interface SyncStepResult {
  type: "gsc" | "ga4" | "adsense";
  status: "success" | "skipped" | "error";
  recordsWritten: number;
  error?: string;
}

// ─── Google Search Console ──────────────────────

export interface GSCAnalyticsResponse {
  rows?: GSCAnalyticsRow[];
  responseAggregationType?: string;
}

export interface GSCAnalyticsRow {
  keys: string[]; // dimension values (date, page, query 등)
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCSite {
  siteUrl: string;
  permissionLevel: string;
}

export interface GSCSiteListResponse {
  siteEntry?: GSCSite[];
}

// ─── Google Analytics 4 ─────────────────────────

export interface GA4ReportResponse {
  dimensionHeaders?: { name: string }[];
  metricHeaders?: { name: string; type: string }[];
  rows?: GA4ReportRow[];
  rowCount?: number;
}

export interface GA4ReportRow {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

export interface GA4PropertySummary {
  property: string; // "properties/123456789"
  displayName: string;
}

export interface GA4AccountSummary {
  name: string;
  displayName: string;
  propertySummaries?: GA4PropertySummary[];
}

export interface GA4AccountSummariesResponse {
  accountSummaries?: GA4AccountSummary[];
}

// ─── Google AdSense ─────────────────────────────

export interface AdSenseReportResponse {
  headers?: { name: string; type: string }[];
  rows?: AdSenseReportRow[];
  totalMatchedRows?: string;
}

export interface AdSenseReportRow {
  cells: { value: string }[];
}

export interface AdSenseAccount {
  name: string; // "accounts/pub-1234567890123456"
  displayName: string;
  state: string;
}

export interface AdSenseAccountsResponse {
  accounts?: AdSenseAccount[];
}
