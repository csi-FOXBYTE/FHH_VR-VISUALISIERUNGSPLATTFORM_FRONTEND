import { Grid, styled } from "@mui/material";
import { ReactNode, useEffect, useRef } from "react";

const Handle = styled("div")`
  position: absolute;
  top: 0;
  transform: translateY(-50%);
  left: 0;
  height: 32px;
  width: 100%;
  background: transparent;
  z-index: 20;
  cursor: row-resize;
  user-select: none;
  &:hover {
    background: rgba(0, 0, 0, 0.25);
  }
`;

export default function SplitPane({
  bottom,
  top,
}: {
  top: ReactNode;
  bottom: ReactNode;
}) {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mouseDownRef = useRef({ mouseDown: false, y: 0 });

  useEffect(() => {
    const mouseMoveHandler = (event: MouseEvent) => {
      if (!mouseDownRef.current.mouseDown) return;
      const topRefRects = topRef.current!.getBoundingClientRect();
      const bottomRefRects = bottomRef.current!.getBoundingClientRect();

      const totalHeight = topRefRects.height + bottomRefRects.height + 1;

      const y = Math.min(
        totalHeight - 16,
        Math.max(16, event.clientY - topRefRects.y)
      );

      const factor = y / totalHeight;

      topRef.current!.style.height = `${factor * 100}%`;
      bottomRef.current!.style.height = `${(1 - factor) * 100}%`;
    };

    const mouseUpHandler = () => {
      if (!mouseDownRef.current.mouseDown) return;
      mouseDownRef.current.mouseDown = false;
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);

    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };
  }, []);

  return (
    <Grid width="100%" height="100%" overflow="hidden">
      <div
        ref={topRef}
        style={{ height: "50%", overflowX: "hidden", overflowY: "auto" }}
      >
        {top}
      </div>
      <div
        style={{
          flexShrink: 0,
          position: "relative",
          height: 1,
          background: "#aaa",
        }}
      >
        <Handle
          draggable={false}
          onMouseDown={(event) => {
            mouseDownRef.current.mouseDown = true;
            mouseDownRef.current.y = event.clientY;
          }}
        />
      </div>
      <div
        ref={bottomRef}
        style={{ height: "50%", overflowX: "hidden", overflowY: "auto" }}
      >
        {bottom}
      </div>
    </Grid>
  );
}
