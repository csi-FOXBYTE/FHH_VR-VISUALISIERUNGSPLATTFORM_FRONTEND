import { z } from "zod";
import { protectedProcedure, router } from "..";
import { dataGridZod } from "@/components/dataGridServerSide/zodTypes";

const userManagementRouter = router({
  users: {
    getFullUser: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async (opts) => {
        const user = await opts.ctx.db.user.findFirstOrThrow({
          where: {
            id: opts.input.id,
          },
          select: {
            assignedGroups: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        });

        return {
          assignedGroups: user.assignedGroups.map((assignedGroup) => ({
            label: assignedGroup.name,
            value: assignedGroup.id,
          })),
          email: "",
        };
      }),
    getPossibleGroups: protectedProcedure
      .input(z.object({ search: z.string() }))
      .query(async (opts) => {
        return (
          await opts.ctx.db.group.findMany({
            take: 20,
            select: {
              id: true,
              name: true,
            },
            where: {
              name: {
                contains: opts.input.search,
              },
            },
          })
        ).map((group) => ({ label: group.name, value: group.id }));
      }),
    list: protectedProcedure.input(dataGridZod).query(
      async (opts) =>
        await opts.ctx.db.user.paginate(
          {
            select: {
              name: true,
              id: true,
              email: true,
              image: true,
              assignedGroups: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
          },
          opts.input,
          ["name", "email"]
        )
    ),
    create: protectedProcedure
      .input(
        z.object({ email: z.string(), assignedGroups: z.array(z.string()) })
      )
      .mutation(async (opts) => {
        return await opts.ctx.db.user.create({
          data: {
            email: opts.input.email,
            assignedGroups: {
              connect: opts.input.assignedGroups.map((assignedGroup) => ({
                id: assignedGroup,
              })),
            },
          },
        });
      }),
    update: protectedProcedure
      .input(z.object({ id: z.string(), assignedGroups: z.array(z.string()) }))
      .mutation(async (opts) => {
        return await opts.ctx.db.user.update({
          where: {
            id: opts.input.id,
          },
          data: {
            assignedGroups: {
              set: opts.input.assignedGroups.map((assignedGroup) => ({
                id: assignedGroup,
              })),
            },
          },
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async (opts) => {
        return await opts.ctx.db.user.delete({ where: { id: opts.input.id } });
      }),
  },
  groups: {
    list: protectedProcedure.input(dataGridZod).query(
      async (opts) =>
        await opts.ctx.db.group.paginate(
          {
            select: {
              name: true,
              defaultFor: true,
              id: true,
              isAdminGroup: true,
              assignedRoles: {
                select: { name: true, id: true },
              },
            },
          },
          opts.input
        )
    ),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          assignedRoles: z.array(z.string()),
          defaultFor: z.string(),
        })
      )
      .mutation(async (opts) => {
        return await opts.ctx.db.group.create({
          data: {
            name: opts.input.name,
            assignedRoles: {
              connect: opts.input.assignedRoles.map((assignedRole) => ({
                id: assignedRole,
              })),
            },
            defaultFor: opts.input.defaultFor,
          },
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          assignedRoles: z.array(z.string()),
          id: z.string(),
          defaultFor: z.string(),
        })
      )
      .mutation(async (opts) => {
        return await opts.ctx.db.group.update({
          where: {
            id: opts.input.id,
          },
          data: {
            assignedRoles: {
              connect: opts.input.assignedRoles.map((assignedRole) => ({
                id: assignedRole,
              })),
            },
            defaultFor: opts.input.defaultFor,
            name: opts.input.name,
          },
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async (opts) => {
        return await opts.ctx.db.group.delete({
          where: {
            id: opts.input.id,
          },
        });
      }),
    getFullEntry: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async (opts) => {
        const group = await opts.ctx.db.group.findFirstOrThrow({
          where: {
            id: opts.input.id,
          },
          select: {
            name: true,
            defaultFor: true,
            assignedRoles: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        });

        return {
          ...group,
          assignedRoles: group.assignedRoles.map((assignedRole) => ({
            label: assignedRole.name,
            value: assignedRole.id,
          })),
        };
      }),
    getPossibleRoles: protectedProcedure
      .input(z.object({ search: z.string() }))
      .query(async (opts) => {
        return (
          await opts.ctx.db.role.findMany({
            take: 20,
            where: {
              name: {
                contains: opts.input.search,
              },
            },
            select: {
              name: true,
              id: true,
            },
          })
        ).map((role) => ({ label: role.name, value: role.id }));
      }),
  },
  roles: {
    list: protectedProcedure.query(
      async (opts) =>
        await opts.ctx.db.role.findMany({
          select: { name: true, id: true, isAdminRole: true },
        })
    ),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async (opts) => {
        return await opts.ctx.db.role.delete({
          where: {
            id: opts.input.id,
            isAdminRole: {
              not: true,
            },
          },
        });
      }),
    getPermissionsForRole: protectedProcedure
      .input(z.object({ roleId: z.string() }))
      .query(async (opts) => {
        const role = await opts.ctx.db.role.findFirstOrThrow({
          where: {
            id: opts.input.roleId,
          },
          select: {
            assignedPermissions: {
              select: {
                name: true,
              },
            },
          },
        });

        return role.assignedPermissions;
      }),
    create: protectedProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async (opts) => {
        return await opts.ctx.db.role.create({
          data: {
            name: opts.input.name,
          },
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string(),
          permissions: z.array(z.string()),
        })
      )
      .mutation(async (opts) => {
        return await opts.ctx.db.role.update({
          where: {
            id: opts.input.id,
            isAdminRole: {
              not: true,
            },
          },
          data: {
            assignedPermissions: {
              set: opts.input.permissions.map((permission) => ({
                name: permission,
              })),
            },
            name: opts.input.name,
          },
        });
      }),
  },
});

export default userManagementRouter;
