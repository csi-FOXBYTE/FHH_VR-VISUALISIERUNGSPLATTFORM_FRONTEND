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
import { useTranslations } from "next-intl";

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
  const t = useTranslations();

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
      <Grid2 marginBottom={"1rem"}>
        <Tabs value={pathname}>
          <Tab
            onClick={() => router.push("/projects/project/details")}
            value="/projects/project/details"
            label={t("routes./project.tabbar1")}
          />
          <Tab
            onClick={() => router.push("/projects/project/requirements")}
            value="/projects/project/requirements"
            label={t("routes./project.tabbar2")}
          />
          <Tab
            onClick={() => router.push("/projects/project/goals")}
            value="/projects/project/goals"
            label={t("routes./project.tabbar3")}
          />
          <Tab
            onClick={() => router.push("/projects/project/participant")}
            value="/projects/project/participant"
            label={t("routes./project.tabbar4")}
          />
        </Tabs>
      </Grid2>
      {children}
      <CreateProjectDialog
        close={() => setCreateModalOpened(false)}
        open={createModalOpened}
      />
    </Grid2>
  );
}
