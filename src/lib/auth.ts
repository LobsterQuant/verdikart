import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return false;
      if (!user.email) return false;

      try {
        await db
          .insert(users)
          .values({
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
          })
          .onConflictDoUpdate({
            target: users.email,
            set: {
              name: user.name ?? null,
              image: user.image ?? null,
            },
          });
        return true;
      } catch (error) {
        Sentry.captureException(error, { tags: { scope: "auth.signIn" } });
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const [row] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);
        if (row) {
          token.id = row.id;
          token.email = user.email;
          if (process.env.NODE_ENV !== "production") {
            console.log("[auth] first sign-in:", user.email, "→ uuid:", row.id);
          }
        }
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
});
