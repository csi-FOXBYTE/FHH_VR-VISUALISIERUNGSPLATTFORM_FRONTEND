import { z } from "zod";
import { protectedProcedure, router } from "..";

const requirementsRouter = router({
  getRequirement: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        requirementId: z.string(),
      })
    )
    .query(async (opts) => {
      const { projectId, requirementId } = opts.input;
      return opts.ctx.services.project.getRequirement(projectId, requirementId);
    }),

  deleteRequirement: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        requirementId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { projectId, requirementId } = opts.input;
      await opts.ctx.services.project.deleteRequirement(projectId, requirementId);
      return { success: true };
    }),

  editRequirement: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        requirementId: z.string(),
        data: z.object({
          title: z.string().optional(),
          responsibleUser: z.string().optional(),
          category: z.enum(["Tec", "Org"]),
          assignedDate: z.date(),
        }),
      })
    )
    .mutation(async (opts) => {
      const { projectId, requirementId, data } = opts.input;
      return opts.ctx.services.project.editRequirement(projectId, requirementId, data);
    }),

  addRequirement: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        data: z.object({
          title: z.string(),
          responsibleUser: z.string(),
          category: z.enum(["Tec", "Org"]),
          assignedDate: z.date(),
        }),
      })
    )
    .mutation(async (opts) => {
      const { projectId, data } = opts.input;
      return opts.ctx.services.project.addRequirement(projectId, data);
    }),
});

export default requirementsRouter;