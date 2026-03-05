import "server-only";

import { router } from "..";
import dataManagementRouter from "./dataManagementRouter";
import eventsRouter from "./eventsRouter";
import myAreaRouter from "./myAreaRouter";
import projectManagementRouter from "./projectManagementRouter";
import userManagementRouter from "./userManagementRouter";
import profileRouter from "./profileRouter";
import configurationRouter from "./configurationRouter";

export const appRouter = router({
  myAreaRouter,
  projectManagementRouter,
  eventsRouter,
  dataManagementRouter,
  userManagementRouter,
  profileRouter,
  configurationRouter,
});

export type AppRouter = typeof appRouter;
