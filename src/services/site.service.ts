import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";
import { WordPressClient } from "@/integrations/wordpress";

interface CreateSiteInput {
  url: string;
  name: string;
  wpUsername: string;
  appPassword: string;
}

interface UpdateSiteInput {
  name?: string;
  wpUsername?: string;
  appPassword?: string;
  status?: string;
  gscProperty?: string | null;
  ga4PropertyId?: string | null;
  adsenseAccountId?: string | null;
}

export class SiteService {
  /** 사이트 목록 조회 (apiKey 제외) */
  static async list(userId: string) {
    return prisma.wordPressSite.findMany({
      where: { userId },
      omit: { apiKey: true },
      orderBy: { createdAt: "desc" },
    });
  }

  /** 단일 사이트 조회 (apiKey 제외) */
  static async getById(userId: string, siteId: string) {
    return prisma.wordPressSite.findFirst({
      where: { id: siteId, userId },
      omit: { apiKey: true },
    });
  }

  /** 사이트 생성 */
  static async create(userId: string, input: CreateSiteInput) {
    const url = input.url.replace(/\/+$/, "");

    // 중복 URL 확인
    const existing = await prisma.wordPressSite.findUnique({
      where: { userId_url: { userId, url } },
    });
    if (existing) {
      return { success: false as const, error: "이미 등록된 사이트입니다" };
    }

    // 자격 증명 암호화
    const apiKey = encrypt(
      JSON.stringify({
        username: input.wpUsername,
        appPassword: input.appPassword,
      })
    );

    const site = await prisma.wordPressSite.create({
      data: {
        userId,
        url,
        name: input.name,
        apiKey,
      },
      omit: { apiKey: true },
    });

    return { success: true as const, site };
  }

  /** 사이트 수정 */
  static async update(userId: string, siteId: string, input: UpdateSiteInput) {
    const site = await prisma.wordPressSite.findFirst({
      where: { id: siteId, userId },
    });
    if (!site) {
      return { success: false as const, error: "사이트를 찾을 수 없습니다" };
    }

    const data: Record<string, unknown> = {};
    if (input.name) data.name = input.name;
    if (input.status) data.status = input.status;

    // Google 속성 업데이트 (null 허용: 연결 해제)
    if (input.gscProperty !== undefined) data.gscProperty = input.gscProperty;
    if (input.ga4PropertyId !== undefined) data.ga4PropertyId = input.ga4PropertyId;
    if (input.adsenseAccountId !== undefined) data.adsenseAccountId = input.adsenseAccountId;

    // 자격 증명 변경 시 기존 값과 병합하여 재암호화
    if (input.wpUsername || input.appPassword) {
      const current = JSON.parse(decrypt(site.apiKey));
      data.apiKey = encrypt(
        JSON.stringify({
          username: input.wpUsername ?? current.username,
          appPassword: input.appPassword ?? current.appPassword,
        })
      );
    }

    const updated = await prisma.wordPressSite.update({
      where: { id: siteId },
      data,
      omit: { apiKey: true },
    });

    return { success: true as const, site: updated };
  }

  /** 사이트 삭제 (PostCache, SyncLog 등 cascade) */
  static async delete(userId: string, siteId: string) {
    const site = await prisma.wordPressSite.findFirst({
      where: { id: siteId, userId },
    });
    if (!site) {
      return { success: false as const, error: "사이트를 찾을 수 없습니다" };
    }

    await prisma.wordPressSite.delete({ where: { id: siteId } });
    return { success: true as const };
  }

  /** WP 연결 테스트 (DB 미사용) */
  static async testConnection(
    url: string,
    wpUsername: string,
    appPassword: string
  ) {
    const client = new WordPressClient(url, wpUsername, appPassword);
    return client.testConnection();
  }

  /** 저장된 사이트의 자격 증명 복호화 (내부 전용) */
  static async getCredentials(userId: string, siteId: string) {
    const site = await prisma.wordPressSite.findFirst({
      where: { id: siteId, userId },
      select: { id: true, url: true, apiKey: true },
    });
    if (!site) return null;

    const { username, appPassword } = JSON.parse(decrypt(site.apiKey));
    return { siteId: site.id, url: site.url, username, appPassword };
  }
}
