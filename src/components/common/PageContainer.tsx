import { Grid, GridProps } from "@mui/material";
import { ReactNode } from "react";

export default function PageContainer({
  children,
  ...props
}: {
  children: ReactNode;
} & GridProps) {
  return (
    <Grid container maxWidth="1440px" width="100%" margin="0 auto" spacing={4} flex="1" flexDirection="column" {...props}>
      {children}
    </Grid>
  );
}
