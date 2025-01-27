import "server-only";

import { router } from "..";
import testRouter from "./testRouter";
import indexRouter from "./indexRouter";
import projectsOverviewRouter from "./projectsOverviewRouter";
import projectRouter from "./projectRouter";
import requirementsRouter from "./requirementsRouter";
import targetsRouter from "./targetsRouter";
import participantsRouter from "./participantsRouter";

export const appRouter = router({
  testRouter,
  indexRouter,
  projectOverviewRouter: projectsOverviewRouter,
  projectRouter: projectRouter,
  requirementsRouter: requirementsRouter,
  targetsRouter: targetsRouter,
  participantsRouter: participantsRouter,
});

export type AppRouter = typeof appRouter;
