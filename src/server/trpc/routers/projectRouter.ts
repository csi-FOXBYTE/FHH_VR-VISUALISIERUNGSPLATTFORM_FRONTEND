import { z } from "zod";
import { protectedProcedure, router } from "..";

const projectRouter = router({
  getProject: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async (opts) => {
      const { projectId } = opts.input;
      return opts.ctx.services.project.getProject(projectId);
    }),
});

export default projectRouter;
