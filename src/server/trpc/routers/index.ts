import "server-only";

import { router } from "..";
import dataManagementRouter from "./dataManagementRouter";
import eventsRouter from "./eventsRouter";
import myAreaRouter from "./myAreaRouter";
import projectManagementRouter from "./projectManagementRouter";
import projectRouter from "./projectRouter";
import subscriptionRouter from "./subscriptionRouter";
import userManagementRouter from "./userManagementRouter";

export const appRouter = router({
  myAreaRouter,
  projectRouter,
  projectManagementRouter,
  eventsRouter,
  subscriptionRouter,
  dataManagementRouter,
  userManagementRouter,
});

export type AppRouter = typeof appRouter;
