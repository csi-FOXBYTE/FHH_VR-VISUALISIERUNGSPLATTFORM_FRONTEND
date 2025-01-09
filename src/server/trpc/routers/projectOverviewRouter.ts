import { protectedProcedure, router } from "..";

const projectOverviewRouter = router({
    getProjects: protectedProcedure([]).query(async opts => {
        return opts.ctx.services.project.getProjects();
    }),
});

export default projectOverviewRouter;