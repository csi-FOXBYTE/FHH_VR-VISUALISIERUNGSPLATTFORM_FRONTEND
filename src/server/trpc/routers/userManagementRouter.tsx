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
    list: protectedProcedure.input(dataGridZod).query(async (opts) =>
      opts.ctx.db.user.paginate(
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
    list: protectedProcedure
      .input(dataGridZod)
      .query(async (opts) => opts.ctx.db.group.paginate({}, opts.input)),
    createGroup: protectedProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async () => {}),
  },
  roles: {
    list: protectedProcedure
      .input(dataGridZod)
      .query(async (opts) =>
        opts.ctx.db.role.paginate(
          { select: { name: true, id: true } },
          opts.input
        )
      ),
  },
  permissions: {
    getPerRoleId: protectedProcedure
      .input(z.object({ roleId: z.string() }))
      .query(async (opts) => {
        return await opts.ctx.db.role.findFirstOrThrow({
          where: {
            id: opts.input.roleId,
          },
          select: {
            assignedPermissions: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        });
      }),
    getAllRoles: protectedProcedure.query(async (opts) => {
      return await opts.ctx.db.role.findMany({
        select: {
          name: true,
          id: true,
        },
      });
    }),
  },
});

export default userManagementRouter;
