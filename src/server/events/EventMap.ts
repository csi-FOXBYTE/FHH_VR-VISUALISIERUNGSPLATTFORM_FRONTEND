import { Events, TypedEvent } from "./EventBus";

// Add new events inside here!

export interface EventMap extends Events {
  example: {
    sub: TypedEvent<{}>;
  };
  user: {
    chat: TypedEvent<{
      userId: string;
      text: string;
    }>;
  };
}
