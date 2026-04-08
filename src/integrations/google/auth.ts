import { prisma } from "@/lib/prisma";

const TOKEN_REFRESH_BUFFER = 5 * 60; // 만료 5분 전 선제 갱신

// 동일 userId에 대한 동시 토큰 갱신 방지
const refreshLocks = new Map<string, Promise<string>>();

export class GoogleAuthManager {
  /** userId의 유효한 Google access token을 반환. 만료 시 자동 갱신 */
  static async getAccessToken(userId: string): Promise<string> {
    const account = await prisma.account.findFirst({
      where: { userId, provider: "google" },
    });

    if (!account) {
      throw new Error("Google 계정이 연결되어 있지 않습니다");
    }

    if (!account.refresh_token) {
      throw new Error("Google refresh token이 없습니다. 다시 로그인해주세요.");
    }

    // 토큰이 아직 유효한 경우 (만료 5분 전까지)
    const now = Math.floor(Date.now() / 1000);
    if (account.access_token && account.expires_at && account.expires_at > now + TOKEN_REFRESH_BUFFER) {
      return account.access_token;
    }

    // 토큰 갱신 필요 — 뮤텍스로 동시 갱신 방지
    const existing = refreshLocks.get(userId);
    if (existing) {
      return existing;
    }

    const refreshPromise = this.refreshToken(account.id, account.refresh_token)
      .finally(() => {
        refreshLocks.delete(userId);
      });

    refreshLocks.set(userId, refreshPromise);
    return refreshPromise;
  }

  /** Google token endpoint로 access token 갱신 */
  private static async refreshToken(
    accountId: string,
    refreshToken: string
  ): Promise<string> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        refresh_token: refreshToken,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.error === "invalid_grant") {
        throw new Error(
          "Google 인증이 만료되었습니다. 다시 로그인해주세요."
        );
      }
      throw new Error(
        `Google 토큰 갱신 실패: ${error.error_description || response.statusText}`
      );
    }

    const data = await response.json();

    // Account 레코드 업데이트
    await prisma.account.update({
      where: { id: accountId },
      data: {
        access_token: data.access_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
        // refresh_token이 갱신된 경우 (Google이 새 토큰을 발급하면)
        ...(data.refresh_token && { refresh_token: data.refresh_token }),
      },
    });

    return data.access_token;
  }
}
