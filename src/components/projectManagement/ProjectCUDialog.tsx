import { trpc } from "@/server/trpc/client";
import { skipToken } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { EasyCUDialog, useEasyCUDialogState } from "../common/EasyCUDialog";
import { useTranslations } from "next-intl";
import { useRouter } from "@/server/i18n/routing";
import { useSession } from "next-auth/react";

export const useProjectCUDialogState = () =>
  useEasyCUDialogState("project-management-project-cu-state");

export default function ProjectCUDialog() {
  const t = useTranslations();

  const [state, { close }] = useProjectCUDialogState();

  const [searchUsers, setSearchUsers] = useState("");
  const [searchGroups, setSearchGroups] = useState("");
  const [searchOwners, setSearchOwners] = useState("");

  const utils = trpc.useUtils();

  const router = useRouter();

  const { data: possibleUsers = [] } =
    trpc.projectManagementRouter.getPossibleUsers.useQuery(
      state.open ? { search: searchUsers } : skipToken
    );

  const { data: possibleOwners = [] } =
    trpc.projectManagementRouter.getPossibleUsers.useQuery(
      state.open ? { search: searchOwners } : skipToken
    );

  const { data: possibleGroups = [] } =
    trpc.projectManagementRouter.getPossibleGroups.useQuery(
      state.open ? { search: searchUsers } : skipToken
    );

  const { data: initialProject = null } =
    trpc.projectManagementRouter.getFullEntry.useQuery(
      state.open && state.mode === "UPDATE" && state.id !== undefined
        ? { id: state.id }
        : skipToken
    );

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: createMutation, isPending: isCreateMutationPending } =
    trpc.projectManagementRouter.create.useMutation({
      onSuccess: ({ id }) => {
        utils.projectManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.create-success", {
            entity: t("entities.project"),
          }),
        });
        close();
        router.push(`/project-management/${id}`);
      },
      onError: (err) => {
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.create-failed", {
            entity: t("entities.project"),
          }),
        });
        console.error(err);
      },
    });
  const { mutate: updateMutation, isPending: isUpdateMutationPending } =
    trpc.projectManagementRouter.update.useMutation({
      onSuccess: () => {
        utils.projectManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.update-success", {
            entity: t("entities.project"),
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

  const session = useSession();

  return (
    <EasyCUDialog
      defaultData={{
        visibleForUsers: [] as typeof possibleUsers,
        visibleForGroups: [] as typeof possibleGroups,
        description: "",
        title: "",
        owner: {
          label: `${session.data?.user.name} (${session.data?.user.email})`,
          value: session.data?.user.id ?? "",
        },
      }}
      onCreate={(values) => {
        createMutation({
          description: values.description,
          title: values.title,
          visibleForGroups: values.visibleForGroups.map((v) => v.value),
          visibleForUsers: values.visibleForUsers.map((v) => v.value),
          owner: values.owner.value,
        });
      }}
      onUpdate={(values) => {
        if (!state.id) throw new Error("No id supplied!");

        updateMutation({
          id: state.id,
          description: values.description,
          title: values.title,
          visibleForGroups: values.visibleForGroups.map((v) => v.value),
          visibleForUsers: values.visibleForUsers.map((v) => v.value),
          owner: values.owner.value,
        });
      }}
      close={close}
      isLoading={isUpdateMutationPending || isCreateMutationPending}
      state={state}
      fetchedData={initialProject}
      model={[
        {
          type: "text",
          name: "title",
          props: {
            label: t("project-management.table-title"),
          },
        },
        {
          type: "text",
          name: "description",
          props: {
            label: t("project-management.description"),
          },
        },
        {
          type: "search",
          name: "owner",
          props: {
            onSearchChange: setSearchOwners,
            search: searchOwners,
            options: possibleOwners,
            multiple: false,
            label: t("project-management.owner"),
          },
        },
        {
          type: "search",
          name: "visibleForGroups",
          props: {
            onSearchChange: setSearchGroups,
            search: searchGroups,
            options: possibleGroups,
            multiple: true,
            label: t("project-management.visible-for-groups"),
          },
        },
        {
          type: "search",
          name: "visibleForUsers",
          props: {
            onSearchChange: setSearchUsers,
            search: searchUsers,
            options: possibleUsers,
            multiple: true,
            label: t("project-management.visible-for-users"),
          },
        },
      ]}
    />
  );
}
