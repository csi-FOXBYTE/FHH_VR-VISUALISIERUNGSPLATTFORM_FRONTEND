import { Grid, GridProps } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  visible: boolean;
  index: number;
  value: number;
}

export function TabPanel(props: TabPanelProps & GridProps) {
  const { children, value, index, style, ...other } = props;

  if (value !== index || !props.visible) return null;

  return (
    <Grid
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{
        height: "100%",
        width: "100%",
        flex: 1,
        overflowY: "auto",
        ...style
      }}
      {...other}
    >
      {value === index && children}
    </Grid>
  );
}
