import { z } from "zod";
import { protectedProcedure, router } from "..";

const projectsOverviewRouter = router({
  getProjects: protectedProcedure([])
    .input(
      z.object({
        limit: z.number().optional(),
        skip: z.number().optional(),
        filter: z.record(z.string(), z.string()).optional(),
        search: z.record(z.string(), z.string()).optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      })
    )
    .query(async (opts) => {
      return opts.ctx.services.project.getProjects({
        limit: opts.input.limit,
        skip: opts.input.skip,
        filter: opts.input.filter,
        search: opts.input.search,
        sortBy: opts.input.sortBy,
        sortOrder: opts.input.sortOrder,
      });
    }),
});

export default projectsOverviewRouter;
