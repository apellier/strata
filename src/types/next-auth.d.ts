// src/types/next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth";

/**
 * This file extends the default types for NextAuth.js session objects.
 * It adds the `id` property to the `user` object within the session,
 * making it available throughout the application with full type safety.
 */

declare module "next-auth" {
  /**
   * The shape of the session object returned by `useSession`, `getSession`, etc.
   */
  interface Session {
    user: {
      /** The user's unique ID from the database. */
      id: string;
    } & DefaultSession["user"]; // This keeps the original properties like name, email, image
  }
}
