import { trpc } from "@/server/trpc/client";
import { skipToken } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { EasyCUDialog, useEasyCUDialogState } from "../common/EasyCUDialog";

export const useVisualAxisCUDialogState = () =>
  useEasyCUDialogState("visual-axis-cu-state");

export default function VisualAxisCUDialog() {
  const t = useTranslations();

  const [state, { close }] = useVisualAxisCUDialogState();

  const { data: initialVisualAxis = null } =
    trpc.dataManagementRouter.visualAxis.getFullEntry.useQuery(
      state.open && state.mode === "UPDATE" && state.id !== undefined
        ? { id: state.id }
        : skipToken
    );

  const utils = trpc.useUtils();

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: createMutation, isPending: isCreateMutationPending } =
    trpc.dataManagementRouter.visualAxis.create.useMutation({
      onSuccess: () => {
        utils.dataManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.create-success", {
            entity: t("entities.visual-axis"),
          }),
        });
        close();
      },
      onError: () => {
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.create-failed", {
            entity: t("entities.visual-axis"),
          }),
        });
      },
    });
  const { mutate: updateMutation, isPending: isUpdateMutationPending } =
    trpc.dataManagementRouter.visualAxis.update.useMutation({
      onSuccess: () => {
        utils.dataManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.update-success", {
            entity: t("entities.visual-axis"),
          }),
        });
        close();
      },
      onError: () => {
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.update-failed", {
            entity: t("entities.visual-axis"),
          }),
        });
      },
    });

  return (
    <EasyCUDialog
      close={close}
      state={state}
      defaultData={{
        startPoint: { x: 0, y: 0, z: 0 },
        endPoint: { x: 0, y: 0, z: 0 },
        name: "",
        description: "",
      }}
      isLoading={isUpdateMutationPending || isCreateMutationPending}
      onUpdate={(data) => {
        if (!state.id) throw new Error("No id supplied!");
        updateMutation({
          endPointX: data.endPoint.x,
          endPointY: data.endPoint.y,
          endPointZ: data.endPoint.z,
          id: state.id,
          name: data.name,
          startPointX: data.startPoint.x,
          startPointY: data.startPoint.y,
          startPointZ: data.startPoint.z,
        });
      }}
      onCreate={(data) => {
        createMutation({
          endPointX: data.endPoint.x,
          endPointY: data.endPoint.y,
          endPointZ: data.endPoint.z,
          name: data.name,
          startPointX: data.startPoint.x,
          startPointY: data.startPoint.y,
          startPointZ: data.startPoint.z,
        });
      }}
      fetchedData={initialVisualAxis}
      model={[
        {
          name: "name",
          props: {
            label: t("data-mangement.title"),
            required: true,
          },
          type: "text",
        },
        {
          name: "description",
          props: {
            label: t("data-management.description"),
            required: true,
          },
          type: "text",
        },
        {
          name: "startPoint",
          props: {
            label: t("data-management.start-point"),
            required: true,
          },
          type: "georeferencedTranslation",
        },
        {
          name: "endPoint",
          props: {
            label: t("data-management.end-point"),
            required: true,
          },
          type: "georeferencedTranslation",
        },
      ]}
    />
  );
}
