"use client";

import PageContainer from "@/components/common/PageContainer";
import UserAvatar from "@/components/common/UserAvatar";
import { Link } from "@/server/i18n/routing";
import { trpc } from "@/server/trpc/client";
import { Alert, Button, Grid, TextField, Typography } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useConfirm } from "material-ui-confirm";
import { useMutation } from "@tanstack/react-query";
import { getApis } from "@/server/gatewayApi/client";
import { useSnackbar } from "notistack";

export default function ProfilePage() {
  const session = useSession();
  const t = useTranslations();

  const { data: info } = trpc.profileRouter.getInfo.useQuery();

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: deleteUserMutation } = useMutation({
    mutationFn: async () => {
      const apis = await getApis();

      await apis.userApi.userDelete();
    },
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: t("generic.crud-notifications.delete-success", {
          entity: t("entities.user"),
        }),
      });
      signOut({ redirectTo: "/", redirect: true });
    },
    onError: (error) => {
      console.error(error);
      enqueueSnackbar({
        variant: "error",
        message: t("generic.crud-notifications.delete-failed", {
          entity: t("entities.user"),
        }),
      });
    },
  });

  const confirm = useConfirm();

  return (
    <PageContainer>
      <Typography variant="h6" marginBottom={2}>
        {t("profile.personal-data")}
      </Typography>
      <Grid container spacing={2} marginBottom={4}>
        <Grid size={12} container justifyItems="stretch" alignItems="center">
          <UserAvatar style={{ width: 64, height: 64 }} />
          <TextField
            disabled
            value={session.data?.user.name}
            style={{ flex: 1 }}
            label={t("profile.name")}
          />
        </Grid>
        <Grid
          value={session.data?.user.email}
          disabled
          label={t("profile.email")}
          component={TextField}
          size={12}
        />
        <Grid
          defaultValue={info?.assignedGroups
            .map((assignedGroup) => assignedGroup.name)
            .join(", ")}
          disabled
          label={t("profile.user-group")}
          component={TextField}
          size={12}
        />
      </Grid>
      <Grid container spacing={2} justifyContent="flex-end">
        <Button
          LinkComponent={Link}
          size="large"
          variant="outlined"
          href={`https://myprofile.microsoft.com/?login_hint=${encodeURIComponent(
            session.data?.user.email ?? ""
          )}`} // TODO: make this configurable
          target="_blank"
          color="secondary"
        >
          {t("profile.update-account")}
        </Button>
        <Button
          onClick={async () => {
            const { confirmed } = await confirm({
              title: t("profile.delete-account"),
              cancellationText: t("actions.cancel"),
              confirmationText: t("actions.ok"),
              description: (
                <>
                  <Typography component="p">
                    {t(
                      "profile.are-you-sure-that-you-want-to-delete-your-account"
                    )}
                  </Typography>
                  <Alert severity="error">
                    {t("profile.this-action-is-irreversible")}
                  </Alert>
                </>
              ),
            });

            if (!confirmed) return;

            deleteUserMutation();
          }}
          size="large"
          variant="contained"
          color="secondary"
        >
          {t("profile.delete-account")}
        </Button>
      </Grid>
    </PageContainer>
  );
}
