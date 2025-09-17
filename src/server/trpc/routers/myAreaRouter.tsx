import dayjs from "dayjs";
import { protectedProcedure, router } from "..";

const userInfoRouter = router({
  getLastLogin: protectedProcedure.query(async (opts) => {
    return await opts.ctx.db.session.findFirstOrThrow({
      select: {
        updatedAt: true,
      },
      where: {
        userId: opts.ctx.session.user.id,
      },
    });
  }),
  getTodaysEvents: protectedProcedure.query(async (opts) => {
    return await opts.ctx.db.event.findMany({
      orderBy: {
        startTime: "asc",
      },
      where: {
        startTime: {
          gt: dayjs().hour(0).minute(0).millisecond(0).second(0).toDate(),
          lt: dayjs().hour(23).minute(59).millisecond(999).second(59).toDate(),
        },
        status: {
          not: "CANCELED",
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        title: true,
        status: true,
      },
    });
  }),
});

export default userInfoRouter;
