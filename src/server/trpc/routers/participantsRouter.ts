import { z } from "zod";
import { protectedProcedure, router } from "..";
import { createOrderBy } from "@/server/prisma/utils";

const participantsRouter = router({

  getParticipants: protectedProcedure([])
    .input(
      z.object({
        limit: z.number().optional(),
        skip: z.number().optional(),
        projectId: z.string(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      })
    )
    .query(async (opts) => {
      const data = await opts.ctx.db.user.findMany({
        skip: opts.input.skip,
        take: opts.input.limit,
        orderBy: createOrderBy(
          "User",
          opts.input.sortBy,
          opts.input.sortOrder
        ),
        where: {
          participatingProjects: {
            some: {
              id: opts.input.projectId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          roles: true,
          department: true,
          etage: true,
        },
      });
      const count = await opts.ctx.db.requirement.count({
        where: {
          projectId: opts.input.projectId,
        },
      });
      return { data, count };
    }),

  searchParticipant: protectedProcedure([])
    .input(z.object({ name: z.string() }))
    .query(async (opts) => {
      const participants = await opts.ctx.db.user.findMany({
        take: 10,
        skip: 0,
        orderBy: {
          name: "asc",
        },
        select: {
          name: true,
          id: true,
        },
        where: {
          name: {
            contains: opts.input.name,
            mode: "insensitive",
          },
        },
      });

      return participants.map((participant) => ({
        label: participant.name,
        value: participant.id,
        option: participant.name
      }));
    }),

  deleteParticipant: protectedProcedure([])
    .input(
      z.object({
        projectId: z.string(),
        participantId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { projectId, participantId } = opts.input;

      try {
        await opts.ctx.db.$transaction(async (prisma) => {
          const project = await prisma.project.findFirstOrThrow({
            where: { id: projectId },
            include: { participants: true },
          });

          const participantExists = project.participants.some(
            (participant) => participant.id === participantId
          );

          if (!participantExists) {
            throw new Error("Participant not found in project");
          }

          await prisma.project.update({
            where: { id: projectId },
            data: {
              participants: {
                disconnect: { id: participantId },
              },
            },
          });
        });

        return { success: true, message: "Participant successfully removed" };
      } catch (error) {
        console.error("Error removing participant:", error);
        return { success: false, message: (error as Error).message || "An error occurred" };
      }
    }),
});

export default participantsRouter;