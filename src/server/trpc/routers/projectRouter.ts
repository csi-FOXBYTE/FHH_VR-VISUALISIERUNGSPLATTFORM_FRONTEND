import { z } from "zod";
import { protectedProcedure, router } from "..";

const projectRouter = router({
  getProjectRequirements: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async (opts) => {
      return opts.ctx.db.project.findFirstOrThrow({
        where: {
          id: opts.input.projectId,
        },
        select: {
          id: true,
          requirements: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              assignedToUser: {
                select: {
                  name: true,
                },
              },
              requirementCategory: true,
            },
          },
        },
      });
    }),

  searchBuildingNumber: protectedProcedure([])
    .input(z.object({ name: z.string() }))
    .query(async (opts) => {
      const buildings = await opts.ctx.db.building.findMany({
        take: 10,
        skip: 0,
        orderBy: {
          name: "asc",
        },
        select: {
          name: true,
          id: true,
        },
        where: {
          name: {
            contains: opts.input.name,
            mode: "insensitive",
          },
        },
      });

      return buildings.map((building) => ({
        label: building.name,
        value: building.id,
      }));
    }),

  searchProjectManager: protectedProcedure([])
    .input(z.object({ name: z.string() }))
    .query(async (opts) => {
      const projects = await opts.ctx.db.project.findMany({
        take: 10,
        skip: 0,
        distinct: "projectManagerId",
        orderBy: {
          projectManager: {
            name: "asc",
          },
        },
        select: {
          projectManager: {
            select: {
              name: true,
              id: true,
            },
          },
        },
        where: {
          projectManager: {
            name: {
              contains: opts.input.name,
              mode: "insensitive",
            },
          },
        },
      });

      return projects.map((project) => ({
        label: project.projectManager.name,
        value: project.projectManager.id,
      }));
    }),

  getProjectTargets: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async (opts) => {
      return opts.ctx.db.project.findFirstOrThrow({
        where: {
          id: opts.input.projectId,
        },
        select: {
          id: true,
          targets: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });
    }),

  searchParticipants: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        name: z.string(),
      })
    )
    .query(async (opts) => {
      const participants = await opts.ctx.db.project.findFirstOrThrow({
        where: {
          id: opts.input.projectId,
        },
        select: {
          participants: {
            where: {
              name: {
                contains: opts.input.name,
                mode: "insensitive",
              },
            },
            take: 20,
            skip: 0,
            orderBy: {
              name: "asc",
            },
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return participants;
    }),
});

export default projectRouter;
