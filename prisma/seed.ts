import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a system user for bootstrap invite codes
  const systemUser = await prisma.user.upsert({
    where: { email: "system@wp-companion.local" },
    update: {},
    create: {
      email: "system@wp-companion.local",
      name: "System",
    },
  });

  // Create initial invite code
  const code = "WELCOME1";
  const invite = await prisma.inviteCode.upsert({
    where: { code },
    update: {},
    create: {
      code,
      createdById: systemUser.id,
      expiresAt: new Date("2026-12-31"),
    },
  });

  console.log(`\n초대 코드가 생성되었습니다: ${invite.code}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
