import {
  Cartesian3,
  HeadingPitchRoll,
  Matrix3,
  Matrix4,
  Quaternion,
  Transforms
} from "cesium";
import proj4 from "proj4";
import proj4List from "proj4-list";

export function createTranslationRotationScaleFromModelMatrixOptional(
  matrix: Matrix4
) {
  const scale = Matrix4.getScale(matrix, new Cartesian3());
  const translation = Matrix4.getTranslation(matrix, new Cartesian3());

  const rotationMatrix = Matrix4.getRotation(matrix, new Matrix3());

  const rotation = Quaternion.fromRotationMatrix(
    rotationMatrix,
    new Quaternion()
  );

  return { scale, translation, rotation };
}

export function createModelMatrixFromModelMatrixAndOptionalTranslationOrRotationOrScale(
  matrix: Matrix4,
  translation?: Cartesian3,
  rotation?: Quaternion,
  scale?: Cartesian3
) {
  const newScale = scale ?? Matrix4.getScale(matrix, new Cartesian3());
  const newTranslation =
    translation ?? Matrix4.getTranslation(matrix, new Cartesian3());

  const rotationMatrix = Matrix4.getRotation(matrix, new Matrix3());

  const newRotation =
    rotation ?? Quaternion.fromRotationMatrix(rotationMatrix, new Quaternion());

  return Matrix4.fromTranslationQuaternionRotationScale(
    newTranslation,
    newRotation,
    newScale
  );
}

export function convertTranslationFromCesiumToUserEpsg(translation: { x: number, y: number, z: number },
  epsgCode: string) {
  const epsgValues = Object.values(proj4List)
    .map(([epsg, proj4]) => ({
      value: proj4,
      label: epsg,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const foundEpsg = epsgValues.find((epsg) => epsg.label === epsgCode)!;

  const transformer = proj4("+proj=geocent +datum=WGS84 +units=m +no_defs +type=crs", foundEpsg.value);

  const [x, y, z] = transformer.forward([translation.x, translation.y, translation.z]);

  return { x: x.toFixed(5), y: y.toFixed(5), z: z.toFixed(5) };
}

export function convertRotationFromCesiumToUser(rotation: { x: number, y: number, z: number, w: number }, origin: { x: number, y: number, z: number }) {
  const m = Transforms.eastNorthUpToFixedFrame(
    new Cartesian3(origin.x, origin.y, origin.z)
  );
  const R = Matrix4.getRotation(m, new Matrix3());
  const localToEarth = Quaternion.fromRotationMatrix(R, new Quaternion());
  const earthToLocal = Quaternion.inverse(localToEarth, new Quaternion());

  const qE = new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
  // Correct: Q_local = Q_E→L * Q_ECEF
  const qLocal = Quaternion.multiply(earthToLocal, qE, new Quaternion());

  const hpr = HeadingPitchRoll.fromQuaternion(qLocal);

  return { x: ((hpr.heading * 180) / Math.PI).toFixed(5), y: ((hpr.pitch * 180) / Math.PI).toFixed(5), z: ((hpr.roll * 180) / Math.PI).toFixed(5) }
}
