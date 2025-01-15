import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  IconButton,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { IGoal } from "@/server/services/projectService";
import CloseIcon from "@mui/icons-material/Close";

interface IGoalHistoryDialogProps extends DialogProps {
  close: () => void;
  goal: IGoal | null;
}

export default function GoalHistoryDialog({
  close,
  open,
  goal,
}: IGoalHistoryDialogProps) {
  const t = useTranslations();

  if (!goal) return null;
  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>
        {t("goalDialog.historyTitle")}
        <IconButton
          aria-label="close"
          onClick={close}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <p>Coming...</p>
      </DialogContent>
    </Dialog>
  );
}
