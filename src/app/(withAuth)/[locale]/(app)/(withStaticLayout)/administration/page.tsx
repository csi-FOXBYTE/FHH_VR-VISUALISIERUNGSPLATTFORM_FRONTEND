"use client";

import { ArrowRightOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  GridProps,
  Link,
  Typography,
} from "@mui/material";

const cardProps: GridProps<typeof Card> = {
  size: {
    xl: 6,
    lg: 6,
    md: 6,
    sm: 12,
    xs: 12,
  },
  component: Card,
  padding: 3,
  elevation: 2,
  borderRadius: 1,
};

export default function AdministrationPage() {
  return (
    <Grid container spacing={4} flexDirection="column">
      <Typography variant="h4">Administration</Typography>
      <Grid container spacing={2}>
        <Grid {...cardProps}>
          <CardHeader title="Datenverwaltung" />
          <CardContent></CardContent>
          <CardActions>
            <Button
              variant="text"
              endIcon={<ArrowRightOutlined />}
              href="/profile"
              color="secondary"
              LinkComponent={Link}
            ></Button>
          </CardActions>
        </Grid>
        <Grid {...cardProps}>
          <CardHeader title="Nutzer- und Gruppenverwaltung" />
          <CardContent></CardContent>
          <CardActions>
            <Button
              variant="text"
              endIcon={<ArrowRightOutlined />}
              href="/profile"
              color="secondary"
              LinkComponent={Link}
            ></Button>
          </CardActions>
        </Grid>
        <Grid {...cardProps}>
          <CardHeader title="Systemaktivitäten und Logs" />
          <CardContent></CardContent>
          <CardActions>
            <Button
              variant="text"
              endIcon={<ArrowRightOutlined />}
              href="/profile"
              color="secondary"
              LinkComponent={Link}
            ></Button>
          </CardActions>
        </Grid>
        <Grid {...cardProps}>
          <CardHeader title="Konfiguration" />
          <CardContent></CardContent>
          <CardActions>
            <Button
              variant="text"
              endIcon={<ArrowRightOutlined />}
              href="/profile"
              color="secondary"
              LinkComponent={Link}
            ></Button>
          </CardActions>
        </Grid>
      </Grid>
    </Grid>
  );
}
