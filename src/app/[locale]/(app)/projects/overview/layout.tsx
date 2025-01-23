"use client";

import { Add, Clear, Refresh } from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  FormControlLabel,
  Grid2,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { usePathname, useRouter } from "@/server/i18n/routing";
import { ReactNode, useState } from "react";
import CreateProjectDialog from "@/components/project/CreateProjectDialog";
import { parseAsJson, useQueryState } from "nuqs";
import { PROJECT_STATUS } from "@prisma/client";
import SearchInput from "@/components/common/SearchInput";
import { trpc } from "@/server/trpc/client";
import { projectOverviewFilterWithDefaults } from "@/components/project/ProjectOverviewFilter";
import { useTranslations } from "next-intl";

export default function ProjectOverviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";

  const router = useRouter();

  const t = useTranslations();

  const [createModalOpened, setCreateModalOpened] = useState(false);

  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsJson(projectOverviewFilterWithDefaults)
  );

  return (
    <Grid2
      height="100%"
      container
      flexDirection="column"
      flexWrap="nowrap"
      overflow="hidden"
    >
      <Grid2>
        <Typography variant="h2">Übersicht Projekte</Typography>
        <Tabs
          value={
            ["/projects/overview/tiles", "/projects/overview/list"].includes(
              pathname
            )
              ? pathname
              : false
          }
        >
          <Tab
            onClick={() => router.push("/projects/overview/tiles")}
            value="/projects/overview/tiles"
            label="Kachel"
          />
          <Tab
            onClick={() => router.push("/projects/overview/list")}
            value="/projects/overview/list"
            label="Liste"
          />
        </Tabs>
        <Grid2 container spacing={2}>
          <Grid2 container spacing={2} flexGrow={1}>
            <SearchInput
              label="Gebäudenummer"
              extraInput={{}}
              style={{ flex: 1 }}
              value={filter?.buildingId}
              onChange={(value) => setFilter({ ...filter, buildingId: value })}
              useQuery={trpc.projectRouter.searchBuildingNumber.useQuery}
            />
            <SearchInput
              label="Projektleiter"
              extraInput={{}}
              style={{ flex: 1 }}
              value={filter?.projectManagerId}
              onChange={(value) =>
                setFilter({ ...filter, projectManagerId: value })
              }
              useQuery={trpc.projectRouter.searchProjectManager.useQuery}
            />
            <Select
              value={filter?.status ?? ""}
              style={{ flex: 1 }}
              onChange={(event: SelectChangeEvent<string>) => {
                setFilter({
                  ...filter,
                  status: event.target.value as PROJECT_STATUS,
                });
              }}
              endAdornment={
                (filter?.status ?? "") !== "" ? (
                  <InputAdornment sx={{ marginRight: "10px" }} position="end">
                    <IconButton
                      onClick={() => {
                        setFilter(null);
                      }}
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
            >
              {Array.from(Object.keys(PROJECT_STATUS)).map((projectStatus) => (
                <MenuItem key={projectStatus} value={projectStatus}>
                  {t(`enums.PROJECT_STATUS.${projectStatus}`)}
                </MenuItem>
              ))}
            </Select>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Meine Projekte"
              checked={Boolean(filter?.myProjects)}
              onChange={() =>
                setFilter({ ...filter, myProjects: !filter?.myProjects })
              }
            />
          </Grid2>
          <Grid2 container spacing={2} justifyContent="stretch">
            <ButtonGroup fullWidth>
              <Button variant="text" startIcon={<Refresh />}>
                Daten aktualisieren
              </Button>
              <Button
                onClick={() => setCreateModalOpened(true)}
                variant="contained"
                startIcon={<Add />}
              >
                Projekt anlegen
              </Button>
            </ButtonGroup>
          </Grid2>
        </Grid2>
      </Grid2>
      {children}
      <CreateProjectDialog
        close={() => setCreateModalOpened(false)}
        open={createModalOpened}
      />
    </Grid2>
  );
}
