"use client";

import { useRouter } from "@/server/i18n/routing";
import { trpc } from "@/server/trpc/client";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid2,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

const StyledBox = styled(Box)({
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
});

const Headlines = styled("div")({
  marginBottom: "10rem",
});

const CardFooter = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "auto",
});

const GreyText = styled(Typography)({
  color: "grey",
});

//TODO: replace email with name!

export default function ProjectPage() {
  const { data = [] } = trpc.projectOverviewRouter.getProjects.useQuery();
  const t = useTranslations();
  const router = useRouter();
  const session = useSession();

  return (
    <StyledBox>
      <div>
        <Headlines>
          <Typography variant="h1">
            {t("routes./project.title", {
              userName: session.data?.user?.email,
            })}
          </Typography>
          <Typography variant="h4">{t("routes./project.subTitle")}</Typography>
        </Headlines>
        <div>
          <div>
            <Typography variant="h2">
              {t("routes./project.cardsHeader")}
            </Typography>
            <StyledBox>
              <Grid2
                container
                rowSpacing={{ xs: 1, sm: 4, md: 8 }}
                columnSpacing={{ xs: 1, sm: 4, md: 8 }}
              >
                <Grid2 size={6}>
                  <Card
                    component={Card}
                    onClick={() => router.push("/project/overview")}
                  >
                    <CardHeader title={t("routes./project.card1Title")} />
                    <CardContent>
                      <GreyText> {t("routes./project.card1Text")}</GreyText>
                      <CardFooter>
                        <Button variant="outlined">
                          {t("routes./project.cardsButtonText")}
                        </Button>
                      </CardFooter>
                    </CardContent>
                  </Card>
                </Grid2>
                <Grid2 size={6}>
                  <Card
                    component={Card}
                    onClick={() => router.push("/project/tasks")}
                  >
                    <CardHeader title={t("routes./project.card2Title")} />
                    <CardContent>
                      <GreyText> {t("routes./project.card2Text")}</GreyText>
                      <CardFooter>
                        <Button variant="outlined">
                          {t("routes./project.cardsButtonText")}
                        </Button>
                      </CardFooter>
                    </CardContent>
                  </Card>
                </Grid2>
                <Grid2 size={6}>
                  <Card
                    component={Card}
                    onClick={() => router.push("/project")}
                  >
                    <CardHeader title={t("routes./project.card3Title")} />
                    <CardContent>
                      <GreyText>{t("routes./project.card3Text")}</GreyText>
                      <CardFooter>
                        <Button disabled variant="outlined">
                          {t("routes./project.cardsButtonText")}
                        </Button>
                      </CardFooter>
                    </CardContent>
                  </Card>
                </Grid2>
                <Grid2 size={6}>
                  <Card
                    component={Card}
                    onClick={() => router.push("/project")}
                  >
                    <CardHeader title={t("routes./project.card4Title")} />
                    <CardContent>
                      <GreyText>{t("routes./project.card4Text")}</GreyText>
                      <CardFooter>
                        <Button variant="outlined" disabled>
                          {t("routes./project.cardsButtonText")}
                        </Button>
                      </CardFooter>
                    </CardContent>
                  </Card>
                </Grid2>
              </Grid2>
            </StyledBox>
          </div>
        </div>
      </div>
    </StyledBox>
  );
}
