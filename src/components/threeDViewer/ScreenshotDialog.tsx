import { Button, Grid } from "@mui/material";
import Separate from "./Separate";
import { Camera } from "@mui/icons-material";
import { useViewerStore } from "./ViewerProvider";
import { useTranslations } from "next-intl";

export function useIsScreenshotDialogOpen() {
  const screenshotDialogOpen = useViewerStore(
    (state) => state.tools.screenshotDialogOpen
  );

  return screenshotDialogOpen;
}

export default function ScreenshotDialog() {
  const t = useTranslations();
  
  const tools = useViewerStore((state) => state.tools);

  if (!tools.screenshotDialogOpen) return null;

  return (
    <>
      <Separate selector=".cesium-viewer">
        <Grid
          container
          justifyContent="center"
          justifyItems="center"
          alignItems="center"
          sx={{ width: "100%", height: "100%", pointerEvents: "all" }}
        >
          <Button
            variant="contained"
            onClick={() => tools.screenshotButtonPressedResolve()}
            startIcon={<Camera />}
          >
            {t('editor.take-screenshot')}
          </Button>
        </Grid>
      </Separate>
    </>
  );
}
