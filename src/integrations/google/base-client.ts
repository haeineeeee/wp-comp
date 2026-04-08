import type { GoogleApiError } from "./types";

export class GoogleBaseClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  protected async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const apiError = body as GoogleApiError | null;

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Google API 권한 오류: ${apiError?.error?.message || "접근 권한이 없습니다"}`
        );
      }
      if (response.status === 429) {
        throw new Error("Google API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
      }

      throw new Error(
        `Google API 오류 (${response.status}): ${apiError?.error?.message || response.statusText}`
      );
    }

    return response.json();
  }

  protected async post<T>(url: string, body: unknown): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}
