import { z } from "zod";
import { protectedProcedure, router } from "..";

const configurationRouter = router({
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        defaultEPSG: z.string().optional(),
        globalStartPointX: z.number().optional(),
        globalStartPointY: z.number().optional(),
        globalStartPointZ: z.number().optional(),
        invitationEmailText: z.string().optional(),
        localProcessorFolder: z.string().optional(),
        maxParallelBaseLayerConversions: z.number().optional(),
        maxParallelFileConversions: z.number().optional(),
        invitationCancelledEmailDE: z.string().optional(),
        invitationCancelledEmailEN: z.string().optional(),
        invitationEmailDE: z.string().optional(),
        invitationEmailEN: z.string().optional(),
        invitationUpdatedEmailDE: z.string().optional(),
        invitationUpdatedEmailEN: z.string().optional(),
        predeletionEmailDE: z.string().optional(),
        predeletionEmailEN: z.string().optional(),
      })
    )
    .mutation(async (opts) => {
      const { id, ...data } = opts.input;
      return await opts.ctx.db.configuration.update({
        where: {
          id,
        },
        data
      });
    }),
  getFull: protectedProcedure.query(async (opts) => {
    return await opts.ctx.db.configuration.findFirstOrThrow({
    });
  }),
});

export default configurationRouter;
