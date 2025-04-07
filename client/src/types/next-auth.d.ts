// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    sessionId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sessionId: string;
  }
}