import "server-only";

import { router } from "..";
import testRouter from "./testRouter";
import indexRouter from "./indexRouter";
import projectOverviewRouter from "./projectOverviewRouter";

export const appRouter = router({
  testRouter,
  indexRouter,
  projectOverviewRouter,
});

export type AppRouter = typeof appRouter;
