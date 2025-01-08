import "server-only";

import { EventBusImpl } from "./EventBus";
import type { EventMap } from "./EventMap";

const eventBusSingleton = () => {
  return new EventBusImpl<EventMap>();
};

declare const globalThis: {
  eventBus: ReturnType<typeof eventBusSingleton>;
} & typeof global;

const eventBus = globalThis.eventBus ?? eventBusSingleton();

export default eventBus;

export type EventBus = typeof eventBus;

if (process.env.NODE_ENV !== "production") globalThis.eventBus = eventBus;
