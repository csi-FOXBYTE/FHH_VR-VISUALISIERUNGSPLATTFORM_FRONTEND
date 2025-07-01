"use client";

import { useSnackbar } from "notistack";
import { useMemo } from "react";

export function useDefaultMutationNotifications(
  entityName: string,
  action: "update" | "create" | "delete"
) {
  const { enqueueSnackbar } = useSnackbar();

  return useMemo(
    () => ({
      onSuccess: () =>
        enqueueSnackbar({
          variant: "success",
          message: `Successfully ${action}d ${entityName}!`,
        }),
      onError: (err: unknown) => {
        enqueueSnackbar({
          variant: "error",
          message: `Failed to ${action} ${entityName}!`,
        });
        console.error(err);
      },
    }),
    []
  );
}
