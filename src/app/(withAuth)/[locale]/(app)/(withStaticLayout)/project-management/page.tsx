"use client";

import PageContainer from "@/components/common/PageContainer";
import useCreateEditDeleteActions from "@/components/dataGridServerSide/useCreateEditDeleteActions";
import useDataGridServerSideHelper from "@/components/dataGridServerSide/useDataGridServerSideOptions";
import ProjectCUDialog, {
  useProjectCUDialogState,
} from "@/components/projectManagement/ProjectCUDialog";
import { Link as NextLink } from "@/server/i18n/routing";
import { trpc } from "@/server/trpc/client";
import { Add, PlayCircle } from "@mui/icons-material";
import { Button, ListItemText, Tab, Tabs } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";

export default function ProjectManagementPage() {
  const t = useTranslations();

  const [selectedTab, setSelectedTab] = useQueryState(
    "tab",
    parseAsInteger.withDefault(0)
  );

  const [, { openCreate, openUpdate }] = useProjectCUDialogState();

  const { props } = useDataGridServerSideHelper("project-management", {
    extraActions: [
      {
        icon: <Add />,
        key: "new",
        label: t("actions.create"),
        disabled: selectedTab !== 0,
        onClick() {
          openCreate();
        },
      },
    ],
  });

  const {
    data: { data: myProjectsData, count: myProjectsCount } = {
      data: [],
      count: 0,
    },
  } = trpc.projectManagementRouter.listMyProjects.useQuery(
    {
      filterModel: props.filterModel,
      paginationModel: props.paginationModel,
      sortModel: props.sortModel,
    },
    {
      placeholderData: keepPreviousData,
    }
  );

  const {
    data: { data: sharedProjectsData, count: sharedProjectsCount } = {
      data: [],
      count: 0,
    },
  } = trpc.projectManagementRouter.listSharedProjects.useQuery(
    {
      filterModel: props.filterModel,
      paginationModel: props.paginationModel,
      sortModel: props.sortModel,
    },
    {
      placeholderData: keepPreviousData,
    }
  );

  const createEditDeleteActions = useCreateEditDeleteActions({
    handleDelete: () => {},
    handleEdit: (id) => {
      openUpdate(id);
    },
    isDisabled: () => ({
      delete: selectedTab !== 0,
      edit: selectedTab !== 0,
    }),
  });

  return (
    <PageContainer>
      <ProjectCUDialog />
      <Tabs value={selectedTab}>
        <Tab
          onClick={() => setSelectedTab(0)}
          label={t("project-management.my-projects")}
          value={0}
        />
        <Tab
          onClick={() => setSelectedTab(1)}
          label={t("project-management.shared-projects")}
          value={1}
        />
      </Tabs>
      <DataGrid
        {...props}
        rows={selectedTab === 0 ? myProjectsData : sharedProjectsData}
        style={{ maxWidth: "100%" }}
        rowCount={selectedTab === 0 ? myProjectsCount : sharedProjectsCount}
        columns={[
          {
            flex: 0,
            field: "img",
            sortable: false,
            filterable: false,
            headerName: t("project-management.preview"),
            renderCell({ row }) {
              if (!row.img) return null;

              return (
                <img
                  alt="Preview image"
                  src={row.img}
                  style={{ height: "100%", width: "auto" }}
                />
              );
            },
          },
          {
            field: "owner",
            sortable: true,
            filterable: true,
            headerName: t("project-management.owner"),
            renderCell({ row }) {
              return row.owner.name;
            }
          },
          {
            flex: 1,
            field: "title",
            sortable: true,
            filterable: true,
            headerName: t("project-management.table-title"),
            renderCell({ row }) {
              return (
                <ListItemText
                  slotProps={{
                    secondary: {
                      sx: {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    },
                  }}
                  primary={row.title}
                  secondary={row.description}
                />
              );
            },
          },
          ...(selectedTab !== 0
            ? []
            : [
                {
                  field: "visibleForUsers",
                  headerName: t("project-management.visible-for-users"),
                  flex: 1,
                  valueGetter(value: { id: string; name: string }[]) {
                    return value.map((user) => user.name).join(", ");
                  },
                },
                {
                  field: "visibleForGroups",
                  headerName: t("project-management.visible-for-groups"),
                  flex: 1,
                  valueGetter(value: { id: string; name: string }[]) {
                    return value.map((group) => group.name).join(", ");
                  },
                },
              ]),
          {
            field: "to editr",
            headerName: " ",
            flex: 1,
            sortable: false,
            filterable: false,
            renderCell({ row }) {
              return (
                <Button
                  LinkComponent={NextLink}
                  variant="contained"
                  href={`/project-management/${row.id}`}
                  startIcon={<PlayCircle />}
                >
                  {t("project-management.open-editor")}
                </Button>
              );
            },
          },
          createEditDeleteActions,
        ]}
      />
    </PageContainer>
  );
}
