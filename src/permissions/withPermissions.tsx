"use client";

import { Permissions } from "@/constants/permissions";
import { ComponentType } from "react";
import { useIsPermitted } from "./useIsPermitted";

export function withPermissions<T extends object>(
  WrappedComponent: ComponentType<T>,
  neededPermissions: Permissions[]
) {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithPermissions = (props: T) => {
    const permitted = useIsPermitted(neededPermissions);

    if (!permitted) {
      return <>Access denied!</>;
    }
    return <WrappedComponent {...(props as T)} />;
  };

  ComponentWithPermissions.displayName = `withPermissions(${displayName})`;

  return ComponentWithPermissions;
}
