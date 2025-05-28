import { Box, Grid2, Tab, Tabs, Typography } from "@mui/material";
import { SelectedObjectResolved } from "./ViewerProvider";
import TransformSwitch from "./ObjectPropertySwitch";
import { Note, TransformOutlined } from "@mui/icons-material";
import { useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  if (value !== index) return null;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{ height: "100%", overflowY: "auto" }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function ObjectProperties({
  selectedObject,
}: {
  selectedObject: SelectedObjectResolved | null;
}) {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <Grid2 flex={1} container height="100%">
      <Tabs
        style={{ padding: 0, borderRight: "1px solid black", height: "100%" }}
        orientation="vertical"
        variant="scrollable"
        value={selectedTab}
      >
        <Tab
          style={{ padding: 0, minWidth: 0, width: 48 }}
          label={<TransformOutlined />}
          onClick={() => setSelectedTab(0)}
          value={0}
        />
        <Tab
          style={{ padding: 0, minWidth: 0, width: 48 }}
          label={<Note />}
          onClick={() => setSelectedTab(1)}
          value={1}
        />
      </Tabs>
      <TabPanel index={0} value={selectedTab}>
        {selectedObject ? (
          <TransformSwitch selectedObject={selectedObject} />
        ) : (
          "-"
        )}
      </TabPanel>
    </Grid2>
  );
}
