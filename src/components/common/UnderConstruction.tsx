import { useRouter } from "@/server/i18n/routing";
import { Construction } from "@mui/icons-material";
import { Button, Paper, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

export default function UnderConstruction() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <Paper sx={{ padding: 4 }} elevation={2}>
      <Construction sx={{ fontSize: 120, color: "text.secondary", mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        {t("under-construction.title")}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        align="center"
        sx={{ maxWidth: 600, mb: 3 }}
      >
        {t("under-construction.we-are-working-hard")}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => router.back()}
        sx={{ textTransform: "none" }}
      >
        {t("under-construction.go-back")}
      </Button>
    </Paper>
  );
}
