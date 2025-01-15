import { z } from "zod";
import { protectedProcedure, router } from "..";

const participantsRouter = router({
  getParticipant: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        participantId: z.string(),
      })
    )
    .query(async (opts) => {
      const { projectId, participantId } = opts.input;
      return opts.ctx.services.project.getParticipant(projectId, participantId);
    }),

  deleteParticipant: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        participantId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { projectId, participantId } = opts.input;
      await opts.ctx.services.project.deleteParticipant(projectId, participantId);
      return { success: true };
    }),

  addParticipant: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        data: z.object({
          name: z.string(),
          email: z.string(),
          role: z.enum(['admin', 'user']),
        }),
      })
    )
    .mutation(async (opts) => {
      const { projectId, data } = opts.input;
      return opts.ctx.services.project.addParticipant(projectId, data);
    }),
});

export default participantsRouter;