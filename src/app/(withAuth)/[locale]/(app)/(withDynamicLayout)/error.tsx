"use client";

import { Link } from "@/server/i18n/routing";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
} from "@mui/material";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ErrorView() {
  const t = useTranslations();

  return (
    <Grid
      sx={{ width: "100vw", height: "100vh" }}
      spacing={2}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      justifyItems="center"
      alignContent="center"
    >
      <Card elevation={4}>
        <CardHeader
          title={t("error.500-oooops-something-went-wrong-on-our-side")}
        />
        <CardContent>
          <Image
            alt="Error"
            src="/error.jpg"
            width={1024}
            height={1024}
            style={{ width: 512, height: 512 }}
          />
        </CardContent>
        <CardActions>
          <Button
            href="/my-area"
            LinkComponent={Link}
            color="primary"
            variant="contained"
          >
            {t("error.go-home")}
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
}
