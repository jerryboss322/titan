// lib/auth-edge.ts
// Edge Runtime-compatible auth export.
// This file intentionally omits the PrismaAdapter because Prisma's
// native binary client cannot run in the Edge Runtime (Vercel middleware).
// It is used ONLY in middleware.ts for JWT token verification.
// Full auth (with Prisma) lives in lib/auth.ts and is used only in Node.js contexts.
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { auth } = NextAuth({
  // No adapter — JWT verification only, no DB calls at the edge
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // authorize is never called in middleware — this is just to satisfy
      // the NextAuth type requirement for the Credentials provider.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async authorize(_credentials) {
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
});
