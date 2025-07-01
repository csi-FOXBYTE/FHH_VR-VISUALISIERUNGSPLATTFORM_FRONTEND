"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { Permissions } from "@/constants/permissions";

export function useIsPermitted(neededPermissions: Permissions[]) {
  const session = useSession();

  const isPermitted = useMemo(() => {
    if (!session.data) return false;

    return neededPermissions.every((neededPermission) =>
      session.data.user.permissions.has(neededPermission)
    );
  }, [neededPermissions, session.data]);

  return isPermitted;
}
