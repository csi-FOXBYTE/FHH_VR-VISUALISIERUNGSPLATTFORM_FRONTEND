import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import paginationExtension from "@/server/prisma/extensions/paginationExtension";
import {
  baseLayerGridDefinition,
  projectGridDefinition,
  userGridDefinition,
} from "@/components/dataGridServerSide/gridDefinitions";

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

  it("treats LIKE metacharacters as literals in PostgreSQL", async () => {
    const literalTitle = `${prefix} 50%_done`;
    const [literal, wildcardDecoy] = await Promise.all([
      db.project.create({
        data: { ownerId, title: literalTitle, description: "literal" },
      }),
      db.project.create({
        data: {
          ownerId,
          title: `${prefix} 50-manyXdone`,
          description: "wildcard decoy",
        },
      }),
    ]);

    try {
      const positiveCases = [
        { operator: "contains", value: literalTitle },
        { operator: "equals", value: literalTitle },
        { operator: "is", value: literalTitle },
        { operator: "startsWith", value: literalTitle },
        { operator: "endsWith", value: literalTitle },
        { operator: "isAnyOf", value: [literalTitle] },
      ];

      for (const { operator, value } of positiveCases) {
        const result = await db.$transaction((tx) =>
          tx.project.paginate(
            {
              where: { id: { in: [literal.id, wildcardDecoy.id] } },
              select: { id: true },
            },
            {
              filterModel: {
                items: [{ field: "title", operator, value }],
                quickFilterValues: [],
              },
              paginationModel: { page: 0, pageSize: 50 },
              sortModel: [],
            },
            projectGridDefinition,
          ),
        );
        expect(result.count, operator).toBe(1);
        expect(result.data, operator).toEqual([{ id: literal.id }]);
      }

      for (const operator of [
        "doesNotContain",
        "doesNotEqual",
        "not",
      ] as const) {
        const result = await db.$transaction((tx) =>
          tx.project.paginate(
            {
              where: { id: { in: [literal.id, wildcardDecoy.id] } },
              select: { id: true },
            },
            {
              filterModel: {
                items: [{ field: "title", operator, value: literalTitle }],
                quickFilterValues: [],
              },
              paginationModel: { page: 0, pageSize: 50 },
              sortModel: [],
            },
            projectGridDefinition,
          ),
        );
        expect(result.count, operator).toBe(1);
        expect(result.data, operator).toEqual([{ id: wildcardDecoy.id }]);
      }
    } finally {
      await db.project.deleteMany({
        where: { id: { in: [literal.id, wildcardDecoy.id] } },
      });
    }
  });

  it("executes validated enum filters without Prisma text options", async () => {
    const layer = await db.baseLayer.create({
      data: {
        ownerId,
        name: `${prefix} terrain`,
        type: "TERRAIN",
        sizeGB: 0,
      },
    });

    try {
      const result = await db.$transaction((tx) =>
        tx.baseLayer.paginate(
          { where: { id: layer.id }, select: { id: true, type: true } },
          {
            filterModel: {
              items: [{ field: "type", operator: "is", value: "TERRAIN" }],
              quickFilterValues: [],
            },
            paginationModel: { page: 0, pageSize: 50 },
            sortModel: [{ field: "type", sort: "asc" }],
          },
          baseLayerGridDefinition,
        ),
      );
      expect(result).toEqual({
        count: 1,
        data: [{ id: layer.id, type: "TERRAIN" }],
      });
    } finally {
      await db.baseLayer.delete({ where: { id: layer.id } });
    }
  });

  it("executes numeric, date and nullable-empty operators in PostgreSQL", async () => {
    const emptyNameUser = await db.user.create({
      data: { email: `${prefix}-empty-name@example.invalid`, name: null },
    });
    const [olderLayer, newerLayer] = await Promise.all([
      db.baseLayer.create({
        data: {
          ownerId,
          name: `${prefix} older layer`,
          type: "TERRAIN",
          sizeGB: 2.5,
          progress: 25,
          createdAt: new Date("2026-08-24T12:00:00.000Z"),
        },
      }),
      db.baseLayer.create({
        data: {
          ownerId,
          name: `${prefix} newer layer`,
          type: "TERRAIN",
          sizeGB: 7.5,
          progress: 75,
          createdAt: new Date("2026-08-25T12:00:00.000Z"),
        },
      }),
    ]);
    const layerIds = [olderLayer.id, newerLayer.id];

    try {
      const numericResult = await db.$transaction((tx) =>
        tx.baseLayer.paginate(
          { where: { id: { in: layerIds } }, select: { id: true } },
          {
            filterModel: {
              items: [{ field: "progress", operator: ">=", value: 50 }],
              quickFilterValues: [],
            },
            paginationModel: { page: 0, pageSize: 50 },
            sortModel: [],
          },
          baseLayerGridDefinition,
        ),
      );
      expect(numericResult).toEqual({
        count: 1,
        data: [{ id: newerLayer.id }],
      });

      for (const [operator, expectedId] of [
        ["is", olderLayer.id],
        ["not", newerLayer.id],
      ] as const) {
        const dateResult = await db.$transaction((tx) =>
          tx.baseLayer.paginate(
            { where: { id: { in: layerIds } }, select: { id: true } },
            {
              filterModel: {
                items: [
                  {
                    field: "createdAt",
                    operator,
                    value: "2026-08-24T00:00:00.000Z",
                  },
                ],
                quickFilterValues: [],
              },
              paginationModel: { page: 0, pageSize: 50 },
              sortModel: [],
            },
            baseLayerGridDefinition,
          ),
        );
        expect(dateResult, operator).toEqual({
          count: 1,
          data: [{ id: expectedId }],
        });
      }

      const emptyResult = await db.$transaction((tx) =>
        tx.user.paginate(
          { where: { id: emptyNameUser.id }, select: { id: true } },
          {
            filterModel: {
              items: [{ field: "name", operator: "isEmpty" }],
              quickFilterValues: [],
            },
            paginationModel: { page: 0, pageSize: 50 },
            sortModel: [],
          },
          userGridDefinition,
        ),
      );
      expect(emptyResult).toEqual({
        count: 1,
        data: [{ id: emptyNameUser.id }],
      });
    } finally {
      await db.baseLayer.deleteMany({ where: { id: { in: layerIds } } });
      await db.user.delete({ where: { id: emptyNameUser.id } });
    }
  });
});
