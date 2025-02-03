import { auth } from "@/server/auth/auth";
import { TRPCError, initTRPC } from "@trpc/server";
import { cache } from "react";
import SuperJSON from "superjson";
import prisma from "@/server/prisma";
import { createOTelPlugin } from "./otelMiddleware";
import eventBus from "@/server/events";
import type { GeneratedPermissions } from "../auth/roles";

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

export function protectedProcedure(
  requiredPermissions: GeneratedPermissions[] = []
) {
  return procedure
    .use(async ({ next, ctx }) => {
      const session = ctx.session;

      if (!session) throw new TRPCError({ code: "UNAUTHORIZED" }); // Only authenticated users are allowed!

      return next({
        ctx: {
          ...ctx,
          session: session,
        ***REMOVED***prisma,
          storage: null,
          eventBus,
        },
      });
    })
    .unstable_concat(otelPlugin.pluginProc);
}
