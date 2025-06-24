import "server-only";

import { router } from "..";
import myAreaRouter from "./myAreaRouter";
import projectRouter from "./projectRouter";
import projectManagementRouter from "./projectManagementRouter";
import eventsRouter from "./eventsRouter";
import subscriptionRouter from "./subscriptionRouter";

export const appRouter = router({
    myAreaRouter,
    projectRouter,
    projectManagementRouter,
    eventsRouter,
    subscriptionRouter,
});

export type AppRouter = typeof appRouter;
