import { z } from "zod";
import { generatePermissionProtectedProcedure, router } from "..";

const safeTransformNumber = (v: string | undefined): number | undefined => {
  if (v === undefined) return v;

  const parsedNumber = parseInt(v);

  if (Number.isNaN(parsedNumber) || !Number.isFinite(parsedNumber))
    return undefined;

  return parsedNumber;
};

const configurationProcedure = generatePermissionProtectedProcedure([
  "CONFIGURATION_ADMINISTRATOR",
]);

const configurationRouter = router({
  update: configurationProcedure
    .input(
      z.object({
        id: z.string(),
        defaultEPSG: z.string().optional(),
        globalStartPointX: z.number().optional(),
        globalStartPointY: z.number().optional(),
        globalStartPointZ: z.number().optional(),
        uiGlobalStartPointX: z.string().optional(),
        uiGlobalStartPointY: z.string().optional(),
        uiGlobalStartPointZ: z.string().optional(),
        uiGlobalStartPointEpsg: z.string().optional(),
        invitationEmailText: z.string().optional(),
        localProcessorFolder: z.string().optional(),
        maxParallelBaseLayerConversions: z.number().optional(),
        maxParallelFileConversions: z.number().optional(),
        invitationCancelledEmailDE: z.string().optional(),
        invitationCancelledEmailEN: z.string().optional(),
        invitationEmailDE: z.string().optional(),
        invitationEmailEN: z.string().optional(),
        invitationUpdatedEmailDE: z.string().optional(),
        invitationUpdatedEmailEN: z.string().optional(),
        predeletionEmailDE: z.string().optional(),
        predeletionEmailEN: z.string().optional(),
        emailUser: z.string().optional(),
        emailPassword: z.string().optional(),
        emailHost: z.string().optional(),
        emailPort: z.number().optional(),
        emailSecure: z.boolean().optional(),
        emailPlatformAddress: z.string().optional(),
        maximumFlyingHeight: z.number().optional(),
        userProfileLink: z.string().optional(),
        systemActivityLink: z.string().optional(),
        unityDownloadLink: z.string().optional(),
        used3DTileConversionThreads: z
          .string()
          .optional()
          .transform(safeTransformNumber),
        usedTerrainConversionThreads: z
          .string()
          .optional()
          .transform(safeTransformNumber),
      }),
    )
    .mutation(async (opts) => {
      const { id, ...data } = opts.input;
      return await opts.ctx.db.configuration.update({
        where: {
          id,
        },
        data,
      });
    }),
  getFull: configurationProcedure.query(async (opts) => {
    return await opts.ctx.db.configuration.findFirstOrThrow({});
  }),
});

export default configurationRouter;
