import { z } from "zod";
import { protectedProcedure, router } from "..";

const projectRouter = router({

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
});

export default projectRouter;
