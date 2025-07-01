import { Permissions } from "@/constants/permissions";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import MicrosoftEntraIdProvider from "next-auth/providers/microsoft-entra-id";
import prisma from "../prisma";
import { isMatch } from "matcher";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      permissions: Set<Permissions>;
      email: string;
      image?: string;
      assignedGroups: {
        name: string;
        id: string;
        assignedRoles: {
          name: string;
          id: string;
          assignedPermissions: { name: string; id: string }[];
        }[];
      }[];
    };
  }
}

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
  callbacks: {
    async signIn({ account, user, profile }) {
      const foundUser = await prisma.user.findFirst({
        where: {
          email: user.email!,
        },
        select: {
          id: true,
        },
      });

      const userId = foundUser?.id ?? null;

      if (!account) {
        console.error("NO ACCOUNT PROVIDED");
        return false;
      }

      if (!user.email) {
        console.error("NO EMAIL PROVIEDD");
        return false;
      }

      if (!profile) {
        console.error("NO PROFILE FOUND");
        return false;
      }

      if (!userId) {
        const groupsWithDefault = await prisma.group.findMany({
          where: {
            defaultFor: {
              not: null,
            },
          },
          select: {
            id: true,
            defaultFor: true,
          },
        });

        const defaultGroups = groupsWithDefault
          .filter(({ defaultFor }) => {
            if (!defaultFor) return false;

            for (const splitDefaultFor of defaultFor.split(",")) {
              if (isMatch(user.email!, splitDefaultFor)) return true;
            }

            return false;
          })
          .map(({ id }) => ({ id }));

        await prisma.user.create({
          data: {
            name: profile.name,
            email: user.email,
            assignedGroups: {
              connect: defaultGroups,
            },
            accounts: {
              create: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                type: account.type,
                access_token: account.access_token,
                expires_at: account.expires_at,
                id_token: account.id_token,
                refresh_token: account.refresh_token,
                scope: account.scope,
                token_type: account.token_type,
              },
            },
          },
        });

        return true;
      }

      const foundUserWithAccount = await prisma.user.findFirst({
        where: {
          email: user.email!,
          accounts: {
            every: {
              providerAccountId: account.providerAccountId,
            },
          },
        },
      });

      if (!foundUserWithAccount) {
        console.error("NO USER FOUND");
        return false;
      }

      await prisma.user.update({
        data: {
          name: profile?.name,
          accounts: {
            update: {
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              data: {
                access_token: account.access_token,
                expires_at: account.expires_at,
                id_token: account.id_token,
                refresh_token: account.refresh_token,
                scope: account.scope,
                token_type: account.token_type,
                type: account.type,
              },
            },
          },
        },
        where: {
          id: userId,
        },
      });

      return true;
    },
    async session({ session }) {
      const { assignedGroups } = await prisma.user.findFirstOrThrow({
        where: { id: session.user.id },
        select: {
          assignedGroups: {
            select: {
              id: true,
              name: true,
              assignedRoles: {
                select: {
                  name: true,
                  id: true,
                  assignedPermissions: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      });

      session.user.permissions = new Set<Permissions>(
        assignedGroups.flatMap((assignedGroup) =>
          assignedGroup.assignedRoles.flatMap((assignedRole) =>
            assignedRole.assignedPermissions.flatMap(
              (assignedPermission) => assignedPermission.name
            )
          )
        ) as Permissions[]
      );
      session.user.assignedGroups = assignedGroups;

      return session;
    },
  },
  session: {
    strategy: "database",
    maxAge: 259200, // 30 days
  },
  adapter: PrismaAdapter(prisma),
});
