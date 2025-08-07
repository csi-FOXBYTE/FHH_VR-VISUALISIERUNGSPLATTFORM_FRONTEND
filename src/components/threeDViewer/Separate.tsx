import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Separate({
  selector,
  children,
}: {
  selector: string;
  children?: ReactNode;
}) {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateOverlays() {
      const { left, right, top, bottom, width, height } = document
        .querySelector(selector)!
        .getBoundingClientRect();

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (centerRef.current) {
        Object.assign(centerRef.current.style, {
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`,
        });
      }

      if (topRef.current) {
        Object.assign(topRef.current.style, {
          top: "0px",
          left: "0px",
          width: `${vw}px`,
          height: `${top}px`,
        });
      }

      if (bottomRef.current) {
        Object.assign(bottomRef.current.style, {
          top: `${bottom}px`,
          left: "0px",
          width: `${vw}px`,
          height: `${vh - bottom}px`,
        });
      }

      if (leftRef.current) {
        Object.assign(leftRef.current.style, {
          top: `${top}px`,
          left: "0px",
          width: `${left}px`,
          height: `${bottom - top}px`,
        });
      }

      if (rightRef.current) {
        Object.assign(rightRef.current.style, {
          top: `${top}px`,
          left: `${right}px`,
          width: `${vw - right}px`,
          height: `${bottom - top}px`,
        });
      }
    }

    // initial positioning
    updateOverlays();
    // update on resize or when startingPoints change
    window.addEventListener("resize", updateOverlays);
    return () => {
      window.removeEventListener("resize", updateOverlays);
    };
  }, [selector]);

  // render four panels that dim everything except the rectangle
  return createPortal(
    <>
      <div
        ref={topRef}
        style={{
          position: "fixed",
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
      <div
        ref={bottomRef}
        style={{
          position: "fixed",
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
      <div
        ref={leftRef}
        style={{
          position: "fixed",
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
      <div
        ref={rightRef}
        style={{
          position: "fixed",
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
      <div
        ref={centerRef}
        style={{
          pointerEvents: "none",
          zIndex: 9999,
          position: "fixed",
        }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}
