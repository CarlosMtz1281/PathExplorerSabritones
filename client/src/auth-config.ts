import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

interface User {
  id: string; // Unique identifier for the user
  email?: string | null; // User's email address (optional)
  sessionId: string; // Session ID for the user
  userId: string; // User's unique ID in your database
  name: string; // User's name
  region_id: number; // Region ID associated with the user
  in_project: boolean; // Whether the user is part of a project
  role_id: number;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/general/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                mail: credentials?.email,
                password: credentials?.password,
              }),
            }
          );

          if (!response.ok) return null;

          const data = await response.json();

          if (data.success) {
            return {
              id: data.sessionId,
              email: credentials?.email,
              sessionId: data.sessionId,
              userId: data.userId,
              name: data.name,
              region_id: data.region_id,
              in_project: data.in_project,
              role_id: data.role_id
            };
          }
          return null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.sessionId = user.sessionId;
        token.userId = user.userId;
        token.name = user.name;
        token.region_id = user.region_id;
        token.in_project = user.in_project;
        token.role_id = user.role_id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.sessionId = token.sessionId as string;
      // You could also store these on `session.user`:
      session.user = {
        ...session.user,
        id: token.userId as string,
        name: token.name as string,
        region_id: token.region_id as number,
        in_project: token.in_project as boolean,
        role_id: token.role_id as number
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default authOptions;
