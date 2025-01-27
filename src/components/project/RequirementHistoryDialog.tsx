import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import { useTranslations } from "next-intl";
import CloseIcon from "@mui/icons-material/Close";

interface IRequirementHistoryDialogProps<T> extends DialogProps {
  close: () => void;
  useQuery?: () => {
    data?: Partial<T>;
    isLoading: boolean;
    error?: unknown;
  };
}

export default function RequirementHistoryDialog({
  close,
  open,
  useQuery,
}: IRequirementHistoryDialogProps<unknown>) {
  const t = useTranslations();
  const { data: queryData, isLoading } = useQuery?.() ?? {};

  if (!queryData) return null;
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
        {isLoading ? (
          <Box position="relative" height="200px">
            <CircularProgress style={{ position: "absolute", top: "50%", left: "50%" }} />
          </Box>
        ) : (
          <p>Coming...</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
