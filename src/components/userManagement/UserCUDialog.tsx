import { trpc } from "@/server/trpc/client";
import { skipToken } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { EasyCUDialog } from "../common/EasyCUDialog";

export default function UserCUDialog({
  open,
  close,
  mode,
  id,
}: {
  open: boolean;
  close: () => void;
  mode: "CREATE" | "UPDATE";
  id?: string;
}) {
  const [searchGroups, setSearchGroups] = useState("");

  const { data: possibleGroups = [] } =
    trpc.userManagementRouter.users.getPossibleGroups.useQuery(
      open ? { search: searchGroups } : skipToken
    );

  const { data: initialUser = null } =
    trpc.userManagementRouter.users.getFullUser.useQuery(
      open && mode === "UPDATE" && id !== undefined ? { id } : skipToken
    );

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: createMutation, isPending: isCreateMutationPending } =
    trpc.userManagementRouter.users.create.useMutation({
      onSuccess: () =>
        enqueueSnackbar({
          variant: "success",
          message: "Successfully created event!",
        }),
      onError: (err) => {
        enqueueSnackbar({
          variant: "error",
          message: "Failed to create event!",
        });
        console.error(err);
      },
    });
  const { mutate: updateMutation, isPending: isUpdateMutationPending } =
    trpc.userManagementRouter.users.update.useMutation({
      onSuccess: () =>
        enqueueSnackbar({
          variant: "success",
          message: "Successfully updated event!",
        }),
      onError: () =>
        enqueueSnackbar({
          variant: "error",
          message: "Failed to update event!",
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
        if (!id) throw new Error("No id supplied!");
        updateMutation({
          assignedGroups: values.assignedGroups.map(
            (assignedGroup) => assignedGroup.value
          ),
          id,
        });
      }}
      close={close}
      entity="Project"
      isLoading={isUpdateMutationPending || isCreateMutationPending}
      open={open}
      mode="CREATE"
      fetchedData={initialUser}
      model={
        mode === "CREATE"
          ? [
              {
                type: "text",
                name: "email",
                props: {
                  label: "Email",
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
                  label: "Assigned groups",
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
                  label: "Assigned groups",
                },
              },
            ]
      }
    />
  );
}
