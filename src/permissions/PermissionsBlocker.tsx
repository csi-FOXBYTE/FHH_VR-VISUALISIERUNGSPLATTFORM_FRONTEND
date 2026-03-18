"use client";

import { Permissions } from "@/constants/permissions";
import { useIsPermitted } from "./useIsPermitted";
import { ReactNode } from "react";
import usePermissions from "./usePermissions";

export interface PermissionsBlockerProps {
  neededPermissions: Permissions[];
  children?: ReactNode;
  isPermitted?: boolean | ((permissions: Set<Permissions>) => boolean);
}

export function PermissionsBlocker({
  neededPermissions,
  children = null,
  isPermitted,
}: PermissionsBlockerProps) {
  const permitted = useIsPermitted(neededPermissions);

  const permissions = usePermissions();

  if (typeof isPermitted === "boolean") return isPermitted ? children : null;

  if (typeof isPermitted === "function")
    return isPermitted(new Set(permissions));

  return permitted ? children : null;
}
