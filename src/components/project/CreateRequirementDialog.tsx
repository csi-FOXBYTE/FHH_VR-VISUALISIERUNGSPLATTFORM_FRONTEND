import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  DialogProps,
  FormLabel,
} from "@mui/material";
import { Formik } from "formik";
import { useTranslations } from "next-intl";
import { trpc } from "@/server/trpc/client";

export default function CreateRequirementDialog({
  close,
  open,
  refetch,
  projectId,
}: DialogProps & {
  close: () => void;
  refetch: () => void;
  projectId: string;
}) {
  const t = useTranslations();

  const addRequirementMutation =
    trpc.requirementsRouter.addRequirement.useMutation({
      onSuccess: () => {
        refetch();
        close();
      },
      onError: (error) => {
        console.error("addRequirementMutation failed:" + error);
      },
    });

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{t("requirementDialog.title")}</DialogTitle>
      <Formik
        initialValues={{
          requirement: "",
          assignedTo: "",
          category: "Org" as "Tec" | "Org",
          createdAt: new Date().toLocaleDateString(),
        }}
        onSubmit={(values) => {
          addRequirementMutation.mutate({
            projectId,
            data: {
              title: values.requirement,
              responsibleUser: values.assignedTo,
              category: values.category,
              assignedDate: new Date(values.createdAt),
            },
          });
        }}
      >
        {({ values, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <FormControl fullWidth margin="normal">
                <TextField
                  name="requirement"
                  label={t("requirementDialog.requirementText")}
                  variant="filled"
                  multiline
                  rows={4}
                  value={values.requirement}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel id="assigned-to-label">
                  {t("requirementDialog.assignedTo")}
                </InputLabel>
                <Select
                  labelId="assigned-to-label"
                  name="assignedTo"
                  value={values.assignedTo}
                  onChange={handleChange}
                  variant="filled"
                >
                  <MenuItem value="">
                    <em>{t("requirementDialog.assignedTo")}</em>
                  </MenuItem>
                  <MenuItem value="Person1">Person1</MenuItem>
                  <MenuItem value="Person2">Person2</MenuItem>
                </Select>
              </FormControl>
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">
                  {t("requirementDialog.category")}
                </FormLabel>
                <RadioGroup
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="Org"
                    control={<Radio />}
                    label={t("requirementDialog.orgRequirement")}
                  />
                  <FormControlLabel
                    value="Tec"
                    control={<Radio />}
                    label={t("requirementDialog.techRequirement")}
                  />
                </RadioGroup>
              </FormControl>
              <Divider />
              <FormControl fullWidth margin="normal">
                <TextField
                  name="createdAt"
                  label={t("requirementDialog.createdAt")}
                  variant="filled"
                  value={values.createdAt}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" color="inherit" onClick={close}>
                {t("requirementDialog.cancel")}
              </Button>
              <Button variant="outlined" type="submit">
                {t("requirementDialog.save")}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
}
