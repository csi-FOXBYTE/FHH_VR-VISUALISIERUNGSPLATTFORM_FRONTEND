type Roles<Permissions extends string> = {
  [roleName: string]: Permissions[];
};

export function generateRolesPermissionsMap<Permissions extends string>(
  roles: Roles<Permissions>
) {
  const rolesPermissionMap = new Map<Permissions, string[]>();

  for (const [roleName, permissions] of Array.from(Object.entries(roles))) {
    for (const permission of permissions) {
      rolesPermissionMap.set(
        permission,
        (rolesPermissionMap.get(permission) ?? []).concat(roleName)
      );
    }
  }

  return rolesPermissionMap;
}
