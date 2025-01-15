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
import { IProject, IRequirement } from "@/server/services/projectService";

interface CreateRequirementDialogProps extends DialogProps {
  close: () => void;
  project: IProject;
  refetch: () => void;
  initialValues?: IRequirement | null;
  isEdit?: boolean;
}

export default function CreateRequirementDialog({
  close,
  open,
  project,
  refetch,
  initialValues,
  isEdit = false,
}: CreateRequirementDialogProps) {
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

  const editRequirementMutation =
    trpc.requirementsRouter.editRequirement.useMutation({
      onSuccess: () => {
        refetch();
        close();
      },
      onError: (error) => {
        console.error("editRequirementMutation failed:" + error);
      },
    });

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit
          ? t("requirementDialog.editTitle")
          : t("requirementDialog.addTitle")}
      </DialogTitle>
      <Formik
        initialValues={{
          requirement: initialValues?.title || "",
          assignedTo: initialValues?.responsibleUser || "",
          category: initialValues?.category || "Org",
          createdAt: initialValues?.assignedDate
            ? new Date(initialValues.assignedDate).toLocaleDateString()
            : new Date().toLocaleDateString(),
        }}
        onSubmit={(values) => {
          if (isEdit && initialValues) {
            editRequirementMutation.mutate({
              projectId: project.id,
              requirementId: initialValues.id,
              data: {
                title: values.requirement,
                responsibleUser: values.assignedTo,
                category: values.category,
                assignedDate: new Date(values.createdAt),
              },
            });
          } else {
            addRequirementMutation.mutate({
              projectId: project.id,
              data: {
                title: values.requirement,
                responsibleUser: values.assignedTo,
                category: values.category,
                assignedDate: new Date(values.createdAt),
              },
            });
          }
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
                  {project.participants.map((participant) => {
                    return (
                      <MenuItem
                        key={participant.email}
                        value={participant.email}
                      >
                        {participant.email}
                      </MenuItem>
                    );
                  })}
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
