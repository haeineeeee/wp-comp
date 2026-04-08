import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export class InviteService {
  static generateCode(): string {
    return randomBytes(4).toString("hex").toUpperCase();
  }

  static async createInviteCode(createdById: string, expiresInDays = 7) {
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return prisma.inviteCode.create({
      data: {
        code,
        createdById,
        expiresAt,
      },
    });
  }

  static async validateCode(code: string) {
    const invite = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!invite) return { valid: false, error: "코드가 존재하지 않습니다" };
    if (invite.usedById) return { valid: false, error: "이미 사용된 코드입니다" };
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return { valid: false, error: "만료된 코드입니다" };
    }

    return { valid: true, invite };
  }

  static async useCode(code: string, userId: string) {
    const { valid, error, invite } = await this.validateCode(code);
    if (!valid || !invite) return { success: false, error };

    // Use updateMany with compound where to prevent race condition
    try {
      const result = await prisma.inviteCode.updateMany({
        where: {
          id: invite.id,
          usedById: null,
        },
        data: {
          usedById: userId,
          usedAt: new Date(),
        },
      });

      if (result.count === 0) {
        return { success: false, error: "코드가 이미 사용되었습니다" };
      }
      return { success: true };
    } catch {
      return { success: false, error: "코드 사용에 실패했습니다. 다시 시도해주세요." };
    }
  }
}
