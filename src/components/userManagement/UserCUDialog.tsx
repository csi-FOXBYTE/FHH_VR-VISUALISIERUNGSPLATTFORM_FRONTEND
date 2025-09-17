import { trpc } from "@/server/trpc/client";
import { skipToken } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { EasyCUDialog, useEasyCUDialogState } from "../common/EasyCUDialog";
import { useTranslations } from "next-intl";

export const useUserCUDialogState = () =>
  useEasyCUDialogState("user-management-user-cu-state");

export default function UserCUDialog() {
  const t = useTranslations();

  const [state, { close }] = useUserCUDialogState();

  const [searchGroups, setSearchGroups] = useState("");

  const utils = trpc.useUtils();

  const { data: possibleGroups = [] } =
    trpc.userManagementRouter.users.getPossibleGroups.useQuery(
      state.open ? { search: searchGroups } : skipToken
    );

  const { data: initialUser = null, isPending: isInitialDataPending } =
    trpc.userManagementRouter.users.getFullUser.useQuery(
      state.open && state.mode === "UPDATE" && state.id !== undefined
        ? { id: state.id }
        : skipToken
    );

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: createMutation, isPending: isCreateMutationPending } =
    trpc.userManagementRouter.users.create.useMutation({
      onSuccess: () => {
        utils.userManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.create-success", {
            entity: t("entities.user"),
          }),
        });
        close();
      },
      onError: () => {
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.create-failed", {
            entity: t("entities.user"),
          }),
        });
      },
    });
  const { mutate: updateMutation, isPending: isUpdateMutationPending } =
    trpc.userManagementRouter.users.update.useMutation({
      onSuccess: () => {
        utils.userManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.update-success", {
            entity: t("entities.user"),
          }),
        });
        close();
      },
      onError: () =>
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.update-failed", {
            entity: t("entities.user"),
          }),
        }),
    });

  return (
    <EasyCUDialog
      defaultData={{
        assignedGroups: [] as typeof possibleGroups,
        email: "",
      }}
      onCreate={(values) => {
        createMutation({
          assignedGroups: values.assignedGroups.map(
            (assignedGroup) => assignedGroup.value
          ),
          email: values.email,
        });
      }}
      onUpdate={(values) => {
        if (!state.id) throw new Error("No id supplied!");
        updateMutation({
          assignedGroups: values.assignedGroups.map(
            (assignedGroup) => assignedGroup.value
          ),
          id: state.id,
        });
      }}
      close={close}
      isLoading={
        isUpdateMutationPending ||
        isCreateMutationPending ||
        (isInitialDataPending && state.mode !== "CREATE")
      }
      state={state}
      fetchedData={initialUser}
      model={
        state.mode === "CREATE"
          ? [
              {
                type: "text",
                name: "email",
                props: {
                  label: t("user-management.email"),
                  required: true,
                },
              },
              {
                type: "search",
                name: "assignedGroups",
                props: {
                  onSearchChange: setSearchGroups,
                  search: searchGroups,
                  options: possibleGroups,
                  multiple: true,
                  label: t("user-management.assigned-groups"),
                },
              },
            ]
          : [
              {
                type: "search",
                name: "assignedGroups",
                props: {
                  onSearchChange: setSearchGroups,
                  search: searchGroups,
                  options: possibleGroups,
                  multiple: true,
                  label: t("user-management.assigned-groups"),
                },
              },
            ]
      }
    />
  );
}
