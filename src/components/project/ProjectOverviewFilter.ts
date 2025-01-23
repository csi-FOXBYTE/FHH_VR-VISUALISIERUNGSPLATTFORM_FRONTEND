import { PROJECT_STATUS } from "@prisma/client";
import { z } from "zod";

export const projectOverviewFilter = z.object({
  buildingId: z
    .string()
    .transform(s => s === "" ? undefined : s)
    .optional(),
  projectManagerId: z
    .string()
    .transform(s => s === "" ? undefined : s)
    .optional(),
  status: z
    .enum([
      PROJECT_STATUS.CRITICAL,
      PROJECT_STATUS.DELAYED,
      PROJECT_STATUS.IN_WORK,
      "",
    ])
    .transform(s => s === "" ? undefined : s)
    .optional(),
  myProjects: z.boolean().optional(),
});

export const projectOverviewFilterWithDefaults = projectOverviewFilter.default({
  buildingId: "",
  projectManagerId: "",
  status: "",
  myProjects: false,
}).parse;
