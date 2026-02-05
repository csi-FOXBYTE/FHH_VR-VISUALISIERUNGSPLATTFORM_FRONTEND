import { Permissions } from "@/constants/permissions";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import MicrosoftEntraIdProvider from "next-auth/providers/microsoft-entra-id";
import prisma from "../prisma";
import { isMatch } from "matcher";
import { getLocale } from "next-intl/server";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      language: "EN" | "DE" | null;
      name: string;
      permissions: Permissions[];
      email: string;
      image?: string;
      assignedGroups: {
        name: string;
        id: string;
        assignedRoles: {
          name: string;
          id: string;
          assignedPermissions: Permissions[];
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
          scope: "openid profile email",
        },
      },
    }),
  ],
  debug: process.env.NEXTAUTH_DEBUG === "true",
  callbacks: {
    async signIn({ account, user, profile }) {
      try {
        const foundUser = await prisma.user.findFirst({
          where: {
            email: user.email!,
          },
          select: {
            id: true,
            name: true,
          },
        });

        const userId = foundUser?.id ?? null;

        if (!account) {
          console.error("NO ACCOUNT PROVIDED");
          return false;
        }

        if (!user.email) {
          console.error("NO EMAIL PROVIDED");
          return false;
        }

        if (!profile) {
          console.error("NO PROFILE FOUND");
          return false;
        }

        const groupsWithDefault = await prisma.group.findMany({
          select: {
            id: true,
            defaultFor: true,
          },
        });

        const defaultGroups = groupsWithDefault
          .filter(({ defaultFor }) => {
            if (!defaultFor) return false;

            for (const splitDefaultFor of defaultFor) {
              if (isMatch(user.email!, splitDefaultFor)) return true;
            }

            return false;
          })
          .map(({ id }) => ({ id }));

        if (!userId) {
          const locale = await getLocale();
          let language: "EN" | "DE" | null = null;

          if (locale === "en") language = "EN";
          if (locale === "de") language = "DE";

          await prisma.user.create({
            data: {
              name: profile.name,
              email: user.email,
              language,
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

        await prisma.user.update({
          data: {
            name: profile?.name,
            ...(typeof foundUser?.name === "string"
              ? {}
              : { assignedGroups: { connect: defaultGroups } }),
            accounts: {
              upsert: {
                where: {
                  provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                  },
                },
                create: {
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  id_token: account.id_token,
                  refresh_token: account.refresh_token,
                  providerAccountId: account.providerAccountId,
                  provider: account.provider,
                  scope: account.scope,
                  token_type: account.token_type,
                  type: account.type,
                },
                update: {
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
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    async session({ session }) {
      const locale = await getLocale();
      let language: "EN" | "DE" | null = null;

      if (locale === "en") language = "EN";
      if (locale === "de") language = "DE";

      if (session.user.language !== language && language !== null)
        await prisma.user.update({
          where: {
            id: session.userId,
          },
          data: {
            language,
          },
        });

      const { assignedGroups } = await prisma.user.findFirstOrThrow({
        where: { id: session.user.id },
        select: {
          id: true,
          assignedGroups: {
            select: {
              id: true,
              name: true,
              isAdminGroup: true,
              assignedRoles: {
                select: {
                  name: true,
                  id: true,
                  isAdminRole: true,
                  assignedPermissions: true,
                },
              },
            },
          },
        },
      });

      session.user.permissions = Array.from(
        new Set<Permissions>(
          assignedGroups.flatMap((assignedGroup) =>
            assignedGroup.assignedRoles.flatMap(
              (assignedRole) => assignedRole.assignedPermissions,
            ),
          ) as Permissions[],
        ),
      );
      session.user.assignedGroups = assignedGroups;

      return session;
    },
  },
  session: {
    strategy: "database",
    maxAge: 259200, // 30 days
    updateAge: 86400, // 1 day
  },
  adapter: PrismaAdapter(prisma),
});
