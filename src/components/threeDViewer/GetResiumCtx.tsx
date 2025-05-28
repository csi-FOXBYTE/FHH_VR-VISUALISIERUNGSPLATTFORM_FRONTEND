import { useEffect } from "react";
import { useCesium } from "resium";
import { useViewerStore } from "./ViewerProvider";

export default function GetResiumCtx() {
  const ctx = useCesium();

  const setCtx = useViewerStore((state) => state.setCtx);

  useEffect(() => {
    setCtx(ctx);
  }, [ctx, setCtx]);

  return null;
}
