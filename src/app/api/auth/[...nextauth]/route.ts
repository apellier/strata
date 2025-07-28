// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/db"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    // You can add more providers here (e.g., Google, Email)
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // This callback includes the user's ID in the session object
    async session({ session, user }: { session: any; user: any }) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
