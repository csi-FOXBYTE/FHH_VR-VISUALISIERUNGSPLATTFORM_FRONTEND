import { tracked } from "@trpc/server";
import { eachValueFrom } from "rxjs-for-await";
import { z } from "zod";
import { protectedProcedure, router } from "..";

const subscriptionRouter = router({
  subscribe: protectedProcedure
    .input(z.string())
    .subscription(async function* (opts) {
      for await (const value of eachValueFrom(
        // @ts-expect-error unsafe
        opts.ctx.subscriberDb[opts.input].subscribe({ operations: ["*"] })
      )) {
        // @ts-expect-error unsafe
        yield tracked(value.id, value);
      }
    }),
});

export default subscriptionRouter;
