import "server-only";

import { router } from "..";
import testRouter from "./testRouter";
import indexRouter from "./indexRouter";
import projectsOverviewRouter from "./projectsOverviewRouter";
import projectRouter from "./projectRouter";
import requirementsRouter from "./requirementsRouter";
import goalsRouter from "./goalsRouter";
import participantsRouter from "./participantsRouter";

export const appRouter = router({
  testRouter,
  indexRouter,
  projectOverviewRouter: projectsOverviewRouter,
  projectRouter: projectRouter,
  requirementsRouter: requirementsRouter,
  goalsRouter: goalsRouter,
  participantsRouter: participantsRouter,
});

export type AppRouter = typeof appRouter;
