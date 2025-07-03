import { protectedProcedure, router } from "..";

const configurationRouter = router({
  getFull: protectedProcedure.query(async (opts) => {
    return await opts.ctx.db.configuration.findFirstOrThrow({
      select: {
        defaultEPSG: true,
        globalStartPointX: true,
        globalStartPointY: true,
        globalStartPointZ: true,
      },
    });
  }),
});

export default configurationRouter;
