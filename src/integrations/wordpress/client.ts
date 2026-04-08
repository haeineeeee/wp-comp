import type { WPPost, WPPostsResponse, WPSiteInfo, WPUser } from "./types";

export class WordPressClient {
  private baseUrl: string;
  private authHeader: string;

  constructor(siteUrl: string, username: string, appPassword: string) {
    // 끝의 슬래시 제거 후 /wp-json/wp/v2 경로 생성
    this.baseUrl = siteUrl.replace(/\/+$/, "");
    this.authHeader =
      "Basic " + Buffer.from(`${username}:${appPassword}`).toString("base64");
  }

  /** 사이트 연결 + 인증 테스트 */
  async testConnection(): Promise<{
    success: boolean;
    siteName?: string;
    error?: string;
  }> {
    try {
      // 인증 확인: /wp-json/wp/v2/users/me
      await this.request<WPUser>("/wp/v2/users/me");

      // 사이트 정보 가져오기
      const siteInfo = await this.request<WPSiteInfo>("");
      return { success: true, siteName: siteInfo.name };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
      };
    }
  }

  /** 글 목록 조회 (페이지네이션 포함) */
  async getPosts(
    params: {
      page?: number;
      per_page?: number;
      status?: string;
    } = {}
  ): Promise<WPPostsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page ?? 1));
    searchParams.set("per_page", String(params.per_page ?? 100));
    if (params.status) {
      searchParams.set("status", params.status);
    } else {
      // 기본: 모든 상태의 글 조회
      searchParams.set("status", "publish,draft,private,pending,future");
    }

    const response = await this.rawRequest(
      `/wp/v2/posts?${searchParams.toString()}`
    );

    const posts: WPPost[] = await response.json();
    const total = parseInt(response.headers.get("X-WP-Total") ?? "0", 10);
    const totalPages = parseInt(
      response.headers.get("X-WP-TotalPages") ?? "0",
      10
    );

    return { posts, total, totalPages };
  }

  /** 전체 글 수 조회 */
  async getPostCount(): Promise<number> {
    const { total } = await this.getPosts({ page: 1, per_page: 1 });
    return total;
  }

  /** API 요청 (JSON 파싱 포함) */
  private async request<T>(endpoint: string): Promise<T> {
    const response = await this.rawRequest(endpoint);
    return response.json();
  }

  /** API 요청 (Response 객체 반환, 헤더 접근 필요 시) */
  private async rawRequest(endpoint: string): Promise<Response> {
    const url = `${this.baseUrl}/wp-json${endpoint}`;

    const response = await fetch(url, {
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("인증에 실패했습니다. 사용자명과 앱 비밀번호를 확인해주세요.");
      }
      if (response.status === 404) {
        throw new Error(
          "WordPress REST API를 찾을 수 없습니다. URL을 확인해주세요."
        );
      }
      throw new Error(`WordPress API 오류 (${response.status})`);
    }

    return response;
  }
}
