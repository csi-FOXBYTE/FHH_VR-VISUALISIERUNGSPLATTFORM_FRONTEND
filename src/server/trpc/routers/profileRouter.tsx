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
  deleteUser: protectedProcedure.mutation(async (opts) => {
    // TODO: delete all user related stuff
    const user = await opts.ctx.db.user.findFirstOrThrow({ // eslint-disable-line @typescript-eslint/no-unused-vars
      where: {
        id: opts.ctx.session.user.id,
      },
      select: {
        attendedEvents: {
          select: {
            eventId: true,
            userId: true,
          },
        },
      },
    });

    return await opts.ctx.db.user.delete({
      where: {
        id: opts.ctx.session.user.id,
      },
    });
  }),
});

export default profileRouter;
