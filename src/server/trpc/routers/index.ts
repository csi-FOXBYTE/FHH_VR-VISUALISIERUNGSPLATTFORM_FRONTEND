import "server-only";

import { router } from "..";
import testRouter from "./testRouter";
import indexRouter from "./indexRouter";
import projectsOverviewRouter from "./projectsOverviewRouter";
import projectRouter from "./projectRouter";

export const appRouter = router({
  testRouter,
  indexRouter,
  projectOverviewRouter: projectsOverviewRouter,
  projectRouter: projectRouter,
});

export type AppRouter = typeof appRouter;
