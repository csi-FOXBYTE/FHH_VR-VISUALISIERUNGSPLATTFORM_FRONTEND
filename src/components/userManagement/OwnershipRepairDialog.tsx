"use client";

import {
  getOwnershipPreflight,
  getOwnershipSuccessors,
  repairOrphanedOwnership,
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

const repairTypes: Array<{
  type: OwnershipEntityType;
  countKey: "projects" | "baseLayers" | "visualAxes" | "events";
}> = [
  { type: "PROJECT", countKey: "projects" },
  { type: "BASE_LAYER", countKey: "baseLayers" },
  { type: "VISUAL_AXIS", countKey: "visualAxes" },
  { type: "EVENT", countKey: "events" },
];

export default function OwnershipRepairDialog({
  open,
  onClose,
  onRepaired,
}: {
  open: boolean;
  onClose: () => void;
  onRepaired: (correlationId: string) => void;
}) {
  const t = useTranslations("ownership");
  const [selected, setSelected] = useState<OwnershipSuccessors>({});
  useEffect(() => {
    if (open) setSelected({});
  }, [open]);

  const query = useQuery({
    queryKey: ["ownership-preflight"],
    enabled: open,
    queryFn: async () => {
      const preflight = await getOwnershipPreflight();
      const successors = Object.fromEntries(
        await Promise.all(
          repairTypes
            .filter(({ countKey }) => preflight[countKey] > 0)
            .map(async ({ type }) => [
              type,
              await getOwnershipSuccessors(type),
            ]),
        ),
      );
      return { preflight, successors };
    },
  });
  const mutation = useMutation({
    mutationFn: () => repairOrphanedOwnership(selected),
    onSuccess: (result) => onRepaired(result.correlationId),
  });
  const missingSuccessor = repairTypes.some(
    ({ type, countKey }) =>
      (query.data?.preflight[countKey] ?? 0) > 0 && !selected[type],
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("repair-title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography>{t("repair-description")}</Typography>
          {query.isLoading ? <Typography>{t("loading")}</Typography> : null}
          {query.isError ? <Alert severity="error">{t("load-failed")}</Alert> : null}
          {query.data?.preflight.readyForReleaseB ? (
            <Alert severity="success">{t("preflight-ready")}</Alert>
          ) : null}
          {(query.data?.preflight.invalidReferences ?? 0) > 0 ? (
            <Alert severity="error">
              {t("invalid-owner-references", {
                count: query.data!.preflight.invalidReferences,
              })}
            </Alert>
          ) : null}
          {query.data
            ? repairTypes.map(({ type, countKey }) => {
                const count = query.data.preflight[countKey];
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
            <Alert severity="error">{t("repair-failed")}</Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button
          variant="contained"
          disabled={
            !query.data ||
            query.data.preflight.readyForReleaseB ||
            missingSuccessor ||
            mutation.isPending
          }
          onClick={() => mutation.mutate()}
        >
          {t("repair")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
