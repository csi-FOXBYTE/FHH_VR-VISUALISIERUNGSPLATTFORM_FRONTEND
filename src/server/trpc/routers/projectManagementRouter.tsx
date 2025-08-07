import { dataGridZod } from "@/components/dataGridServerSide/zodTypes";
import { protectedProcedure, router } from "..";
import { z } from "zod";

const projectManagementRouter = router({
  listMyProjects: protectedProcedure.input(dataGridZod).query(
    async (opts) =>
      await opts.ctx.db.project.paginate(
        {
          where: {
            ownerId: opts.ctx.session.user.id,
          },
          select: {
            id: true,
            description: true,
            title: true,
            visibleForUsers: {
              select: {
                name: true,
              },
            },
            owner: {
              select: {
                name: true,
              },
            },
            visibleForGroups: {
              select: {
                name: true,
              },
            },
          },
        },
        opts.input
      )
  ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        visibleForUsers: z.array(z.string()),
        visibleForGroups: z.array(z.string()),
        owner: z.string(),
      })
    )
    .mutation(async (opts) => {
      return await opts.ctx.db.project.update({
        where: {
          owner: {
            id: opts.ctx.session.user.id,
          },
          id: opts.input.id,
        },
        data: {
          owner: {
            connect: { id: opts.input.owner },
          },
          title: opts.input.title,
          description: opts.input.description,
          visibleForGroups: {
            set: opts.input.visibleForGroups.map((id) => ({ id })),
          },
          visibleForUsers: {
            set: opts.input.visibleForUsers.map((id) => ({ id })),
          },
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        visibleForUsers: z.array(z.string()),
        visibleForGroups: z.array(z.string()),
        owner: z.string(),
      })
    )
    .mutation(async (opts) => {
      return await opts.ctx.db.project.create({
        data: {
          owner: {
            connect: {
              id: opts.input.owner,
            },
          },
          description: opts.input.description,
          title: opts.input.title,
          visibleForGroups: {
            connect: opts.input.visibleForGroups.map((id) => ({ id })),
          },
          visibleForUsers: {
            connect: opts.input.visibleForUsers.map((id) => ({ id })),
          },
        },
        select: {
          id: true,
        },
      });
    }),
  getFullEntry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async (opts) => {
      const fullEntry = await opts.ctx.db.project.findFirstOrThrow({
        where: {
          id: opts.input.id,
        },
        select: {
          title: true,
          description: true,
          visibleForUsers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          owner: {
            select: {
              name: true,
              id: true,
              email: true,
            },
          },
          visibleForGroups: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        ...fullEntry,
        visibleForGroups: fullEntry.visibleForGroups.map((v) => ({
          label: v.name,
          value: v.id,
        })),
        visibleForUsers: fullEntry.visibleForUsers.map((v) => ({
          label: v.name,
          value: v.id,
        })),
        owner: {
          label: `${fullEntry.owner?.name} (${fullEntry.owner?.email})`,
          value: fullEntry.owner?.id ?? "",
        },
      };
    }),
  getPossibleUsers: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async (opts) => {
      const possibleUsers = await opts.ctx.db.user.findMany({
        take: 50,
        where: {
          OR: [
            {
              name: {
                contains: opts.input.search,
              },
            },
            {
              email: {
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
      });

      return possibleUsers.map((p) => ({
        label: `${p.name} (${p.email})`,
        value: p.id,
      }));
    }),
  getPossibleGroups: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async (opts) => {
      const possibleGroups = await opts.ctx.db.group.findMany({
        take: 50,
        where: {
          OR: [
            {
              name: {
                contains: opts.input.search,
              },
            },
          ],
        },
        select: {
          name: true,
          id: true,
        },
      });

      return possibleGroups.map((p) => ({
        label: p.name,
        value: p.id,
      }));
    }),
  listSharedProjects: protectedProcedure.input(dataGridZod).query(
    async (opts) =>
      await opts.ctx.db.project.paginate(
        {
          where: {
            AND: [
              {
                ownerId: {
                  not: opts.ctx.session.user.id,
                },
              },
              {
                OR: [
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
            id: true,
            description: true,
            title: true,
            owner: {
              select: {
                name: true,
              },
            },
            visibleForUsers: {
              select: {
                name: true,
              },
            },
            visibleForGroups: {
              select: {
                name: true,
              },
            },
          },
        },
        opts.input
      )
  ),
});

export default projectManagementRouter;
