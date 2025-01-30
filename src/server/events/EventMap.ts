import { Events, TypedEvent } from "./EventBus";

// Add new events inside here!

export interface EventMap extends Events {
  example: {
    sub: TypedEvent<{
      test: string;
    }>;
  };
  user: {
    chat: TypedEvent<{
      userId: string;
      text: string;
    }>;
  };
}
