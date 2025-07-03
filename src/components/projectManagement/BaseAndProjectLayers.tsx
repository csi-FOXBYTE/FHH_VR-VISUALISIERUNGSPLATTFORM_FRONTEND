import { trpc } from "@/server/trpc/client";
import { Save } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useSnackbar } from "notistack";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import { Checkbox } from "@mui/material";
import { useState } from "react";

export default function BaseLayers() {
  const t = useTranslations();

  const { enqueueSnackbar } = useSnackbar();

  const { projectId } = useParams<{ projectId: string }>();

  const utils = trpc.useUtils();

  const { data: project } = trpc.projectRouter.getFull.useQuery({
    id: projectId,
  });

  const {
    mutate: updateBaseLayersSelectionMutation,
    isPending: isUpdateBaseLayersSelectionMutationPending,
  } = trpc.projectRouter.updateBaseLayersSelection.useMutation({
    onSuccess: () => {
      utils.projectRouter.invalidate();
      enqueueSnackbar({
        variant: "success",
        message: t("generic.crud-notifications.update-success", {
          entity: t("entities.base-layer"),
        }),
      });
      close();
    },
    onError: () => {
      enqueueSnackbar({
        variant: "error",
        message: t("generic.crud-notifications.update-failed", {
          entity: t("entities.base-layer"),
        }),
      });
    },
  });

  const [selectedBaseLayersSet, setSelectedBaseLayersSet] = useState(
    new Set(project?.includedBaseLayers.map((layer) => layer.id))
  );

  const { props } = useDataGridServerSideHelper("base-and-project-layers", {
    extraActions: [
      {
        icon: <Save />,
        key: "save",
        label: t("actions.save"),
        loading: isUpdateBaseLayersSelectionMutationPending,
        onClick: () => {
          updateBaseLayersSelectionMutation({
            projectId,
            baseLayerIds: Array.from(selectedBaseLayersSet),
          });
        },
      },
    ],
  });

  const { data: { data, count } = { data: [], count: 0 } } =
    trpc.projectRouter.listBaseLayers.useQuery({
      filterModel: props.filterModel,
      paginationModel: props.paginationModel,
      sortModel: props.sortModel,
    });

  

  return (
    <DataGrid
      {...props}
      checkboxSelection={false}
      rows={data}
      rowCount={count}
      loading={isUpdateBaseLayersSelectionMutationPending}
      columns={[
        {
          field: "null",
          headerName: " ",
          renderCell: ({ row }) => {
            return <Checkbox onChange={(_, checked) => {
              setSelectedBaseLayersSet(selectedBaseLayersSet => {
                const newSet = new Set(selectedBaseLayersSet);

                if (checked) {
                  newSet.add(row.id);
                } else {
                  newSet.delete(row.id)
                }

                return newSet;
              })
            }} checked={selectedBaseLayersSet.has(row.id)} />;
          },
        },
        {
          field: "name",
          flex: 1,
        },
        {
          field: "sizeGB",
          flex: 1,
        },
        {
          field: "description",
          flex: 1,
        },
      ]}
    />
  );
}
