import { Box, styled } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";
import { useCesium } from "resium";

const Wrapper = styled("div")`
  width: 64px;
  height: 64px;
`;

const Ring = styled(Box)`
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  margin: auto;
  position: relative;
  will-change: transform;
  backdrop-filter: blur(16px);
  border-radius: 50%;
  background: #aaa;
  overflow: hidden;
  &:hover {
    background: rgba(0, 0, 0, 0.75);
  }
  &:hover > div {
    filter: drop-shadow(0 0 4px white);
  }
`;

const NorthArrow = styled("div")`
  border-bottom: 20px solid red;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  width: 0;
  height: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  z-index: -1;
`;

const SouthArrow = styled(Box)`
  border-top: 20px solid white;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  width: 0;
  height: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 0%);
  z-index: -1;
`;

export default function Compass() {
  const cubeRef = useRef<HTMLDivElement>(null);

  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer) return;

    const handler = () => {
      if (!cubeRef.current) return;

      cubeRef.current.style.transform = `rotateZ(${viewer.camera.heading}rad)`;
    };

    viewer.clock.onTick.addEventListener(handler);

    return () => {
      viewer.clock.onTick.removeEventListener(handler);
    };
  }, [viewer]);

  const handleSetHeadingNorth = useCallback(() => {
    if (!viewer) return;

    if (!viewer.scene.camera) return;

    viewer.scene.camera.setView({
      orientation: {
        heading: 0,
        pitch: viewer.scene.camera.pitch,
        roll: viewer.scene.camera.roll,
      },
      convert: false,
    });
  }, [viewer]);

  return (
    <div style={{ position: "absolute", bottom: 16, right: 16 }}>
      <Wrapper>
        <Ring boxShadow={2} onClick={handleSetHeadingNorth} ref={cubeRef}>
          <NorthArrow />
          <SouthArrow />
        </Ring>
      </Wrapper>
    </div>
  );
}
