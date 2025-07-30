import { dataGridZod } from "@/components/dataGridServerSide/zodTypes";
import { tracked } from "@trpc/server";
import { on } from "events";
import { z } from "zod";
import { protectedProcedure, router } from "..";

const projectRouter = router({
  subscribe: protectedProcedure.subscription(async function* (opts) {
    for await (const [data] of on(
      opts.ctx.subscriberDb.project.subscribe({ operations: ["*"] }),
      "change",
      {
        signal: opts.signal,
      }
    )) {
      yield tracked(data.id, data);
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
        include: {
          owner: true,
          includedBaseLayers: true,
          includedProjectLayers: true,
        },
      });
    }),
  listBaseLayers: protectedProcedure.input(dataGridZod).query(async (opts) => {
    return await opts.ctx.db.baseLayer.paginate(
      {
        select: {
          name: true,
          id: true,
          sizeGB: true,
          description: true,
        },
      },
      opts.input,
      ["name"]
    );
  }),
  updateBaseLayersSelection: protectedProcedure
    .input(
      z.object({ projectId: z.string(), baseLayerIds: z.array(z.string()) })
    )
    .mutation(async (opts) => {
      return await opts.ctx.db.project.update({
        where: {
          id: opts.input.projectId,
        },
        data: {
          includedBaseLayers: {
            set: opts.input.baseLayerIds.map((baseLayerId) => ({
              id: baseLayerId,
            })),
          },
        },
      });
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
