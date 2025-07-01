import { tracked } from "@trpc/server";
import { eachValueFrom } from "rxjs-for-await";
import { protectedProcedure, router } from "..";
import { z } from "zod";
import { dataGridZod } from "@/components/dataGridServerSide/zodTypes";
import {
  createFilters,
  createSort,
} from "@/components/dataGridServerSide/helpers";

const projectRouter = router({
  subscribe: protectedProcedure.subscription(async function* (opts) {
    for await (const value of eachValueFrom(
      opts.ctx.subscriberDb.project.subscribe({ operations: ["*"] })
    )) {
      yield tracked(value.id, value);
    }
  }),
  update: protectedProcedure
    .input(
      z.object({ id: z.string(), title: z.string(), description: z.string() })
    )
    .mutation(async (opts) => {
      return await opts.ctx.db.project.update({
        where: {
          owner: {
            id: opts.ctx.session.user.id,
          },
          id: opts.input.id,
        },
        data: {},
      });
    }),
  getTitle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async (opts) => {
      return await opts.ctx.db.project.findFirstOrThrow({
        where: {
          id: opts.input.id,
        },
        select: {
          title: true,
        },
      });
    }),
  getFull: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async (opts) => {
      return await opts.ctx.db.project.findFirstOrThrow({
        where: {
          id: opts.input.id,
        },
        include: { owner: true },
      });
    }),
  listLayers: protectedProcedure.input(dataGridZod).query(async (opts) => {
    const where = createFilters("BaseLayer", [], opts.input.filterModel);
    const orderBy = createSort("");
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string(), description: z.string() }))
    .mutation(async (opts) => {
      return await opts.ctx.db.project.create({
        data: {
          owner: {
            connect: {
              id: opts.ctx.session.user.id,
            },
          },
          description: opts.input.description,
          title: opts.input.title,
        },
        select: {
          id: true,
        },
      });
    }),
});

export default projectRouter;
