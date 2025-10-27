
import NextAuth, { type NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) (session.user as any).id = token.sub;
      return session;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
