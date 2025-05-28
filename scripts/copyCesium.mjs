import { cpSync } from "fs";

cpSync("node_modules/cesium/Build/Cesium", "public/cesium", {
  recursive: true,
  dereference: true,
});
