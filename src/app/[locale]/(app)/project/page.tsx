"use client";

import { trpc } from "@/server/trpc/client";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledBox = styled(Box)({
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
});

export default function ProjectPage() {
  const { data = [] } = trpc.projectOverviewRouter.getProjects.useQuery();

  return (
    <StyledBox>
      <h1>Hallo,</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </StyledBox>
  );
}
