"use client";

import { Permissions } from "@/constants/permissions";
import { useIsPermitted } from "./useIsPermitted";
import { ReactNode } from "react";

export interface PermissionsBlockerProps {
  neededPermissions: Permissions[];
  children?: ReactNode;
}

export function PermissionsBlocker({
  neededPermissions,
  children = null,
}: PermissionsBlockerProps) {
  const isPermitted = useIsPermitted(neededPermissions);

  return isPermitted ? children : null;
}
