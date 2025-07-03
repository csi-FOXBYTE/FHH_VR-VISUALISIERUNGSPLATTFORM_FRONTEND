"use client";

import PageContainer from "@/components/common/PageContainer";
import UserAvatar from "@/components/common/UserAvatar";
import { Link } from "@/server/i18n/routing";
import { trpc } from "@/server/trpc/client";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useConfirm } from "material-ui-confirm";

export default function ProfilePage() {
  const session = useSession();
  const t = useTranslations();

  const { data: info } = trpc.profileRouter.getInfo.useQuery();

  const { mutate: deleteUserMutation } =
    trpc.profileRouter.deleteUser.useMutation();

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
          )}`}
          target="_blank"
          color="secondary"
        >
          {t("profile.update-account")}
        </Button>
        <Button
          disabled // TODO: Implement user delete
          onClick={async () => {
            const { confirmed } = await confirm({
              title: "Sind Sie sich sicher?",
              cancellationText: "Abbrechen",
              confirmationText: "Ok",
              description:
                "Sind Sie sich sicher das Sie ihren Nutzeraccount löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden!",
            });

            if (!confirmed) return;

            deleteUserMutation(undefined, {
              onSuccess: () => {
                signOut();
              },
              onError(error) {
                console.error(error);
              },
            });
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
