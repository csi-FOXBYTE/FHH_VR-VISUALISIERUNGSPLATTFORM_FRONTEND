import { CRUD_PERMISSIONS_SET } from "@/constants/permissions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  await prisma.configuration.create({
    data: {
      defaultEPSG: "EPSG:25832",
      localProcessorFolder: "D:\\processor",
      globalStartPointX: 3764595.8724393756,
      globalStartPointY: 664200.4499076013,
      globalStartPointZ: 5144292.106228131,
      invitationEmailText: "",
      maxParallelBaseLayerConversions: 1,
      maxParallelFileConversions: 1,
    },
  });

  const permissions = await prisma.$transaction(
    Array.from(CRUD_PERMISSIONS_SET).map((permission) =>
      prisma.permission.create({
        data: { name: permission },
      })
    )
  );

  const { id: superAdminRoleId } = await prisma.role.create({
    data: {
      name: "Super Admin",
      assignedPermissions: {
        connect: permissions.map((permission) => ({ id: permission.id })),
      },
    },
  });

  const { id: adminRoleId } = await prisma.role.create({
    data: {
      name: "Admin",
      assignedPermissions: {
        connect: permissions.map((permission) => ({ id: permission.id })),
      },
    },
  });

  const { id: guestRoleId } = await prisma.role.create({
    data: {
      name: "Guest",
      assignedPermissions: {
        connect: permissions
          .filter((permission) => permission.name.endsWith("READ"))
          .map((permission) => ({ id: permission.id })),
      },
    },
  });

  const { id: adminGroupId } = await prisma.group.create({
    data: {
      name: "Administrator",
      defaultFor: "*@csi-online.de",
      isAdminGroup: true,
      assignedRoles: {
        connect: {
          id: superAdminRoleId,
        },
      },
    },
  });

  const { id: guestGroupId } = await prisma.group.create({
    data: {
      name: "Guest",
      defaultFor: "!*@csi-online.de",
      isAdminGroup: false,
      assignedRoles: {
        connect: {
          id: guestRoleId,
        },
      },
    },
  });

  const { id } = await prisma.user.create({
    data: {
      email: "admin@foxbyte.de",
      name: "Admin Foxbyte",
      assignedGroups: { connect: { id: adminGroupId } },
    },
    select: {
      id: true,
    },
  });

  await prisma.visualAxis.createMany({
    data: [
      {
        ownerId: id,
        endPointX: 0,
        endPointY: 0,
        endPointZ: 0,
        name: "Test",
        startPointX: 0,
        startPointY: 0,
        startPointZ: 0,
      },
    ],
  });

  await prisma.baseLayer.create({
    data: {
      ownerId: id,
      href: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/area1/tileset.json",
      sizeGB: 2.78,
      type: "3D-TILES",
      name: "Area 1",
      visibleForGroups: {
        connect: [{ id: adminGroupId }, { id: guestGroupId }],
      },
    },
  });

  await prisma.baseLayer.create({
    data: {
      ownerId: id,
      href: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/area2/tileset.json",
      sizeGB: 4.59,
      type: "3D-TILES",
      name: "Area 2",
      visibleForGroups: {
        connect: [{ id: adminGroupId }, { id: guestGroupId }],
      },
    },
  });

  await prisma.baseLayer.create({
    data: {
      ownerId: id,
      href: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/area3/tileset.json",
      sizeGB: 1.99,
      type: "3D-TILES",
      name: "Area 3",
      visibleForGroups: {
        connect: [{ id: adminGroupId }, { id: guestGroupId }],
      },
    },
  });

  await prisma.baseLayer.create({
    data: {
      ownerId: id,
      href: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/area4/tileset.json",
      sizeGB: 8.13,
      type: "3D-TILES",
      name: "Area 4",
      visibleForGroups: {
        connect: [{ id: adminGroupId }, { id: guestGroupId }],
      },
    },
  });

  await prisma.baseLayer.create({
    data: {
      ownerId: id,
      href: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/area5/tileset.json",
      sizeGB: 2.45,
      type: "3D-TILES",
      name: "Area 5",
      visibleForGroups: {
        connect: [{ id: adminGroupId }, { id: guestGroupId }],
      },
    },
  });

  await prisma.baseLayer.create({
    data: {
      ownerId: id,
      href: "https://fhhvrshare.blob.core.windows.net/hamburg/terrain",
      sizeGB: 3,
      type: "TERRAIN",
      name: "Terrain",
      visibleForGroups: {
        connect: [{ id: adminGroupId }, { id: guestGroupId }],
      },
    },
  });

  await prisma.baseLayer.create({
    data: {
      ownerId: id,
      href: "https://fhhvrshare.blob.core.windows.net/hamburg/imagery/{z}/{x}/{y}.jpg",
      sizeGB: 13,
      type: "IMAGERY",
      name: "Imagery",
      visibleForGroups: {
        connect: [{ id: adminGroupId }, { id: guestGroupId }],
      },
    },
  });
})();

// Put your custom seeding commands here!
