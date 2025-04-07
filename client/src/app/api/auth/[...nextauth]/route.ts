/*
  NO SE PARA QUE SIRVA PERO NO MOVER -NICO
*/
import NextAuth from "next-auth";
import authOptions from "@/auth-config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };