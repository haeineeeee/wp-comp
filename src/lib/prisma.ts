import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * userId가 자동으로 주입되는 확장 Prisma 클라이언트를 반환합니다.
 * WordPressSite 쿼리에 userId 필터가 자동 적용됩니다.
 */
export function prismaForUser(userId: string) {
  return prisma.$extends({
    query: {
      wordPressSite: {
        async findMany({ args, query }) {
          args.where = { ...args.where, userId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, userId };
          return query(args);
        },
        async findUnique({ args, query }) {
          return query(args);
        },
        async update({ args, query }) {
          // update 전 소유권 확인
          const existing = await prisma.wordPressSite.findFirst({
            where: { id: args.where.id as string, userId },
          });
          if (!existing) throw new Error("사이트를 찾을 수 없습니다");
          return query(args);
        },
        async delete({ args, query }) {
          const existing = await prisma.wordPressSite.findFirst({
            where: { id: args.where.id as string, userId },
          });
          if (!existing) throw new Error("사이트를 찾을 수 없습니다");
          return query(args);
        },
      },
      postCache: {
        async findMany({ args, query }) {
          args.where = { ...args.where, site: { ...((args.where as Record<string, unknown>)?.site as object), userId } };
          return query(args);
        },
      },
    },
  });
}
