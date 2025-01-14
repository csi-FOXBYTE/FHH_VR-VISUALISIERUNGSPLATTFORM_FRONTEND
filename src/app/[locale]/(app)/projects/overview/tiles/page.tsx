"use client";

import { useRouter } from "@/server/i18n/routing";
import { trpc } from "@/server/trpc/client";
import {
  Autorenew,
  Error,
  MoreVert,
  AccessTime,
  Flag,
  Person,
} from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid2,
  Pagination,
  SvgIconProps,
  Typography,
  styled,
} from "@mui/material";
import { keepPreviousData } from "@tanstack/react-query";
import { useFormatter } from "next-intl";
import { parseAsFloat, parseAsJson, useQueryState } from "nuqs";
import { useEffect } from "react";
import { z } from "zod";

const StyledCardHeader = styled(CardHeader)`
  > .MuiCardHeader-content {
    overflow: hidden;
  }
`;

export default function ProjectOverviewTilesPage() {
  const router = useRouter();

  const [skip, setSkip] = useQueryState("skip", parseAsFloat.withDefault(0));

  const [filter] = useQueryState(
    "filter",
    parseAsJson(z.record(z.string(), z.string()).default({}).parse)
  );
  const limit = 18;

  const formatter = useFormatter();

  const { data: { count, data: projects } = { count: 0, data: [] } } =
    trpc.projectOverviewRouter.getProjects.useQuery(
      { limit, skip, filter: filter ?? {}, search: {} },
      {
        placeholderData: keepPreviousData,
      }
    );

  useEffect(() => {}, []);

  return (
    <Grid2
      container
      flexDirection="column"
      flexGrow="1"
      flexWrap="nowrap"
      overflow="hidden"
      marginTop={2}
      spacing={2}
    >
      <Grid2
        flexGrow="1"
        container
        spacing={4}
        alignContent="flex-start"
        overflow="auto"
      >
        {projects.map((project) => (
          <Grid2
            component={Card}
            size={{ xl: 2, lg: 2, md: 4, sm: 6, xs: 12 }}
            key={project.id}
            container
            flexDirection="column"
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            <StyledCardHeader
              titleTypographyProps={{
                variant: "body1",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
              content="Hallo"
              title={project.title}
              sx={{ overflow: "hidden", width: "100%", flexShrink: 1 }}
              subheader={
                <Typography
                  variant="caption"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  overflow="hidden"
                >
                  Gebäudenummer {project.buildingNumber}
                </Typography>
              }
              action={<MoreVert />}
            />
            <Grid2 maxWidth="100%" component={CardContent} flexGrow={1}>
              <Chip
                variant="outlined"
                icon={<Person />}
                label={project.projectLead}
              />
            </Grid2>
            <Grid2
              justifyContent="space-between"
              alignItems="center"
              container
              component={CardContent}
            >
              <Grid2
                container
                alignItems="center"
                component={Typography}
                variant="body2"
                spacing={1}
              >
                <Flag fontSize="small" />
                {formatter.dateTime(project.assignedDate)}
              </Grid2>
              <StateIconSwitch fontSize="small" state={project.state} />
            </Grid2>
          </Grid2>
        ))}
      </Grid2>
      <Grid2 justifyContent="center">
        <Pagination
          style={{ float: "right" }}
          page={Math.ceil(skip / limit) + 1}
          onChange={(_, page) => setSkip(limit * (page - 1))}
          count={Math.ceil(count / limit)}
          variant="text"
        />
      </Grid2>
    </Grid2>
  );
}

function StateIconSwitch({
  state,
  ...props
}: {
  state: "active" | "delayed" | "critical";
} & SvgIconProps) {
  switch (state) {
    case "active":
      return <Autorenew color="success" {...props} />;
    case "delayed":
      return <AccessTime color="warning" {...props} />;
    case "critical":
      return <Error color="error" {...props} />;
  }
}
