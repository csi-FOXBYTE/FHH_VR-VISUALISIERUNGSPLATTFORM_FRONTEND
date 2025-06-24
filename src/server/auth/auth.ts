import NextAuth from "next-auth";
import MicrosoftEntraIdProvider from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "../prisma";

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  providers: [
    MicrosoftEntraIdProvider({
      clientSecret: process.env.MICROSOFT_ENTRA_CLIENT_SECRET,
      clientId: process.env.MICROSOFT_ENTRA_CLIENT_ID,
      issuer: process.env.MICROSOFT_ENTRA_ISSUER,
      authorization: {
        params: {
          scope: "openid profile email urn:fhhvr/vrvis-prod",
        },
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 259200, // 30 days
  },
  adapter: PrismaAdapter(prisma),
});
