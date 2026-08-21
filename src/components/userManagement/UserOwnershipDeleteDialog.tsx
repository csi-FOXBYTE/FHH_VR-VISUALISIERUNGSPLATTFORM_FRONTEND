"use client";

import {
  getDeletionImpact,
  getDeletionSuccessors,
  transferAndDeleteUser,
  type OwnershipEntityType,
  type OwnershipSuccessors,
} from "@/server/gatewayApi/ownershipApi";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const entityTypes: Array<{
  type: OwnershipEntityType;
  countKey: "projects" | "baseLayers" | "visualAxes" | "events";
}> = [
  { type: "PROJECT", countKey: "projects" },
  { type: "BASE_LAYER", countKey: "baseLayers" },
  { type: "VISUAL_AXIS", countKey: "visualAxes" },
  { type: "EVENT", countKey: "events" },
];

export default function UserOwnershipDeleteDialog({
  userId,
  userLabel,
  onClose,
  onDeleted,
}: {
  userId: string | null;
  userLabel?: string;
  onClose: () => void;
  onDeleted: (correlationId: string) => void;
}) {
  const t = useTranslations("ownership");
  const [selected, setSelected] = useState<OwnershipSuccessors>({});

  useEffect(() => setSelected({}), [userId]);

  const query = useQuery({
    queryKey: ["user-deletion-impact", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const impact = await getDeletionImpact(userId!);
      const successors = Object.fromEntries(
        await Promise.all(
          entityTypes
            .filter(({ countKey }) => impact[countKey] > 0)
            .map(async ({ type }) => [
              type,
              await getDeletionSuccessors(userId!, type),
            ]),
        ),
      );
      return { impact, successors };
    },
  });

  const mutation = useMutation({
    mutationFn: () => transferAndDeleteUser(userId!, selected),
    onSuccess: (result) => onDeleted(result.correlationId),
  });

  const missingSuccessor = entityTypes.some(
    ({ type, countKey }) =>
      (query.data?.impact[countKey] ?? 0) > 0 && !selected[type],
  );

  return (
    <Dialog open={Boolean(userId)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("delete-title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography>{t("delete-description", { user: userLabel ?? "-" })}</Typography>
          {query.isLoading ? <Typography>{t("loading")}</Typography> : null}
          {query.isError ? <Alert severity="error">{t("load-failed")}</Alert> : null}
          {query.data?.impact.canDelete ? (
            <Alert severity="info">{t("no-owned-content")}</Alert>
          ) : null}
          {query.data
            ? entityTypes.map(({ type, countKey }) => {
                const count = query.data.impact[countKey];
                if (count === 0) return null;
                const options =
                  query.data.successors[type] as
                    | Array<{ id: string; name: string | null; email: string }>
                    | undefined;
                return (
                  <FormControl key={type} required fullWidth>
                    <InputLabel>{t(`successor-${type}`, { count })}</InputLabel>
                    <Select
                      value={selected[type] ?? ""}
                      label={t(`successor-${type}`, { count })}
                      onChange={(event) =>
                        setSelected((current) => ({
                          ...current,
                          [type]: event.target.value,
                        }))
                      }
                    >
                      {(options ?? []).map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name ?? option.email} ({option.email})
                        </MenuItem>
                      ))}
                    </Select>
                    {options?.length === 0 ? (
                      <Alert severity="error">{t("no-successor")}</Alert>
                    ) : null}
                  </FormControl>
                );
              })
            : null}
          {mutation.isError ? (
            <Alert severity="error">{t("delete-failed")}</Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button
          color="error"
          variant="contained"
          disabled={!query.data || missingSuccessor || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {t("transfer-and-delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
