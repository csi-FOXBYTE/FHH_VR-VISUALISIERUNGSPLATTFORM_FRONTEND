import "server-only"; // <-- ensure this file cannot be imported from the client

import { makeQueryClient } from "./queryClient";
import { appRouter, type AppRouter } from "./routers";
import { createCallerFactory, createTRPCContext } from ".";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
const getQueryClient = cache(makeQueryClient);
const caller = createCallerFactory(appRouter)(createTRPCContext);

export const { HydrateClient, trpc } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient
);
