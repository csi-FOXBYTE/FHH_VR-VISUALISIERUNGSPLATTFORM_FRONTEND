import { authOptions } from "@/server/auth/authOptions";
import { TRPCError, initTRPC } from "@trpc/server";
import { getServerSession } from "next-auth";
import { cache } from "react";
import SuperJSON from "superjson";
import prisma from "@/server/prisma";
import { createOTelPlugin } from "./otelMiddleware";
import eventBus from "@/server/events";
import { UserService } from "../services/userService";
import type { GeneratedPermissions } from "../auth/roles";
import { ProjectService } from "../services/projectService";

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
  const session = await getServerSession(authOptions);

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

      let _userService: UserService | null = null;
      let _projectService: ProjectService | null = null;

      return next({
        ctx: {
          ...ctx,
          session: session,
          ***REMOVED***{
            get user() {
              _userService ??= new UserService(prisma, eventBus, session);
              return _userService;
            },
            get project() {
              _projectService ??= new ProjectService(prisma, eventBus, session);
              return _projectService;
            },
          },
          storage: null,
          eventBus,
        },
      });
    })
    .unstable_concat(otelPlugin.pluginProc);
}
