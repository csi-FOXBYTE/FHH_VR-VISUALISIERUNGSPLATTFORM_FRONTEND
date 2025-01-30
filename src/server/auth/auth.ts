import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import prisma from "../prisma";

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        const user = {
          id: "1",
          name: "Admin Foxbyte",
          email: "admin@foxbyte.de",
        };

        console.log(credentials);

        if (credentials.password === "admin@123") {
          console.log("correct")
          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Optionally, attach user info to the session
      if (user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  // adapter: PrismaAdapter(prisma),
});
