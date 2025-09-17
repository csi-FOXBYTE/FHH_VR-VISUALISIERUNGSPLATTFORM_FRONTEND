"use client";

import CookieConsent from "@/components/common/CookieConsent";
import { useConfigurationProviderContext } from "@/components/configuration/ConfigurationProvider";
import Footer from "@/components/navbar/Footer";
import Navbar from "@/components/navbar/Navbar";
import { Button, Grid, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { getImageProps } from "next/image";

function getBackgroundImage(srcSet = "") {
  const imageSet = srcSet
    .split(", ")
    .map((str) => {
      const [url, dpi] = str.split(" ");
      return `url("${url}") ${dpi}`;
    })
    .join(", ");
  return `image-set(${imageSet})`;
}

export default function LandingPage() {
  const {
    props: { srcSet },
  } = getImageProps({
    alt: "Background image",
    width: 3517,
    height: 2048,
    src: "/landing-background.png",
  });

  const t = useTranslations();

  const configuration = useConfigurationProviderContext();

  return (
    <Grid
      sx={{
        backgroundImage: getBackgroundImage(srcSet),
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
      width="100vw"
      height="100vh"
      position="relative"
    >
      <CookieConsent />
      <div
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#6E87B766",
          position: "absolute",
          zIndex: 1,
          backdropFilter: "blur(8px)",
        }}
      />
      <Grid
        width="100%"
        height="100%"
        container
        flexDirection="column"
        position="relative"
        zIndex={10}
      >
        <Navbar elevated={false} />
        <Grid
          container
          alignItems="center"
          flexDirection="column"
          justifyItems="center"
          justifyContent="center"
          flex="1"
          gap={16}
        >
          <Grid
            container
            flexDirection="column"
            alignItems="flex-start"
            spacing={2}
          >
            <Typography padding="8px 16px" variant="h4" bgcolor="white">
              HAMBURG
            </Typography>
            <Typography padding="8px 16px" variant="h6" bgcolor="white">
              {t("landingpage.in-3d-and-virtual-reality")}
            </Typography>
          </Grid>
          <Button
            color="primary"
            href={configuration.unityDownloadLink}
            variant="contained"
          >
            {t("landingpage.download")}
          </Button>
        </Grid>
        <Footer />
      </Grid>
    </Grid>
  );
}
