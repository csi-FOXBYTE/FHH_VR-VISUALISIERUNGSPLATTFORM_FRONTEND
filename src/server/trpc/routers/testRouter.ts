import eventBus from "@/server/events";
import { protectedProcedure, router } from "..";
import z from "zod";
import { eachValueFrom } from "rxjs-for-await";
import { tracked } from "@trpc/server";

const testRouter = router({
  test: protectedProcedure([]).query(async () => {
    console.log("HIT");
    return { payload: "test" };
  }),
  longRequest: protectedProcedure([]).query(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { long: "request" };
  }),
  onChat: protectedProcedure([])
    .input(z.object({ lastEventId: z.string().nullish() }).optional())
    .subscription(async function* () {
      for await (const value of eachValueFrom(
        eventBus.onType("user", "chat")
      )) {
        yield tracked(value.id, value);
      }
    }),
  sendChat: protectedProcedure(["user:create"])
    .input(z.object({ text: z.string(), userId: z.string() }))
    .mutation(async (opts) => {
      eventBus.emit("user", "chat", {
        text: opts.input.text,
        userId: opts.input.userId,
      });
    }),
  errorWorld: protectedProcedure([])
    .input(z.object({ a: z.string(), b: z.boolean() }))
    .mutation(async (opts) => {}),
  getProjects: protectedProcedure([]).query(async (opts) => {
    return [
      {
        name: "Hallo",
        id: "abc",
      },
      {
        name: "Test",
        id: "cde",
      },
    ];
  }),
});

export default testRouter;
