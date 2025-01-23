import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  IconButton,
} from "@mui/material";
import { useTranslations } from "next-intl";
import CloseIcon from "@mui/icons-material/Close";
import { User } from "@prisma/client";

interface IRequirementHistoryDialogProps extends DialogProps {
  close: () => void;
  requirement: User | null;
}

export default function RequirementHistoryDialog({
  close,
  open,
  requirement,
}: IRequirementHistoryDialogProps) {
  const t = useTranslations();

  if (!requirement) return null;
  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>
        {t("requirementDialog.historyTitle")}
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
