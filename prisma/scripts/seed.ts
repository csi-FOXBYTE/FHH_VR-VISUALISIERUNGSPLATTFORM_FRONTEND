import { PERMISSIONS, PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

const seedAdminEmail = process.env.SEED_ADMIN_EMAIL;
const seedAdminName = process.env.SEED_ADMIN_NAME ?? null;

if (!seedAdminEmail) {
  throw new Error(
    "SEED_ADMIN_EMAIL is not set. Add it to .env before seeding, e.g. SEED_ADMIN_EMAIL=admin@example.org"
  );
}

(async () => {
  await prisma.configuration.create({
    data: {
      defaultEPSG: "EPSG:25832",
      localProcessorFolder: "./temp",
      globalStartPointX: 3764595.8724393756,
      globalStartPointY: 664200.4499076013,
      globalStartPointZ: 5144292.106228131,
      uiGlobalStartPointEpsg: "EPSG:25832",
      uiGlobalStartPointX: "566619.1165765251",
      uiGlobalStartPointY: "5935775.563757711",
      uiGlobalStartPointZ: "44805.220297358",
      invitationEmailText: "",
      maxParallelBaseLayerConversions: 1,
      maxParallelFileConversions: 1,
      used3DTileConversionThreads: 1,
      usedTerrainConversionThreads: 1,
      invitationCancelledEmailDE: readFileSync(
        "./prisma/scripts/templates/mail-invitation-cancelled-de.html"
      ).toString("utf-8"),
      invitationCancelledEmailEN: readFileSync(
        "./prisma/scripts/templates/mail-invitation-cancelled-en.html"
      ).toString("utf-8"),
      emailHost: "",
      emailPassword: "",
      emailPlatformAddress: "",
      emailPort: 8000,
      emailSecure: false,
      emailUser: "",
      maximumFlyingHeight: 1000,
      invitationEmailDE: readFileSync(
        "./prisma/scripts/templates/mail-invitation-de.html"
      ).toString("utf-8"),
      invitationEmailEN: readFileSync(
        "./prisma/scripts/templates/mail-invitation-en.html"
      ).toString("utf-8"),

      invitationUpdatedEmailDE: readFileSync(
        "./prisma/scripts/templates/mail-invitation-updated-de.html"
      ).toString("utf-8"),
      invitationUpdatedEmailEN: readFileSync(
        "./prisma/scripts/templates/mail-invitation-updated-en.html"
      ).toString("utf-8"),

      predeletionEmailDE: readFileSync(
        "./prisma/scripts/templates/mail-predeletion-de.html"
      ).toString("utf-8"),
      predeletionEmailEN: readFileSync(
        "./prisma/scripts/templates/mail-predeletion-en.html"
      ).toString("utf-8"),
      systemActivityLink: "",
      userProfileLink: "",
      unityDownloadLink: "",
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
      // Never assigned automatically. The initial admin is connected explicitly
      // below, so a catch-all pattern here would only grant admin rights to
      // whoever signs in first.
      defaultFor: [],
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
      // Catch-all for new sign-ups. An empty pattern would match no address.
      defaultFor: ["*"],
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
      email: seedAdminEmail,
      name: seedAdminName,
      assignedGroups: { connect: { id: adminGroupId } },
    },
    select: {
      id: true,
    },
  });

  await prisma.baseLayer.create({
    data: {
      ownerId: id,
      href: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/area1/tileset.json",
      sizeGB: 2.78,
      type: "TILES3D",
      name: "Area 1",
      isPublic: true,
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
      isPublic: true,
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
      isPublic: true,
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
      isPublic: true,
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
      isPublic: true,
      visibleForGroups: {
        connect: [{ id: adminGroupId }, { id: guestGroupId }],
      },
    },
  });

  await prisma.baseLayer.create({
    data: {
      ownerId: id,
      href: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/trees/tileset.json",
      sizeGB: 2.45,
      type: "TILES3D",
      name: "Trees",
      isPublic: true,
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
      isPublic: true,
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
      isPublic: true,
      visibleForGroups: {
        connect: [{ id: adminGroupId }, { id: guestGroupId }],
      },
    },
  });
})();

// Put your custom seeding commands here!
