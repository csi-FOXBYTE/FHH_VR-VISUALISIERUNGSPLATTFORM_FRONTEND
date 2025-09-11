import { protectedProcedure, router } from "..";

const profileRouter = router({
  getInfo: protectedProcedure.query(async (opts) => {
    return await opts.ctx.db.user.findFirstOrThrow({
      where: {
        id: opts.ctx.session.user.id,
      },
      select: {
        assignedGroups: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
  }),
});

export default profileRouter;
