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
import { IProject, IGoal } from "@/server/services/projectService";

interface CreateGoalDialogProps extends DialogProps {
  close: () => void;
  project: IProject;
  refetch: () => void;
  initialValues?: IGoal | null;
  isEdit?: boolean;
}

export default function CreateGoalDialog({
  close,
  open,
  project,
  refetch,
  initialValues,
  isEdit = false,
}: CreateGoalDialogProps) {
  const t = useTranslations();

  const addGoalMutation = trpc.goalsRouter.addGoal.useMutation({
    onSuccess: () => {
      refetch();
      close();
    },
    onError: (error) => {
      console.error("addGoalMutation failed:" + error);
    },
  });

  const editGoalMutation = trpc.goalsRouter.editGoal.useMutation({
    onSuccess: () => {
      refetch();
      close();
    },
    onError: (error) => {
      console.error("editGoalMutation failed:" + error);
    },
  });

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? t("goalDialog.editTitle") : t("goalDialog.addTitle")}
      </DialogTitle>
      <Formik
        initialValues={{
          goal: initialValues?.title || "",
          assignedTo: initialValues?.responsibleUser || "",
          category: initialValues?.category || "Schedule",
          createdAt: initialValues?.assignedDate
            ? new Date(initialValues.assignedDate).toLocaleDateString()
            : new Date().toLocaleDateString(),
        }}
        onSubmit={(values) => {
          if (isEdit && initialValues) {
            editGoalMutation.mutate({
              projectId: project.id,
              goalId: initialValues.id,
              data: {
                title: values.goal,
                responsibleUser: values.assignedTo,
                category: values.category,
                assignedDate: new Date(values.createdAt),
              },
            });
          } else {
            addGoalMutation.mutate({
              projectId: project.id,
              data: {
                title: values.goal,
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
                  name="goal"
                  label={t("goalDialog.goalText")}
                  variant="filled"
                  multiline
                  rows={4}
                  value={values.goal}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel id="assigned-to-label">
                  {t("goalDialog.assignedTo")}
                </InputLabel>
                <Select
                  labelId="assigned-to-label"
                  name="assignedTo"
                  value={values.assignedTo}
                  onChange={handleChange}
                  variant="filled"
                >
                  {project.members.map((member) => {
                    return (
                      <MenuItem key={member.email} value={member.email}>
                        {member.email}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">
                  {t("goalDialog.category")}
                </FormLabel>
                <RadioGroup
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="Schedule"
                    control={<Radio />}
                    label={t("goalDialog.scheduleRadioBtn")}
                  />
                  <FormControlLabel
                    value="Cost"
                    control={<Radio />}
                    label={t("goalDialog.costRadioBtn")}
                  />
                  <FormControlLabel
                    value="Performance"
                    control={<Radio />}
                    label={t("goalDialog.performanceRadioBtn")}
                  />
                </RadioGroup>
              </FormControl>
              <Divider />
              <FormControl fullWidth margin="normal">
                <TextField
                  name="createdAt"
                  label={t("goalDialog.createdAt")}
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
                {t("goalDialog.cancel")}
              </Button>
              <Button variant="outlined" type="submit">
                {t("goalDialog.save")}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
}
