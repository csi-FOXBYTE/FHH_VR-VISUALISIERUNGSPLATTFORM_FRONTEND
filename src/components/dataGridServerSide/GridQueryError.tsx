"use client";

import { Alert, Button } from "@mui/material";
import { useTranslations } from "next-intl";

function referenceId(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as {
    data?: { referenceId?: unknown };
    shape?: { data?: { referenceId?: unknown } };
  };
  const value =
    candidate.data?.referenceId ?? candidate.shape?.data?.referenceId;
  return typeof value === "string" ? value : undefined;
}

export default function GridQueryError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const t = useTranslations("error");
  const reference = referenceId(error);

  return (
    <Alert
      severity="warning"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          {t("retry")}
        </Button>
      }
      sx={{ mb: 1 }}
    >
      {t("grid-load-failed")}
      {reference ? ` ${t("reference-id")}: ${reference}` : null}
    </Alert>
  );
}
