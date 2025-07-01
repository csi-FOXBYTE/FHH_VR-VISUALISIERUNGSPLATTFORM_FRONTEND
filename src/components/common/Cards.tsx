import { Link } from "@/server/i18n/routing";
import { ArrowRightOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  GridProps,
} from "@mui/material";
import { ReactNode } from "react";

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
  borderRadius: 0,
  display: "flex",
  flexDirection: "column",
};

export type CardProps = {
  items: {
    key: string;
    title: string;
    content: ReactNode;
    link: { href: string; label: string };
  }[];
};

export default function Cards({ items }: CardProps) {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.key} {...cardProps}>
          <CardHeader title={item.title} />
          <CardContent sx={{ flex: 1 }}>{item.content}</CardContent>
          <Grid component={CardActions} container justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              endIcon={<ArrowRightOutlined />}
              href={item.link.href}
              LinkComponent={Link}
            >
              {item.link.label}
            </Button>
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
}
