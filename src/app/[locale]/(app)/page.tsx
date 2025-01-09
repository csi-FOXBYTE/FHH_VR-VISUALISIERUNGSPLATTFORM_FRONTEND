"use client";

import { Box, Card, CardHeader, Grid2 } from "@mui/material";
import { useTranslations } from "next-intl";
import { styled } from "@mui/material/styles";
import { useRouter } from "@/server/i18n/routing";

const StyledBox = styled(Box)({
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
});

const StyledCard = styled(Card)({
  display: "flex",
  width: 354,
  height: 311,
  alignContent: "center",
  justifyContent: "center",
  margin: "1rem",
  transition: "background-color 0.3s ease, transform 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    transform: "scale(1.05)",
  },
});

const StyledDiv = styled("div")({
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export default function LandingPage() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <StyledBox>
      <Grid2 container spacing={4}>
        {/* Card 1 */}
        <StyledDiv>
          <StyledCard onClick={() => router.push("/site")}>
            <CardHeader title={t("routes./.sites")} />
          </StyledCard>
        </StyledDiv>

        {/* Card 2 */}
        <StyledDiv>
          <StyledCard onClick={() => router.push("/project")}>
            <CardHeader title={t("routes./.projects")} />
          </StyledCard>
        </StyledDiv>
      </Grid2>
    </StyledBox>
  );
}
