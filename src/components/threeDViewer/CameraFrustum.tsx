import {
  Cartesian3,
  Color,
  ColorGeometryInstanceAttribute,
  Ellipsoid,
  FrustumOutlineGeometry,
  GeometryInstance,
  Matrix3,
  PerInstanceColorAppearance,
  PerspectiveFrustum,
  Quaternion,
} from "cesium";
import { useEffect, useMemo } from "react";
import { Primitive } from "resium";

interface CameraFrustumProps {
  /** The world position of the camera frustum origin */
  position: Cartesian3;
  /** The world position where the frustum should end */
  target: Cartesian3;
  /** Vertical field of view in radians (default 45°) */
  fov?: number;
  /** Near plane distance (default 1) */
  near?: number;
  /** Frustum line color (default yellow) */
  color?: Color;
  onClick?: () => void;
}

const CameraFrustum: React.FC<CameraFrustumProps> = ({
  position,
  target,
  fov = Math.PI / 4,
  near = 1,
  color = Color.YELLOW,
  onClick,
}) => {
  const instance = useMemo(() => {
    // Compute the up vector as the ellipsoid normal at position
    const up = Ellipsoid.WGS84.geodeticSurfaceNormal(
      position,
      new Cartesian3()
    );
    Cartesian3.normalize(up, up);

    // Compute forward direction from origin to target
    const forward = Cartesian3.subtract(target, position, new Cartesian3());
    const far = Cartesian3.magnitude(forward);
    Cartesian3.normalize(forward, forward);

    // Compute right = up x forward
    const right = Cartesian3.cross(up, forward, new Cartesian3());
    Cartesian3.normalize(right, right);

    // Re-orthonormalize up = forward x right
    Cartesian3.cross(forward, right, up);

    // Build rotation matrix from local to world axes
    const rotationMatrix = new Matrix3(
      right.x,
      up.x,
      forward.x,
      right.y,
      up.y,
      forward.y,
      right.z,
      up.z,
      forward.z
    );

    const orientation = Quaternion.fromRotationMatrix(rotationMatrix);

    // Define a perspective frustum with computed far plane
    const frustum = new PerspectiveFrustum({
      fov,
      aspectRatio: 16 / 9,
      near,
      far,
    });

    // Create the outline geometry for the frustum
    const geometry = FrustumOutlineGeometry.createGeometry(
      new FrustumOutlineGeometry({
        frustum,
        origin: position,
        orientation,
      })
    );

    return new GeometryInstance({
      geometry: geometry!,
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(color),
      },
    });
  }, [position, target, fov, near, color]);

  return (
    <Primitive
      onClick={onClick}
      key={color.toCssColorString()}
      geometryInstances={[instance]}
      appearance={
        new PerInstanceColorAppearance({ flat: true, translucent: false })
      }
      asynchronous={false}
      releaseGeometryInstances={true}
    />
  );
};

export default CameraFrustum;
