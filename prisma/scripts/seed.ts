import { PERMISSIONS, PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

(async () => {
  await prisma.configuration.create({
    data: {
      defaultEPSG: "EPSG:25832",
      localProcessorFolder: "./processor",
      globalStartPointX: 3764595.8724393756,
      globalStartPointY: 664200.4499076013,
      globalStartPointZ: 5144292.106228131,
      invitationEmailText: "",
      maxParallelBaseLayerConversions: 1,
      maxParallelFileConversions: 1,
      invitationCancelledEmailDE: readFileSync("./prisma/scripts/templates/mail-invitation-cancelled-de.html").toString("utf-8"),
      invitationCancelledEmailEN: readFileSync("./prisma/scripts/templates/mail-invitation-cancelled-en.html").toString("utf-8"),

      invitationEmailDE: readFileSync("./prisma/scripts/templates/mail-invitation-de.html").toString("utf-8"),
      invitationEmailEN: readFileSync("./prisma/scripts/templates/mail-invitation-en.html").toString("utf-8"),

      invitationUpdatedEmailDE: readFileSync("./prisma/scripts/templates/mail-invitation-updated-de.html").toString("utf-8"),
      invitationUpdatedEmailEN: readFileSync("./prisma/scripts/templates/mail-invitation-updated-en.html").toString("utf-8"),

      predeletionEmailDE: readFileSync("./prisma/scripts/templates/mail-predeletion-de.html").toString("utf-8"),
      predeletionEmailEN: readFileSync("./prisma/scripts/templates/mail-predeletion-en.html").toString("utf-8"),
    },
  });

  const { id: superAdminRoleId } = await prisma.role.create({
    data: {
      name: "Super Administrator",
      isAdminRole: true,
      assignedPermissions: Object.values(PERMISSIONS),
    },
  });

  const { id: guestRoleId } = await prisma.role.create({
    data: {
      name: "Guest",
      assignedPermissions: [],
    },
  });

  const { id: adminGroupId } = await prisma.group.create({
    data: {
      name: "Super Administrator",
      defaultFor: ["*"],
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
      defaultFor: [""],
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
      type: "TILES3D",
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
      type: "TILES3D",
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
      type: "TILES3D",
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
      type: "TILES3D",
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
      type: "TILES3D",
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
