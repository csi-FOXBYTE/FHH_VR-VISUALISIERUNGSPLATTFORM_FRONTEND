import "server-only";

import { router } from "..";
import testRouter from "./testRouter";
import indexRouter from "./indexRouter";
import projectsOverviewRouter from "./projectsOverviewRouter";
import projectRouter from "./projectRouter";
import requirementsRouter from "./requirementsRouter";
import goalsRouter from "./goalsRouter";

export const appRouter = router({
  testRouter,
  indexRouter,
  projectOverviewRouter: projectsOverviewRouter,
  projectRouter: projectRouter,
  requirementsRouter: requirementsRouter,
  goalsRouter: goalsRouter,
});

export type AppRouter = typeof appRouter;
