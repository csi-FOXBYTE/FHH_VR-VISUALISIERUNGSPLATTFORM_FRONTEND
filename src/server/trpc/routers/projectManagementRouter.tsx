import { dataGridZod } from "@/components/dataGridServerSide/zodTypes";
import {
  projectGridDefinition,
  sharedProjectGridDefinition,
} from "@/components/dataGridServerSide/gridDefinitions";
import { protectedProcedure, router } from "..";
import { z } from "zod";
import { gridTransactionOptions } from "@/server/prisma/gridTransactionOptions";
import { randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import type { Session } from "next-auth";
import prisma from "@/server/prisma";

const ownerIdZod = z.string().min(1);

function canAdministrativelyTransferOwner(
  session: Session,
) {
  return session.user.assignedGroups.some((group) =>
    group.assignedRoles.some((role) => role.isAdminRole),
  );
}

async function assertEligibleProjectOwner(
  db: {
    user: {
      findFirst: (args: {
        where: object;
        select: { id: true };
      }) => Promise<{ id: string } | null>;
    };
  },
  ownerId: string,
) {
  const owner = await db.user.findFirst({
    where: {
      id: ownerId,
      assignedGroups: {
        some: {
          assignedRoles: {
            some: {
              OR: [
                { isAdminRole: true },
                { assignedPermissions: { has: "PROJECT_OWNER" } },
              ],
            },
          },
        },
      },
    },
    select: { id: true },
  });
  if (!owner) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Selected user is not eligible to own projects.",
    });
  }
}

const projectManagementRouter = router({
  listMyProjects: protectedProcedure.input(dataGridZod).query(
    async (opts) =>
      await opts.ctx.db.$transaction((tx) => tx.project.paginate(
        {
          where: {
            ownerId: opts.ctx.session.user.id,
          },
          select: {
            id: true,
            description: true,
            title: true,
            visibleForUsers: {
              select: {
                name: true,
              },
            },
            owner: {
              select: {
                name: true,
              },
            },
            visibleForGroups: {
              select: {
                name: true,
              },
            },
          },
        },
        opts.input,
        projectGridDefinition,
      ), gridTransactionOptions),
  ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        visibleForUsers: z.array(z.string()),
        visibleForGroups: z.array(z.string()),
        owner: ownerIdZod,
      }),
    )
    .mutation(async (opts) => {
      // Use the trusted server client so the audit model can remain completely
      // inaccessible through browser-facing ZenStack policies. Authorization
      // for this narrowly scoped mutation is enforced explicitly below.
      return prisma.$transaction(async (tx) => {
        const current = await tx.project.findFirstOrThrow({
          where: { id: opts.input.id },
          select: { ownerId: true },
        });
        const isCurrentOwner = current.ownerId === opts.ctx.session.user.id;
        if (
          !isCurrentOwner &&
          !canAdministrativelyTransferOwner(opts.ctx.session)
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await assertEligibleProjectOwner(tx, opts.input.owner);
        const updated = await tx.project.update({
          where: { id: opts.input.id },
          data: {
            owner: { connect: { id: opts.input.owner } },
            title: opts.input.title,
            description: opts.input.description,
            visibleForGroups: {
              set: opts.input.visibleForGroups.map((id) => ({ id })),
            },
            visibleForUsers: {
              set: opts.input.visibleForUsers.map((id) => ({ id })),
            },
          },
        });
        if (current.ownerId !== opts.input.owner) {
          await tx.ownershipAuditEvent.create({
            data: {
              correlationId: randomUUID(),
              action: current.ownerId ? "OWNER_TRANSFER" : "ORPHAN_REPAIR",
              entityType: "PROJECT",
              entityId: opts.input.id,
              actorUserId: opts.ctx.session.user.id,
              previousOwnerId: current.ownerId,
              newOwnerId: opts.input.owner,
            },
          });
        }
        return updated;
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        visibleForUsers: z.array(z.string()),
        visibleForGroups: z.array(z.string()),
        owner: ownerIdZod,
      }),
    )
    .mutation(async (opts) => {
      await assertEligibleProjectOwner(opts.ctx.db, opts.input.owner);
      return await opts.ctx.db.project.create({
        data: {
          owner: {
            connect: {
              id: opts.input.owner,
            },
          },
          description: opts.input.description,
          title: opts.input.title,
          visibleForGroups: {
            connect: opts.input.visibleForGroups.map((id) => ({ id })),
          },
          visibleForUsers: {
            connect: opts.input.visibleForUsers.map((id) => ({ id })),
          },
        },
        select: {
          id: true,
        },
      });
    }),
  getFullEntry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async (opts) => {
      const fullEntry = await opts.ctx.db.project.findFirstOrThrow({
        where: {
          id: opts.input.id,
        },
        select: {
          title: true,
          description: true,
          visibleForUsers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          owner: {
            select: {
              name: true,
              id: true,
              email: true,
            },
          },
          visibleForGroups: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        ...fullEntry,
        visibleForGroups: fullEntry.visibleForGroups.map((v) => ({
          label: v.name,
          value: v.id,
        })),
        visibleForUsers: fullEntry.visibleForUsers.map((v) => ({
          label: v.name,
          value: v.id,
        })),
        owner: fullEntry.owner
          ? {
              label: `${fullEntry.owner.name} (${fullEntry.owner.email})`,
              value: fullEntry.owner.id,
            }
          : null,
      };
    }),
  getPossibleUsers: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async (opts) => {
      const possibleUsers = await opts.ctx.db.user.findMany({
        take: 50,
        where: {
          OR: [
            {
              name: {
                contains: opts.input.search,
              },
            },
            {
              email: {
                contains: opts.input.search,
              },
            },
          ],
        },
        select: {
          name: true,
          email: true,
          id: true,
        },
      });

      return possibleUsers.map((p) => ({
        label: `${p.name} (${p.email})`,
        value: p.id,
      }));
    }),
  getPossibleOwners: protectedProcedure
    .input(z.object({ search: z.string().max(200) }))
    .query(async (opts) => {
      const possibleOwners = await opts.ctx.db.user.findMany({
        take: 50,
        where: {
          AND: [
            {
              OR: [
                { name: { contains: opts.input.search, mode: "insensitive" } },
                { email: { contains: opts.input.search, mode: "insensitive" } },
              ],
            },
            {
              assignedGroups: {
                some: {
                  assignedRoles: {
                    some: {
                      OR: [
                        { isAdminRole: true },
                        { assignedPermissions: { has: "PROJECT_OWNER" } },
                      ],
                    },
                  },
                },
              },
            },
          ],
        },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        select: { name: true, email: true, id: true },
      });
      return possibleOwners.map((owner) => ({
        label: `${owner.name} (${owner.email})`,
        value: owner.id,
      }));
    }),
  getPossibleGroups: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async (opts) => {
      const possibleGroups = await opts.ctx.db.group.findMany({
        take: 50,
        where: {
          OR: [
            {
              name: {
                contains: opts.input.search,
              },
            },
          ],
        },
        select: {
          name: true,
          id: true,
        },
      });

      return possibleGroups.map((p) => ({
        label: p.name,
        value: p.id,
      }));
    }),
  listSharedProjects: protectedProcedure
    .input(dataGridZod)
    .query(async (opts) => {
      return await opts.ctx.db.$transaction((tx) => tx.project.paginate(
        {
          where: {
            AND: [
              {
                ownerId: {
                  not: opts.ctx.session.user.id,
                },
              },
              {
                OR: [
                  {
                    visibleForGroups: {
                      some: {
                        assignedUsers: {
                          some: {
                            id: opts.ctx.session.user.id,
                          },
                        },
                      },
                    },
                  },
                  {
                    visibleForUsers: {
                      some: {
                        id: opts.ctx.session.user.id,
                      },
                    },
                  },
                ],
              },
            ],
          },
          select: {
            id: true,
            description: true,
            title: true,
            owner: {
              select: {
                name: true,
              },
            },
          },
        },
        opts.input,
        sharedProjectGridDefinition,
      ), gridTransactionOptions);
    }),
});

export default projectManagementRouter;
