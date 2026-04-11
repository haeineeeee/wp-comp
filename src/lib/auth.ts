import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { InviteService } from "@/services/invite.service";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // Google OAuth (도메인 준비 후 활성화)
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_ID !== "disabled"
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            authorization: {
              params: {
                scope: [
                  "openid",
                  "email",
                  "profile",
                  "https://www.googleapis.com/auth/webmasters.readonly",
                  "https://www.googleapis.com/auth/analytics.readonly",
                  "https://www.googleapis.com/auth/adsense.readonly",
                ].join(" "),
                access_type: "offline",
                prompt: "consent",
              },
            },
          }),
        ]
      : []),

    // 초대 코드로 로그인 (도메인 없이도 동작)
    Credentials({
      name: "invite-code",
      credentials: {
        code: { label: "초대 코드", type: "text" },
      },
      async authorize(credentials) {
        const code = credentials?.code as string;
        if (!code) return null;

        const { valid } = await InviteService.validateCode(code);
        if (!valid) return null;

        // 초대 코드 사용자 생성 또는 조회
        const email = `invite-${code.toLowerCase()}@wp-companion.local`;
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: { email, name: `User (${code})` },
          });
          await InviteService.useCode(code, user.id);
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
