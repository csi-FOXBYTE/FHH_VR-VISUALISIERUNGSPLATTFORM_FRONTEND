import { z } from "zod";
import { protectedProcedure, router } from "..";

const participantsRouter = router({
  // getParticipants: protectedProcedure([])
  //   .input(
  //     z.object({
  //       projectId: z.string(),
  //       participantId: z.string(),
  //     })
  //   )
  //   .query(async (opts) => {
  //     const { projectId, participantId } = opts.input;
  //     return opts.ctx.db.user .user.participants.(projectId, participantId);
  //   }),



  // deleteParticipant: protectedProcedure([])
  //   .input(
  //     z.object({
  //       projectId: z.string(),
  //       participantId: z.string(),
  //     })
  //   )
  //   .mutation(async (opts) => {
  //     const { projectId, participantId } = opts.input;
  //     await opts.ctx.services.project.deleteParticipant(projectId, participantId);
  //     return { success: true };
  //   }),

  // addParticipants: protectedProcedure([])
  //   .input(
  //     z.object({
  //       projectId: z.string(),
  //       participants: z.array(
  //         z.object({
  //           name: z.string(),
  //           email: z.string(),
  //           role: z.enum(['admin', 'user']),
  //         })
  //       ),
  //     })
  //   )
  //   .mutation(async (opts) => {
  //     const { projectId, participants } = opts.input;
  //     const addedParticipants = await Promise.all(
  //       await opts.ctx.services.project.addParticipants(projectId, participants)
  //     );
  //     return addedParticipants;
  //   }),

});

export default participantsRouter;