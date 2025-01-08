import { Subject, filter } from "rxjs";

export type Events = {
  [key: string]: Event<any>;
};

export type TypedEvent<Payload extends Record<string, any>> = {
  payload: Payload;
};

type Event<Payload extends Record<string, any>> = Record<string, Payload>;

type InternalEvents<
  K extends keyof E,
  E extends Events,
  T extends keyof E[K]
> = {
  type: T;
  payload: E[K][T]["payload"];
  id: string;
};

type EmitOptions = {};
type OnOptions = {};

export class EventBusImpl<E extends { [key: string]: Events }> {
  private readonly _subjects: {
    [K in keyof E]?: Subject<InternalEvents<K, E, keyof E[K]>>;
  } = {};

  emit<K extends keyof E, T extends keyof E[K]>(
    event: K,
    type: T,
    payload: E[K][T]["payload"],
    opts?: EmitOptions
  ): void {
    if (!this._subjects[event])
      this._subjects[event] = new Subject<InternalEvents<K, E, keyof E[K]>>();
    this._subjects[event]!.next({ type, payload, id: crypto.randomUUID() });
  }

  on<K extends keyof E>(event: K, opts?: OnOptions) {
    if (!this._subjects[event])
      this._subjects[event] = new Subject<InternalEvents<K, E, keyof E[K]>>();

    return this._subjects[event]!.asObservable();
  }

  onType<K extends keyof E, T extends keyof E[K]>(
    event: K,
    type: T,
    opts?: OnOptions
  ) {
    if (!this._subjects[event])
      this._subjects[event] = new Subject<InternalEvents<K, E, keyof E[K]>>();

    return this._subjects[event]!.asObservable().pipe(
      filter((event) => event.type === type)
    );
  }
}
