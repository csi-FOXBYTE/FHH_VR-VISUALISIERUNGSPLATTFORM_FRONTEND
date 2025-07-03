"use client";

import PageContainer from "@/components/common/PageContainer";
import { TabPanel } from "@/components/common/TabPanel";
import useDataGridServerSideHelper from "@/components/dataGridServerSide/useDataGridServerSideOptions";
import { Link as NextLink } from "@/server/i18n/routing";
import { trpc } from "@/server/trpc/client";
import { Add } from "@mui/icons-material";
import { Link, ListItemText, Tab, Tabs } from "@mui/material";
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

  const { props } = useDataGridServerSideHelper("project-management", {
    extraActions: [
      {
        icon: <Add />,
        key: "new",
        label: t("actions.create"),
        href: "/project-management/new",
      },
    ],
  });

  const { data: { data, count } = { data: [], count: 0 } } =
    trpc.projectManagementRouter.list.useQuery(
      {
        filterModel: props.filterModel,
        paginationModel: props.paginationModel,
        sortModel: props.sortModel,
      },
      {
        placeholderData: keepPreviousData,
      }
    );

  return (
    <PageContainer>
      <Tabs value={selectedTab}>
        <Tab
          onClick={() => setSelectedTab(0)}
          label={t("project-management.my-projects")}
          value={0}
        />
        <Tab
          disabled
          onClick={() => setSelectedTab(1)}
          label={t("project-management.shared-projects")}
          value={1}
        />
      </Tabs>
      <TabPanel
        flex="1"
        visible
        overflow="hidden"
        container
        flexDirection="column"
        flexWrap="nowrap"
        index={0}
        position="relative"
        value={selectedTab}
      >
        <DataGrid
          {...props}
          rows={data}
          style={{ maxWidth: "100%" }}
          rowCount={count}
          columns={[
            {
              flex: 1,
              field: "title",
              renderCell({ row }) {
                return (
                  <Link
                    component={NextLink}
                    color="textPrimary"
                    underline="none"
                    href={`/project-management/${row.id}`}
                  >
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
                  </Link>
                );
              },
            },
          ]}
        />
      </TabPanel>
      <TabPanel visible index={1} value={selectedTab}>
        Not implemented yet!
      </TabPanel>
    </PageContainer>
  );
}
