import { Box, styled } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";
import { useCesium } from "resium";

const Wrapper = styled("div")`
  width: 100px;
  height: 100px;
`;

const Ring = styled("div")`
  width: 50%;
  height: 50%;
  top: 25%;
  transform-style: preserve-3d;
  margin: auto;
  position: relative;
  will-change: transform;
  backdrop-filter: blur(16px);
  border-radius: 50%;
  background: #aaa;
  overflow: hidden;
  transition: all 0.1s ease;
  &:hover {
    background: rgba(0, 0, 0, 0.75);
  }
  &:hover > div {
    filter: drop-shadow(0 0 4px white);
  }
`;

const NorthArrow = styled("div")`
  border-bottom: 16px solid red;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  width: 0;
  height: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  z-index: -1;
  transition: all 0.1s ease;
`;

const SouthArrow = styled(Box)`
  border-top: 16px solid white;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  width: 0;
  height: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 0%);
  z-index: -1;
  transition: all 0.1s ease;
`;

export default function Compass() {
  const cubeRef = useRef<HTMLDivElement>(null);

  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer) return;

    const handler = () => {
      if (!cubeRef.current) return;

      if (!viewer.scene.camera) return;

      cubeRef.current.style.transform = `rotateZ(${viewer.scene.camera.heading}rad)`;
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
    <div style={{ position: "absolute", bottom: 0, right: 0 }}>
      <Wrapper>
        <Ring onClick={handleSetHeadingNorth} ref={cubeRef}>
          <NorthArrow />
          <SouthArrow />
        </Ring>
      </Wrapper>
    </div>
  );
}
