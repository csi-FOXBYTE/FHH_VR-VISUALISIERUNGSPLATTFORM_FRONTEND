import { trpc } from "@/server/trpc/client";
import { skipToken } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { EasyCUDialog, useEasyCUDialogState } from "../common/EasyCUDialog";
import { useTranslations } from "next-intl";

export const useGroupCUDialogState = () =>
  useEasyCUDialogState("user-management-group-cu-state");

export default function GroupCUDialog() {
  const t = useTranslations();

  const [state, { close }] = useGroupCUDialogState();

  const [searchRoles, setSearchRoles] = useState("");

  const utils = trpc.useUtils();

  const { data: possibleRoles = [] } =
    trpc.userManagementRouter.groups.getPossibleRoles.useQuery(
      state.open ? { search: searchRoles } : skipToken
    );

  const { data: initialUser = null } =
    trpc.userManagementRouter.groups.getFullEntry.useQuery(
      state.open && state.mode === "UPDATE" && state.id !== undefined
        ? { id: state.id }
        : skipToken
    );

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: createMutation, isPending: isCreateMutationPending } =
    trpc.userManagementRouter.groups.create.useMutation({
      onSuccess: () => {
        utils.userManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.create-success", {
            entity: t("entities.group"),
          }),
        });
        close();
      },
      onError: (err) => {
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.create-failed", {
            entity: t("entities.group"),
          }),
        });
        console.error(err);
      },
    });
  const { mutate: updateMutation, isPending: isUpdateMutationPending } =
    trpc.userManagementRouter.groups.update.useMutation({
      onSuccess: () => {
        utils.userManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.update-success", {
            entity: t("entities.group"),
          }),
        });
        close();
      },
      onError: () =>
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.update-failed", {
            entity: t("entities.group"),
          }),
        }),
    });

  return (
    <EasyCUDialog
      defaultData={{
        assignedRoles: [] as typeof possibleRoles,
        defaultFor: "",
        name: "",
      }}
      onCreate={(values) => {
        createMutation({
          assignedRoles: values.assignedRoles.map(
            (assignedRole) => assignedRole.value
          ),
          name: values.name,
          defaultFor: values.defaultFor ?? "",
        });
      }}
      onUpdate={(values) => {
        if (!state.id) throw new Error("No id supplied!");
        updateMutation({
          assignedRoles: values.assignedRoles.map(
            (assignedRole) => assignedRole.value
          ),
          id: state.id,
          name: values.name,
          defaultFor: values.defaultFor ?? "",
        });
      }}
      close={close}
      isLoading={isUpdateMutationPending || isCreateMutationPending}
      state={state}
      fetchedData={initialUser}
      model={[
        {
          type: "text",
          name: "name",
          props: {
            label: t("user-management.name"),
            required: true,
          },
        },
        {
          type: "text",
          name: "defaultFor",
          props: {
            label: t("user-management.default-for"),
          },
        },
        {
          type: "search",
          name: "assignedRoles",
          props: {
            onSearchChange: setSearchRoles,
            search: searchRoles,
            options: possibleRoles,
            multiple: true,
            label: t("user-management.assigned-roles"),
          },
        },
      ]}
    />
  );
}
