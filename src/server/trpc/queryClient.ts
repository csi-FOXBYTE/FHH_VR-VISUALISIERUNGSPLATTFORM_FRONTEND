import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "./superJSON";

export function shouldRetryQuery(failureCount: number, error: unknown) {
  if (failureCount >= 1) return false;
  const status = (
    error as {
      data?: { httpStatus?: number };
      shape?: { data?: { httpStatus?: number } };
    }
  ).data?.httpStatus ??
    (
      error as {
        shape?: { data?: { httpStatus?: number } };
      }
    ).shape?.data?.httpStatus;
  return status === undefined || status >= 500;
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: shouldRetryQuery,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
}
