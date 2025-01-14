"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControl,
  Grid2,
  InputLabel,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { Formik } from "formik";
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

const Box1 = styled(Box)({
  flex: 1,
  padding: "1rem",
  overflow: "auto",
});

const LeftContainer = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  paddingTop: "2rem",
  paddingBottom: "2rem",
});

const RightContainer = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: "1rem",
  overflow: "hidden",
});

const Box2 = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  backgroundColor: "grey",
  margin: "1rem",
});

const Box3 = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  backgroundColor: "grey",
  margin: "1rem",
});

export default function Goals() {
  const t = useTranslations();

  return (
    <Root>
      <Headline>
        <Typography variant="h1">
          {t("routes./project/details.title")}
        </Typography>
      </Headline>
      <Content>Comming...</Content>
    </Root>
  );
}
