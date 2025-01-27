import { z } from "zod";
import { protectedProcedure, router } from "..";
import { createOrderBy } from "@/server/prisma/utils";

const targetsRouter = router({
  getProjectTargets: protectedProcedure([])
    .input(
      z.object({
        limit: z.number().optional(),
        skip: z.number().optional(),
        projectId: z.string(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      })
    )
    .query(async (opts) => {
      try {
        const data = await opts.ctx.db.target.findMany({
          take: opts.input.limit,
          skip: opts.input.skip,
          orderBy: createOrderBy(
            "Target",
            opts.input.sortBy,
            opts.input.sortOrder
          ),
          where: {
            projectId: opts.input.projectId,
          },
          select: {
            id: true,
            name: true,
            createdAt: true,
            assignedToUser: {
              select: {
                name: true,
              },
            },
            targetCategory: true,
          },
        });
        const count = await opts.ctx.db.target.count({
          where: {
            projectId: opts.input.projectId,
          },
        });
        return { data, count };
      } catch (error) {
        console.error("Error fetching project targets:", error);
        throw new Error("Error fetching project targets");
      }
    }),

  getTarget: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        targetId: z.string(),
      })
    )
    .query(async (opts) => {
      const { projectId, targetId } = opts.input;
      return opts.ctx.db.target.findFirstOrThrow({
        where: {
          id: targetId,
          projectId
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          creator: true,
          name: true,
          description: true,
          assignedToUser: true,
          targetCategory: true,
        }
      });
    }),

  deleteTarget: protectedProcedure([])
    .input(
      z.object({
        targetId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { targetId } = opts.input;

      await opts.ctx.db.target.delete({
        where: {
          id: targetId,
        },
      });

      return { success: true };
    }),


  editTarget: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        targetId: z.string(),
        data: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          assignedToUserId: z.string().optional(),
          targetCategory: z.enum(['DATE', 'COST', 'PERFORMANCE']),
          updatedAt: z.date(),
        }),
      })
    )
    .mutation(async (opts) => {
      const { projectId, targetId, data } = opts.input;

      const updatedTarget = await opts.ctx.db.target.update({
        where: {
          id: targetId,
          projectId: projectId,
        },
        data: {
          name: data.name,
          description: data.description,
          assignedToUserId: data.assignedToUserId,
          targetCategory: data.targetCategory,
          updatedAt: data.updatedAt,
        },
      });

      return updatedTarget;
    }),


  addTarget: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        data: z.object({
          name: z.string(),
          description: z.string(),
          assignedToUserId: z.string(),
          targetCategory: z.enum(['DATE', 'COST', 'PERFORMANCE']),
          createdAt: z.date(),
          creatorId: z.string(),
        }),
      })
    )
    .mutation(async (opts) => {
      const { projectId, data } = opts.input;

      const newTarget = await opts.ctx.db.target.create({
        data: {
          projectId,
          name: data.name,
          description: data.description,
          assignedToUserId: data.assignedToUserId,
          targetCategory: data.targetCategory,
          createdAt: data.createdAt,
          creatorId: data.creatorId,
        },
      });

      return newTarget;
    }),



});

export default targetsRouter;