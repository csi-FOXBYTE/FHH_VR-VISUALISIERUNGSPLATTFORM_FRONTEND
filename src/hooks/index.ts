"use client";

import { trpc } from "@/server/trpc/client";

export function useEventSubscriber() {
  const utils = trpc.useUtils();

  trpc.subscriptionRouter.subscribe.useSubscription("event", {
    onData: () => utils.eventsRouter.invalidate(),
  });
}
