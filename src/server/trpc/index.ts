import { auth } from "@/server/auth/auth";
import { TRPCError, initTRPC } from "@trpc/server";
import { cache } from "react";
import prisma from "@/server/prisma";
import { createOTelPlugin } from "./otelMiddleware";
import { enhance } from "@zenstackhq/runtime";
import realtimeExtension from "../prisma/extensions/realtimeExtension";
import SuperJSON from "./superJSON";

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
      ***REMOVED***enhance(prisma, session).$extends(realtimeExtension()),
        subscriberDb: prisma,
      },
    });
  })
  .concat(otelPlugin.pluginProc);
