import { z } from "zod";
import { protectedProcedure, router } from "..";

const eventsRouter = router({
  list: protectedProcedure.query(async (opts) => {
    const events = await opts.ctx.db.event.findMany({
      select: {
        id: true,
        creator: {
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
        event.creator.id === opts.ctx.session.user.id ? "MODERATOR" : "GUEST",
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
          label: attendee.user.name ?? attendee.user.email,
          value: attendee.user.id,
        })),
        project: event.project?.title !== undefined && event.project?.id !== undefined ? { label: event.project?.title, value: event.project?.id } : null,
      };
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
        .map((user) => ({ label: user.name ?? user.email, value: user.id }));
    }),
  getPossibleProjects: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async (opts) => {
      return (
        await opts.ctx.db.project.findMany({
          take: 50,
          where: {
            OR: [{ title: { contains: opts.input.search } }],
          },
          select: {
            title: true,
            id: true,
          },
        })
      ).map((project) => ({ label: project.title, value: project.id }));
    }),
  create: protectedProcedure
    .input(
      z.object({
        endTime: z.date(),
        startTime: z.date(),
        title: z.string(),
        attendees: z.array(z.string()),
        project: z.string().optional().nullable(),
      })
    )
    .mutation(async (opts) => {
      const { attendees, endTime, startTime, title, project } = opts.input;

      return await opts.ctx.db.event.create({
        data: {
          endTime,
          startTime,
          status: "PLANNED",
          title,
          project: project ? { connect: { id: project } } : undefined,
          attendees: {
            createMany: {
              data: attendees.map((attendee) => ({ userId: attendee })),
            },
          },
          creator: {
            connect: {
              id: opts.ctx.session.user.id,
            },
          },
        },
      });
    }),
  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      return await opts.ctx.db.event.update({
        where: {
          id: opts.input.id,
        },
        data: {
          status: "CANCELED",
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        endTime: z.date().optional(),
        startTime: z.date().optional(),
        title: z.string().optional(),
        attendees: z.array(z.string()).optional(),
        project: z.string().optional().nullable(),
      })
    )
    .mutation(async (opts) => {
      const { attendees, endTime, startTime, title, id, project } = opts.input;

      return await opts.ctx.db.event.update({
        where: {
          id,
          status: "PLANNED",
        },
        data: {
          endTime,
          startTime,
          status: "PLANNED",
          title,
          project:
            project === undefined
              ? undefined
              : project === null
              ? { disconnect: {} }
              : { connect: { id: project } },
          attendees: attendees
            ? {
                deleteMany: {},
                createMany: {
                  data: attendees.map((attendee) => ({ userId: attendee })),
                },
              }
            : undefined,
          creator: {
            connect: {
              id: opts.ctx.session.user.id,
            },
          },
        },
      });
    }),
});

export default eventsRouter;
