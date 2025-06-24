import BreadCrumbs from "@/components/navbar/BreadCrumbs";
import { Grid, Paper } from "@mui/material";
import { ReactNode } from "react";

export default function WithStaticLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Grid
      component={Paper}
      elevation={0}
      container
      flexDirection="column"
      flexWrap="nowrap"
      sx={{
        flex: 1,
        overflow: "hidden",
        padding: "32px 64px",
        boxSizing: "border-box",
        overflowY: "auto",
        height: "100%",
        width: "100%",
      }}
    >
      <BreadCrumbs />
      {children}
    </Grid>
  );
}
