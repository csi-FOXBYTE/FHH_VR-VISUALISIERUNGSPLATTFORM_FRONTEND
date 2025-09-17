import "server-only";
import prisma from "@/server/prisma";
import proj4list from "proj4-list";
import { ConfigurationProviderContextType } from "./ConfigurationProvider";

export async function createConfiguration(): Promise<ConfigurationProviderContextType> {
  const configuration = await prisma.configuration.findFirstOrThrow();

  const foundProj4Entry = Object.entries(proj4list).find(
    ([key]) => key === configuration.defaultEPSG
  );

  if (!foundProj4Entry) throw new Error("No matching proj4 string found!");

  const defaultEPSGLabelValue = {
    label: foundProj4Entry[1][0],
    value: foundProj4Entry[1][1],
  };

  return {
    ...configuration,
    defaultEPSGLabelValue,
    globalStartPoint: {
      x: configuration.globalStartPointX,
      y: configuration.globalStartPointY,
      z: configuration.globalStartPointZ,
    },
  };
}
