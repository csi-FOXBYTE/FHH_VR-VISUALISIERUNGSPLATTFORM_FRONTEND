"use client";

import { Add, Clear, Refresh } from "@mui/icons-material";
import {
  Autocomplete,
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
  TextField,
  Typography,
} from "@mui/material";
import { usePathname, useRouter } from "@/server/i18n/routing";
import { ReactNode, useState } from "react";
import CreateProjectDialog from "@/components/project/CreateProjectDialog";
import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";

const stateOptions = [
  { label: "Verzögert", value: "delayed" },
  { label: "Kritisch", value: "critical" },
  { label: "In Arbeit", value: "active" },
];

export default function ProjectOverviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";

  const router = useRouter();

  const [createModalOpened, setCreateModalOpened] = useState(false);

  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsJson(z.record(z.string(), z.string()).default({}).parse)
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
        <Tabs value={pathname}>
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
            <Autocomplete
              style={{ flex: 1 }}
              options={[]}
              renderInput={(params) => (
                <TextField {...params} label="Gebäudenummer" />
              )}
            />
            <Autocomplete
              style={{ flex: 1 }}
              options={[]}
              renderInput={(params) => (
                <TextField {...params} label="Projektleiter" />
              )}
            />
            <Select
              value={filter?.state}
              style={{ flex: 1 }}
              onChange={(event: SelectChangeEvent<string>) => {
                setFilter((filter) => {
                  const newFilter = { ...filter };
                  if (event.target.value === "") {
                    delete newFilter["state"];
                  } else {
                    newFilter["state"] = event.target.value;
                  }

                  return newFilter;
                });
              }}
              endAdornment={
                Object.entries(filter ?? {}).length > 0 && (
                  <InputAdornment sx={{ marginRight: "10px" }} position="end">
                    <IconButton
                      onClick={() => {
                        setFilter(null);
                      }}
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              }
            >
              {stateOptions.map((stateOption) => (
                <MenuItem key={stateOption.value} value={stateOption.value}>
                  {stateOption.label}
                </MenuItem>
              ))}
            </Select>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Meine Projekte"
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
