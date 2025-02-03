import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "../prisma";

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 14,
  },
  adapter: PrismaAdapter(prisma),
});
