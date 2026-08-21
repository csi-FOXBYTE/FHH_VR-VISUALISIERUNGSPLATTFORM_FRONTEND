import { z } from "zod";
import { generatePermissionProtectedProcedure, router } from "..";
import { dataGridZod } from "@/components/dataGridServerSide/zodTypes";
import { $Enums } from "@prisma/client";
import {
  groupGridDefinition,
  userGridDefinition,
} from "@/components/dataGridServerSide/gridDefinitions";
import { gridTransactionOptions } from "@/server/prisma/gridTransactionOptions";

const userManagementProcedure = generatePermissionProtectedProcedure([
  "USER_ADMINISTRATOR",
]);

const userManagementRouter = router({
  users: {
    getFullUser: userManagementProcedure
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
    getPossibleGroups: userManagementProcedure
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
    list: userManagementProcedure.input(dataGridZod).query(
      async (opts) =>
        await opts.ctx.db.$transaction((tx) => tx.user.paginate(
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
          userGridDefinition,
        ), gridTransactionOptions),
    ),
    create: userManagementProcedure
      .input(
        z.object({ email: z.string(), assignedGroups: z.array(z.string()) }),
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
    update: userManagementProcedure
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
    delete: userManagementProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async (opts) => {
        return await opts.ctx.db.user.delete({ where: { id: opts.input.id } });
      }),
  },
  groups: {
    list: userManagementProcedure.input(dataGridZod).query(
      async (opts) =>
        await opts.ctx.db.$transaction((tx) => tx.group.paginate(
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
          opts.input,
          groupGridDefinition,
        ), gridTransactionOptions),
    ),
    create: userManagementProcedure
      .input(
        z.object({
          name: z.string(),
          assignedRoles: z.array(z.string()),
          defaultFor: z.string(),
        }),
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
            defaultFor: opts.input.defaultFor.split(","),
          },
        });
      }),
    update: userManagementProcedure
      .input(
        z.object({
          name: z.string(),
          assignedRoles: z.array(z.string()),
          id: z.string(),
          defaultFor: z.string(),
        }),
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
            defaultFor: opts.input.defaultFor.split(","),
            name: opts.input.name,
          },
        });
      }),
    delete: userManagementProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async (opts) => {
        return await opts.ctx.db.group.delete({
          where: {
            id: opts.input.id,
          },
        });
      }),
    getFullEntry: userManagementProcedure
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
          defaultFor: group.defaultFor.join(","),
          assignedRoles: group.assignedRoles.map((assignedRole) => ({
            label: assignedRole.name,
            value: assignedRole.id,
          })),
        };
      }),
    getPossibleRoles: userManagementProcedure
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
    list: userManagementProcedure.query(async (opts) => {
      const roles = await opts.ctx.db.role.findMany({
        select: {
          name: true,
          id: true,
          isAdminRole: true,
          assignedPermissions: true,
        },
      });

      return roles;
    }),
    delete: userManagementProcedure
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
    getPermissionsForRole: userManagementProcedure
      .input(z.object({ roleId: z.string() }))
      .query(async (opts) => {
        const role = await opts.ctx.db.role.findFirstOrThrow({
          where: {
            id: opts.input.roleId,
          },
          select: {
            assignedPermissions: true,
          },
        });

        return role.assignedPermissions;
      }),
    create: userManagementProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async (opts) => {
        return await opts.ctx.db.role.create({
          data: {
            name: opts.input.name,
          },
        });
      }),
    update: userManagementProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string(),
          permissions: z.array(
            z.enum(["BASE_LAYER_OWNER", ...Object.values($Enums.PERMISSIONS)]),
          ),
        }),
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
            assignedPermissions: opts.input.permissions,
            name: opts.input.name,
          },
        });
      }),
  },
});

export default userManagementRouter;
