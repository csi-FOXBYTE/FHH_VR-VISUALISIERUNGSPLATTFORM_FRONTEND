import { z } from "zod";
import { protectedProcedure, router } from "..";
import { createOrderBy } from "@/server/prisma/utils";

const requirementsRouter = router({
  getProjectRequirements: protectedProcedure([])
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
        const data = await opts.ctx.db.requirement.findMany({
          take: opts.input.limit,
          skip: opts.input.skip,
          orderBy: createOrderBy(
            "Requirement",
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
            requirementCategory: true,
          },
        });
        const count = await opts.ctx.db.requirement.count({
          where: {
            projectId: opts.input.projectId,
          },
        });
        return { data, count };
      } catch (error) {
        console.error("Error fetching project requirements:", error);
        throw new Error("Error fetching project requirements");
      }
    }),

  getRequirement: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        requirementId: z.string(),
      })
    )
    .query(async (opts) => {
      const { projectId, requirementId } = opts.input;
      return opts.ctx.db.requirement.findFirstOrThrow({
        where: {
          id: requirementId,
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
          requirementCategory: true,
        }
      });
    }),

  deleteRequirement: protectedProcedure([])
    .input(
      z.object({
        requirementId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { requirementId } = opts.input;

      await opts.ctx.db.requirement.delete({
        where: {
          id: requirementId,
        },
      });

      return { success: true };
    }),


  editRequirement: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        requirementId: z.string(),
        data: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          assignedToUserId: z.string().optional(),
          requirementCategory: z.enum(['ORGANIZATIONAL', 'TECHNICAL']),
          updatedAt: z.date(),
        }),
      })
    )
    .mutation(async (opts) => {
      const { projectId, requirementId, data } = opts.input;

      const updatedRequirement = await opts.ctx.db.requirement.update({
        where: {
          id: requirementId,
          projectId: projectId,
        },
        data: {
          name: data.name,
          description: data.description,
          assignedToUserId: data.assignedToUserId,
          requirementCategory: data.requirementCategory,
          updatedAt: data.updatedAt,
        },
      });

      return updatedRequirement;
    }),


  addRequirement: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        data: z.object({
          name: z.string(),
          description: z.string(),
          assignedToUserId: z.string(),
          requirementCategory: z.enum(['ORGANIZATIONAL', 'TECHNICAL']),
          createdAt: z.date(),
          creatorId: z.string(),
        }),
      })
    )
    .mutation(async (opts) => {
      const { projectId, data } = opts.input;

      const newRequirement = await opts.ctx.db.requirement.create({
        data: {
          projectId,
          name: data.name,
          description: data.description,
          assignedToUserId: data.assignedToUserId,
          requirementCategory: data.requirementCategory,
          createdAt: data.createdAt,
          creatorId: data.creatorId,
        },
      });

      return newRequirement;
    }),



});

export default requirementsRouter;