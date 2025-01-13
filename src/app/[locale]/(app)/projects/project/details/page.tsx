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

export default function Details() {
  const t = useTranslations();

  return (
    <Root>
      <Headline>
        <Typography variant="h1">
          {t("routes./project/details.title")}
        </Typography>
      </Headline>
      <Content>
        <LeftContainer>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>
                {t("routes./project/details.Accordion1Title")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box1>
                <Formik
                  initialValues={{
                    projectName: "",
                  }}
                  onSubmit={console.log}
                  style={{ padding: 0, margin: 0 }}
                >
                  {(props) => (
                    <form onSubmit={props.handleSubmit}>
                      <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                          <FormControl fullWidth>
                            <TextField
                              required
                              value={props.values.projectName}
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              name="projectName"
                              label="Projekt Name"
                              variant="filled"
                            />
                          </FormControl>
                        </Grid2>
                        <Grid2 size={6}>
                          <FormControl fullWidth>
                            <TextField
                              name="number"
                              label="Prüfstand-Nr."
                              variant="filled"
                            />
                          </FormControl>
                        </Grid2>
                        <Grid2 size={6}>
                          <FormControl fullWidth>
                            <TextField
                              name="building"
                              label="Gebäude"
                              variant="filled"
                            />
                          </FormControl>
                        </Grid2>
                        <Grid2 size={6}>
                          <FormControl fullWidth>
                            <TextField
                              name="room"
                              label="Raum"
                              variant="filled"
                            />
                          </FormControl>
                        </Grid2>
                        <Grid2 size={6}>
                          <FormControl fullWidth>
                            <TextField
                              name="abc"
                              label="Etage"
                              variant="filled"
                            />
                          </FormControl>
                        </Grid2>
                        <Grid2 size={12}>
                          <FormControl fullWidth>
                            <InputLabel>Projekt Kategorie</InputLabel>
                            <Select
                              name="productCategory"
                              label="Projekt Kategorie"
                              variant="filled"
                            />
                          </FormControl>
                        </Grid2>
                        <Grid2 size={12}>
                          <FormControl fullWidth>
                            <InputLabel>Ansprechpartner</InputLabel>
                            <Select
                              name="partner"
                              label="Ansprechpartner"
                              variant="filled"
                            />
                          </FormControl>
                        </Grid2>
                        <Grid2 size={12}>
                          <FormControl fullWidth>
                            <InputLabel>Projekt Kategorie</InputLabel>
                            <Select
                              name="leader"
                              label="Projektleiter"
                              variant="filled"
                            />
                          </FormControl>
                        </Grid2>
                      </Grid2>
                    </form>
                  )}
                </Formik>
              </Box1>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography>
                {t("routes./project/details.Accordion2Title")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Coming soon...</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography>
                {t("routes./project/details.Accordion3Title")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Coming soon...</Typography>
            </AccordionDetails>
          </Accordion>
        </LeftContainer>
        <RightContainer>
          <Box2>{/* Content for Box2 */}</Box2>
          <Box3>{/* Content for Box3 */}</Box3>
        </RightContainer>
      </Content>
    </Root>
  );
}
