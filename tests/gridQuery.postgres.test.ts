import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import paginationExtension from "@/server/prisma/extensions/paginationExtension";
import { projectGridDefinition } from "@/components/dataGridServerSide/gridDefinitions";

const databaseUrl = process.env.TEST_DATABASE_URL;
const integrationDescribe = databaseUrl ? describe : describe.skip;

integrationDescribe("grid query PostgreSQL integration", () => {
  const db = new PrismaClient({
    datasourceUrl: databaseUrl,
  }).$extends(paginationExtension());
  const prefix = `grid-test-${Date.now()}`;
  let ownerId = "";
  let sharedUserId = "";

  beforeAll(async () => {
    const owner = await db.user.create({
      data: {
        email: `${prefix}-owner@example.invalid`,
        name: "Super Owner",
      },
    });
    const sharedUser = await db.user.create({
      data: {
        email: `${prefix}-shared@example.invalid`,
        name: "Shared User",
      },
    });
    ownerId = owner.id;
    sharedUserId = sharedUser.id;
    await db.project.create({
      data: {
        ownerId,
        title: `${prefix} Alpha`,
        description: "First",
      },
    });
    await db.project.create({
      data: {
        ownerId,
        title: `${prefix} Beta`,
        description: "Second",
        visibleForUsers: { connect: { id: sharedUserId } },
      },
    });
  });

  afterAll(async () => {
    await db.project.deleteMany({ where: { title: { startsWith: prefix } } });
    await db.user.deleteMany({ where: { email: { startsWith: prefix } } });
    await db.$disconnect();
  });

  it("keeps data and count aligned for owner filtering and sorting", async () => {
    const result = await db.$transaction((tx) =>
      tx.project.paginate(
        {
          where: { title: { startsWith: prefix } },
          select: { id: true, title: true, owner: { select: { name: true } } },
        },
        {
          filterModel: {
            items: [
              { field: "owner", operator: "contains", value: "super" },
            ],
            quickFilterValues: [],
          },
          paginationModel: { page: 0, pageSize: 50 },
          sortModel: [{ field: "owner", sort: "asc" }],
        },
        projectGridDefinition,
      ),
    );

    expect(result.count).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data.every((project) => project.owner?.name === "Super Owner"))
      .toBe(true);
  });

  it("matches empty relations for negative to-many filters", async () => {
    const result = await db.$transaction((tx) =>
      tx.project.paginate(
        {
          where: { title: { startsWith: prefix } },
          select: { title: true },
        },
        {
          filterModel: {
            items: [
              {
                field: "visibleForUsers",
                operator: "doesNotContain",
                value: "Shared",
              },
            ],
            quickFilterValues: [],
          },
          paginationModel: { page: 0, pageSize: 50 },
          sortModel: [{ field: "title", sort: "asc" }],
        },
        projectGridDefinition,
      ),
    );

    expect(result.count).toBe(1);
    expect(result.data[0]?.title).toBe(`${prefix} Alpha`);
  });
});
