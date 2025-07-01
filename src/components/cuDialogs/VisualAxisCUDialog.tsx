import { trpc } from "@/server/trpc/client";
import { skipToken } from "@tanstack/react-query";
import { EasyCUDialog } from "../common/EasyCUDialog";
import { useDefaultMutationNotifications } from "../mutationHelpers";

export default function VisualAxisCUDialog({
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
  const { data: initialVisualAxis = null } =
    trpc.dataManagementRouter.getVisualAxis.useQuery(
      open && mode === "UPDATE" && id !== undefined ? { id } : skipToken
    );

  const { mutate: createMutation, isPending: isCreateMutationPending } =
    trpc.dataManagementRouter.createVisualAxis.useMutation(
      useDefaultMutationNotifications("Visual axis", "create")
    );
  const { mutate: updateMutation, isPending: isUpdateMutationPending } =
    trpc.dataManagementRouter.updateVisualAxis.useMutation(
      useDefaultMutationNotifications("Visual axis", "delete")
    );

  return (
    <EasyCUDialog
      close={close}
      open={open}
      entity="Visual Axis"
      mode={mode}
      defaultData={{
        startPoint: { x: 0, y: 0, z: 0 },
        endPoint: { x: 0, y: 0, z: 0 },
        name: "",
        description: "",
      }}
      isLoading={isUpdateMutationPending || isCreateMutationPending}
      onUpdate={(data) => {
        if (!id) throw new Error("Id no supplied!");
        updateMutation({
          endPointX: data.endPoint.x,
          endPointY: data.endPoint.y,
          endPointZ: data.endPoint.z,
          id,
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
            label: "Title",
          },
          type: "text",
        },
        {
          name: "description",
          props: {
            label: "Description",
          },
          type: "text",
        },
        {
          name: "startPoint",
          props: {
            label: "Start Point",
          },
          type: "georeferencedTranslation",
        },
        {
          name: "endPoint",
          props: {
            label: "End Point",
          },
          type: "georeferencedTranslation",
        },
      ]}
    />
  );
}
