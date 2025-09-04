import { z } from "zod";
import { protectedProcedure, router } from "..";
import dayjs from "dayjs";

const eventsRouter = router({
  list: protectedProcedure.query(async (opts) => {
    const events = await opts.ctx.db.event.findMany({
      where: {
        startTime: {
          gte: dayjs().hour(0).minute(0).millisecond(0).second(0).toISOString(),
        },
        OR: [
          {
            ownerId: opts.ctx.session.user.id,
          },
          {
            attendees: {
              some: {
                userId: opts.ctx.session.user.id,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        owner: {
          select: {
            name: true,
            id: true,
          },
        },
        title: true,
        endTime: true,
        startTime: true,
        attendees: {
          select: {
            user: {
              select: { name: true, id: true },
            },
          },
        },
        projectId: true,
        status: true,
        joinCode: true,
      },
    });

    return events.map((event) => ({
      ...event,
      role:
        event.owner?.id === opts.ctx.session.user.id ? "MODERATOR" : "GUEST",
    }));
  }),
  getEventDetails: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async (opts) => {
      const event = await opts.ctx.db.event.findFirstOrThrow({
        where: {
          id: opts.input.id,
        },
        select: {
          startTime: true,
          endTime: true,
          title: true,
          project: {
            select: {
              id: true,
              title: true,
            },
          },
          attendees: {
            select: {
              role: true,
              user: {
                select: {
                  name: true,
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return {
        ...event,
        attendees: event.attendees.map((attendee) => ({
          label: `${attendee.user.name} (${attendee.user.email})`,
          value: attendee.user.id,
        })),
        moderators: event.attendees
          .filter((attendee) => attendee.role === "MODERATOR")
          .map((attendee) => ({
            label: `${attendee.user.name} (${attendee.user.email})`,
            value: attendee.user.id,
          })),
        project:
          event.project?.title !== undefined && event.project?.id !== undefined
            ? { label: event.project?.title, value: event.project?.id }
            : null,
      };
    }),
  getPossibleModerators: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async (opts) => {
      return (
        await opts.ctx.db.user.findMany({
          take: 50,
          where: {
            OR: [
              {
                email: {
                  contains: opts.input.search,
                },
              },
              {
                name: {
                  contains: opts.input.search,
                },
              },
            ],
          },
          select: {
            name: true,
            email: true,
            id: true,
          },
        })
      )
        .filter((user) => user.id !== opts.ctx.session.user.id)
        .map((user) => ({
          label: `${user.name} (${user.email})`,
          value: user.id,
        }));
    }),
  getPossibleAttendees: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async (opts) => {
      return (
        await opts.ctx.db.user.findMany({
          take: 50,
          where: {
            OR: [
              {
                email: {
                  contains: opts.input.search,
                },
              },
              {
                name: {
                  contains: opts.input.search,
                },
              },
            ],
          },
          select: {
            name: true,
            email: true,
            id: true,
          },
        })
      )
        .filter((user) => user.id !== opts.ctx.session.user.id)
        .map((user) => ({
          label: `${user.name} (${user.email})`,
          value: user.id,
        }));
    }),
  getPossibleProjects: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async (opts) => {
      return (
        await opts.ctx.db.project.findMany({
          take: 50,
          where: {
            AND: [
              { title: { contains: opts.input.search } },
              {
                OR: [
                  {
                    ownerId: opts.ctx.session.user.id,
                  },
                  {
                    visibleForGroups: {
                      some: {
                        assignedUsers: {
                          some: {
                            id: opts.ctx.session.user.id,
                          },
                        },
                      },
                    },
                  },
                  {
                    visibleForUsers: {
                      some: {
                        id: opts.ctx.session.user.id,
                      },
                    },
                  },
                ],
              },
            ],
          },
          select: {
            title: true,
            id: true,
          },
        })
      ).map((project) => ({ label: project.title, value: project.id }));
    }),
});

export default eventsRouter;
