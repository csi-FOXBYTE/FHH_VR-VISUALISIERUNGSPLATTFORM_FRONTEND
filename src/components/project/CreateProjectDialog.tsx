import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  DialogActions,
  DialogProps,
  Button,
  Grid2,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState } from "react";
import CustomTabPanel from "../common/CustomTabPanel";
import { Formik } from "formik";

export default function CreateProjectDialog({
  close,
  ...props
}: DialogProps & { close: () => void }) {
  const [index, setIndex] = useState(0);

  return (
    <Dialog {...props}>
      <DialogActions>
        <Button
          onClick={close}
          variant={"contained"}
          color={"secondary"}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            margin: 0,
            minWidth: 34,
            padding: 0,
          }}
          disableElevation
        >
          <Close
            sx={{
              margin: ".25em",
            }}
          />
        </Button>
      </DialogActions>
      <DialogTitle>Projekt erstellen</DialogTitle>
      <Formik
        initialValues={{
          projectName: "",
        }}
        onSubmit={console.log}
        style={{ padding: 0, margin: 0 }}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit}>
            <DialogContent>
              <Tabs value={index} onChange={(_, index) => setIndex(index)}>
                <Tab label="Projekt Details" />
                <Tab label="Zeit und Finanzplanung" />
                <Tab label="Zusatz-Information (optional)" />
              </Tabs>
              <CustomTabPanel index={0} value={index}>
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
                      <TextField name="room" label="Raum" variant="filled" />
                    </FormControl>
                  </Grid2>
                  <Grid2 size={6}>
                    <FormControl fullWidth>
                      <TextField name="abc" label="Etage" variant="filled" />
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
              </CustomTabPanel>
              <CustomTabPanel index={1} value={index}>
                <Grid2 container spacing={2}>
                  <Grid2 size={6}>
                    <FormControl fullWidth>
                      <TextField
                        required
                        value={props.values.projectName}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        name="startDate"
                        label="Startdatum"
                        variant="filled"
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 size={6}>
                    <FormControl fullWidth>
                      <TextField
                        required
                        value={props.values.projectName}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        name="endDate"
                        label="Enddatum"
                        variant="filled"
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 size={12}>
                    <FormControl fullWidth>
                      <InputLabel>Projekt-Art</InputLabel>
                      <Select
                        name="projectType"
                        label="Projekt-Art"
                        variant="filled"
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 size={12}>
                    <FormControl fullWidth>
                      <InputLabel>Kostenstelle</InputLabel>
                      <Select
                        name="costCenter"
                        label="Kostenstelle"
                        variant="filled"
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 size={6}>
                    <FormControl fullWidth>
                      <TextField
                        required
                        value={props.values.projectName}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        name="endDate"
                        label="Geplante Stunden"
                        variant="filled"
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 size={6}>
                    <FormControl fullWidth>
                      <TextField
                        required
                        value={props.values.projectName}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        name="endDate"
                        label="Geplantes Budget"
                        variant="filled"
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 size={12}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Soll aus Teilprojektvorgaben berechnen"
                    />
                  </Grid2>
                </Grid2>
              </CustomTabPanel>
              <CustomTabPanel index={2} value={index}>
                <Grid2 container spacing={2}>
                  <Grid2 size={12}>
                    <FormControl fullWidth>
                      <TextField
                        multiline
                        rows={4}
                        maxRows={6}
                        required
                        value={props.values.projectName}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        name="endDate"
                        label="Beschreibung"
                        variant="filled"
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 size={12}>
                    <FormControl fullWidth>
                      <TextField
                        multiline
                        minRows={4}
                        maxRows={6}
                        required
                        value={props.values.projectName}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        name="endDate"
                        label="Zusätzliche Informationen"
                        variant="filled"
                      />
                    </FormControl>
                  </Grid2>
                </Grid2>
              </CustomTabPanel>
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" color="inherit" onClick={close}>
                Abbrechen
              </Button>
              <Button variant="outlined" type="submit">
                Speichern
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
}
