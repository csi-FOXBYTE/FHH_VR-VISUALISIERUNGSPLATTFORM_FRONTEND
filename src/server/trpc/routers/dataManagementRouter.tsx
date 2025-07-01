import { dataGridZod } from "@/components/dataGridServerSide/zodTypes";
import { z } from "zod";
import { protectedProcedure, router } from "..";

const dataManagementRouter = router({
  listBaseLayers: protectedProcedure.input(dataGridZod).query(
    async (opts) =>
      await opts.ctx.db.baseLayer.paginate(
        {
          select: {
            id: true,
            sizeGB: true,
            createdAt: true,
            name: true,
            creator: {
              select: {
                name: true,
              },
            },
            description: true,
            type: true,
          },
        },
        opts.input
      )
  ),
  createVisualAxis: protectedProcedure
    .input(
      z.object({
        endPointX: z.number(),
        endPointY: z.number(),
        endPointZ: z.number(),
        startPointX: z.number(),
        startPointY: z.number(),
        startPointZ: z.number(),
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async (opts) => {
      return await opts.ctx.db.visualAxis.create({
        data: {
          ...opts.input,
          creator: {
            connect: {
              id: opts.ctx.session.user.id,
            },
          },
        },
      });
    }),
  updateVisualAxis: protectedProcedure
    .input(
      z.object({
        endPointX: z.number(),
        endPointY: z.number(),
        endPointZ: z.number(),
        startPointX: z.number(),
        startPointY: z.number(),
        startPointZ: z.number(),
        name: z.string(),
        description: z.string().optional(),
        id: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { id, ...rest } = opts.input;
      return await opts.ctx.db.visualAxis.update({
        where: {
          id,
        },
        data: {
          ...rest,
        },
      });
    }),
  listVisualAxes: protectedProcedure.input(dataGridZod).query(
    async (opts) =>
      await opts.ctx.db.visualAxis.paginate(
        {
          select: {
            id: true,
            createdAt: true,
            name: true,
            description: true,
            endPointX: true,
            endPointY: true,
            endPointZ: true,
            startPointX: true,
            startPointY: true,
            startPointZ: true,
          },
        },
        opts.input
      )
  ),
  getVisualAxis: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async (opts) => {
      const visualAxis = await opts.ctx.db.visualAxis.findFirstOrThrow({
        where: {
          id: opts.input.id,
        },
        select: {
          endPointX: true,
          endPointY: true,
          endPointZ: true,
          startPointX: true,
          startPointY: true,
          startPointZ: true,
          name: true,
          description: true,
        },
      });

      return {
        endPoint: {
          x: visualAxis.endPointX,
          y: visualAxis.endPointY,
          z: visualAxis.endPointZ,
        },
        startPoint: {
          x: visualAxis.startPointX,
          y: visualAxis.startPointY,
          z: visualAxis.startPointZ,
        },
        name: visualAxis.name,
        description: visualAxis.description,
      };
    }),
});

export default dataManagementRouter;
