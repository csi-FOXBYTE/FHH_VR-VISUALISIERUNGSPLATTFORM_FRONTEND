import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogProps } from "@mui/material";
import { useTranslations } from "next-intl";
import { trpc } from "@/server/trpc/client";
import { IProject } from "@/server/services/projectService";
import { IUser } from "@/server/services/userService";

interface AddParticipantDialogProps extends DialogProps {
  close: () => void;
  project: IProject;
  refetch: () => void;
}

export default function AddParticipantDialog({
  close,
  open,
  project,
  refetch,
}: AddParticipantDialogProps) {
  const t = useTranslations();

  const addParticipantMutation =
    trpc.participantsRouter.addParticipant.useMutation({
      onSuccess: () => {
        refetch();
        close();
      },
      onError: (error) => {
        console.error("addParticipantMutation failed:" + error);
      },
    });

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{t("participantDialog.title")}</DialogTitle>
      <DialogContent>Comeing...</DialogContent>
    </Dialog>
  );
}
