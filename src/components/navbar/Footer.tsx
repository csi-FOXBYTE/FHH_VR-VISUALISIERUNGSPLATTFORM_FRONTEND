import theme from "@/constants/theme";
import { Grid, Typography, Link } from "@mui/material";
import { Link as NextLink } from "@/server/i18n/routing";
import FancyFooterEdge from "../common/FancyFooterEdge";
import { useTranslations } from "next-intl";
import PageContainer from "../common/PageContainer";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer
      style={{
        background: theme.palette.secondary.main,
        padding: theme.spacing(3),
        position: "relative",
        color: "white",
      }}
    >
      <FancyFooterEdge
        style={{
          position: "absolute",
          top: -46,
          left: 0,
          width: 150,
          zIndex: 20,
          pointerEvents: "none",
        }}
      />
      <PageContainer>
        <Grid container justifyContent="space-between" spacing={4}>
          <Typography>©Hamburg LGV 2025</Typography>
          <Grid container spacing={4}>
            <Link
              href={"/imprint"}
              underline="none"
              color="inherit"
              component={NextLink}
            >
              {t("footer.imprint")}
            </Link>
            <Link
              href={"/gdpr"}
              underline="none"
              color="inherit"
              component={NextLink}
            >
              {t("footer.gdpr")}
            </Link>
          </Grid>
        </Grid>
      </PageContainer>
    </footer>
  );
}
