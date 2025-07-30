const DEFAULT_PERMISSIONS = ["CREATE", "READ", "UPDATE", "DELETE"] as const;

export const CRUD_PERMISSIONS = {
  EVENT: [...DEFAULT_PERMISSIONS],
  EVENT_ATTENDEE: [...DEFAULT_PERMISSIONS],
  BASE_LAYER: [...DEFAULT_PERMISSIONS],
  PROJECT_LAYER: [...DEFAULT_PERMISSIONS],
  GROUP: [...DEFAULT_PERMISSIONS],
  ROLE: [...DEFAULT_PERMISSIONS],
  PERMISSION: [...DEFAULT_PERMISSIONS],
  PROJECT: [...DEFAULT_PERMISSIONS],
  CLIPPING_POLYGON: [...DEFAULT_PERMISSIONS],
  PROJECT_FILE: [...DEFAULT_PERMISSIONS],
  VISUAL_AXIS: [...DEFAULT_PERMISSIONS],
  STARTING_POINT: [...DEFAULT_PERMISSIONS],
  USER: [...DEFAULT_PERMISSIONS],
  VARIANT: [...DEFAULT_PERMISSIONS],
} as const;

export const VIEW_PERMISSION = {} as const;

export const CRUD_PERMISSIONS_SET = new Set(
  Object.entries(CRUD_PERMISSIONS).flatMap(([key, values]) =>
    values.map((value) => `${key}:${value}`)
  ) as Permissions[]
);

type PermissionsMap = typeof CRUD_PERMISSIONS;

type GetPermissions = {
  [K in keyof PermissionsMap]: `${K}:${PermissionsMap[K][number]}`;
}[keyof PermissionsMap];

export type Permissions = GetPermissions;
