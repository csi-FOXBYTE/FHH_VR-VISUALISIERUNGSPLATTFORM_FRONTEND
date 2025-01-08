type P = {
  [key: string]: P | null;
};

export type Flatten<T> = T extends (infer S)[] ? S : never;

type Decrement<N extends number> = N extends 0
  ? 0
  : N extends 1
  ? 0
  : N extends 2
  ? 1
  : N extends 3
  ? 2
  : N extends 4
  ? 3
  : N extends 5
  ? 4
  : // extend if needed
    0;

/**
 * A safer version of ExtractPermissions that stops recursing after `Depth` levels.
 */
type ExtractPermissions<T extends P, Depth extends number = 5> = [
  Depth
] extends [0]
  ? never // If no more depth, stop recursing
  : {
      [K in keyof T & string]: T[K] extends P
        ? `${K}:${ExtractPermissions<T[K], Decrement<Depth>>}`
        : K;
    }[keyof T & string];

function extractPermissions(
  permissions: P,
  array: string[],
  prefixes: string[]
) {
  for (const [key, permission] of Array.from(Object.entries(permissions))) {
    if (permission === null) {
      array.push(prefixes.concat(key).join(":"));
    } else {
      extractPermissions(permission, array, prefixes.concat(key));
    }
  }
}

export function generatePermissions<S extends P>(
  permissions: S
): ExtractPermissions<S>[] {
  const extractedPermissions: string[] = [];

  extractPermissions(permissions, extractedPermissions, []);

  return extractedPermissions as any;
}
