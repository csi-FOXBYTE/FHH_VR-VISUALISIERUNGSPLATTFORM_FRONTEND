"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslations } from "next-intl";

const Root = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const Headline = styled(Box)({
  display: "flex",
});

const Content = styled(Box)({
  display: "flex",
  height: "100%",
});

export default function Requirements() {
  const t = useTranslations();

  return (
    <Root>
      <Headline>
        <Typography variant="h1">
          {t("routes./project/details.title")}
        </Typography>
      </Headline>
      <Content>Test...</Content>
    </Root>
  );
}
