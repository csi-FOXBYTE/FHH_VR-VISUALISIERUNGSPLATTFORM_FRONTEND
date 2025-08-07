import { tracked } from "@trpc/server";
import { on } from "events";
import { z } from "zod";
import { protectedProcedure, router } from "..";

const subscriptionRouter = router({
  subscribe: protectedProcedure
    .input(z.string())
    .subscription(async function* (opts) {
      for await (const [data] of on(
        // @ts-expect-error wrong type
        opts.ctx.subscriberDb[opts.input].subscribe({ operations: ["*"] }),
        "change",
        {
          signal: opts.signal,
        }
      )) {
        yield tracked(data.id, data);
      }
    }),
});

export default subscriptionRouter;
