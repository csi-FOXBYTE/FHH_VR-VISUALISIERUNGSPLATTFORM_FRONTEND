import { generateRolesPermissionsMap } from "../lib/roles";
import type { GeneratedPermissions } from "./permissions";

export const generatedRolesPermissionMap =
  generateRolesPermissionsMap<GeneratedPermissions>({
    admin: ["project:create"],
    basic: [],
  } as const);

export type GeneratedRolesPermissionMap = typeof generatedRolesPermissionMap;
