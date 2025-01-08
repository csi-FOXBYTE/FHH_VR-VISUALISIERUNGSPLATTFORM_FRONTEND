import "server-only";

import { router } from "..";
import testRouter from "./testRouter";

export const appRouter = router({
  testRouter,
});

export type AppRouter = typeof appRouter;
