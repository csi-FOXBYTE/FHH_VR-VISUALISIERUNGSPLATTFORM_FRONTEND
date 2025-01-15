import { z } from "zod";
import { protectedProcedure, router } from "..";

const goalsRouter = router({
  getGoal: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        goalId: z.string(),
      })
    )
    .query(async (opts) => {
      const { projectId, goalId } = opts.input;
      return opts.ctx.services.project.getGoal(projectId, goalId);
    }),

  deleteGoal: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        goalId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { projectId, goalId } = opts.input;
      await opts.ctx.services.project.deleteGoal(projectId, goalId);
      return { success: true };
    }),

  editGoal: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        goalId: z.string(),
        data: z.object({
          title: z.string().optional(),
          responsibleUser: z.string().optional(),
          category: z.enum(['Schedule', 'Cost', 'Performance']),
          assignedDate: z.date(),
        }),
      })
    )
    .mutation(async (opts) => {
      const { projectId, goalId, data } = opts.input;
      return opts.ctx.services.project.editGoal(projectId, goalId, data);
    }),

  addGoal: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        data: z.object({
          title: z.string(),
          responsibleUser: z.string(),
          category: z.enum(['Schedule', 'Cost', 'Performance']),
          assignedDate: z.date(),
          history: z.array(
            z.object({
              date: z.date(),
              changeDate: z.date(),
              title: z.string(),
              responsibleUser: z.string(),
              category: z.enum(['Schedule', 'Cost', 'Performance']),
            })
          ).default([]),
        }),
      })
    )
    .mutation(async (opts) => {
      const { projectId, data } = opts.input;
      return opts.ctx.services.project.addGoal(projectId, data);
    }),
});

export default goalsRouter;