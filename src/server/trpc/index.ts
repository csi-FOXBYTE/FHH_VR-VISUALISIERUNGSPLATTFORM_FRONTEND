import { auth } from "@/server/auth/auth";
import { TRPCError, initTRPC } from "@trpc/server";
import { cache } from "react";
import prisma from "@/server/prisma";
import { createOTelPlugin } from "./otelMiddleware";
import { enhance } from "@zenstackhq/runtime";
import SuperJSON from "./superJSON";
import { Permissions } from "@/constants/permissions";

export const { createCallerFactory, router, procedure } = initTRPC
  .context<typeof createTRPCContext>()
  .create({
    transformer: SuperJSON,
    sse: {
      enabled: true,
      client: {
        reconnectAfterInactivityMs: 15_000,
      },
      ping: {
        enabled: true,
        intervalMs: 5_000,
      },
    },
  });

export const createTRPCContext = cache(async () => {
  const session = await auth();

  return {
    session,
  };
});

const otelPlugin = createOTelPlugin();

export const protectedProcedure = procedure
  .use(async ({ next, ctx }) => {
    const session = ctx.session;

    if (!session) throw new TRPCError({ code: "UNAUTHORIZED" }); // Only authenticated users are allowed!

    return next({
      ctx: {
        ...ctx,
        session: session,
        db: enhance(prisma, session),
      },
    });
  })
  .concat(otelPlugin.pluginProc);

export const generatePermissionProtectedProcedure = (
  requiredPermissions: Permissions[],
) =>
  protectedProcedure.use(async ({ next, ctx }) => {
    const session = ctx.session;

    const permissionsSet = new Set(session.user.permissions);

    for (const requiredPermission of requiredPermissions) {
      if (!permissionsSet.has(requiredPermission))
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        ...ctx,
      },
    });
  });
