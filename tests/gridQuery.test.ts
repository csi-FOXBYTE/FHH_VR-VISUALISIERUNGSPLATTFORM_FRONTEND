import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import {
  createFilters,
  createSort,
} from "@/components/dataGridServerSide/helpers";
import {
  baseLayerGridDefinition,
  projectGridDefinition,
  sharedProjectGridDefinition,
} from "@/components/dataGridServerSide/gridDefinitions";
import { dataGridZod } from "@/components/dataGridServerSide/zodTypes";
import { createPaginationArguments } from "@/server/prisma/extensions/paginationExtension";

describe("grid query validation", () => {
  it("limits filters, quick terms and page size", () => {
    expect(() =>
      dataGridZod.parse({
        filterModel: {
          items: Array.from({ length: 11 }, (_, id) => ({
            id,
            field: "title",
            operator: "contains",
            value: "x",
          })),
        },
      }),
    ).toThrow();
    expect(
      dataGridZod.parse({
        filterModel: {
          items: [
            {
              id: 49117,
              field: "owner",
              operator: "contains",
              value: "Super",
              fromInput: "_r_4k_",
            },
          ],
          quickFilterValues: [],
        },
      }).filterModel.items[0].field,
    ).toBe("owner");
    expect(() =>
      dataGridZod.parse({
        filterModel: {
          items: [],
          quickFilterValues: ["1", "2", "3", "4", "5", "6"],
        },
      }),
    ).toThrow();
    expect(() =>
      dataGridZod.parse({ paginationModel: { page: 0, pageSize: 101 } }),
    ).toThrow();
  });

  it("maps the stable owner field to owner.name", () => {
    expect(
      createFilters(projectGridDefinition, {
        items: [
          { field: "owner", operator: "contains", value: "Super" },
        ],
      }),
    ).toEqual({
      OR: [
        {
          owner: {
            name: { contains: "Super", mode: "insensitive" },
          },
        },
      ],
    });
    expect(
      createSort(projectGridDefinition, [{ field: "owner", sort: "asc" }]),
    ).toEqual([{ owner: { name: "asc" } }, { id: "asc" }]);
  });

  it("treats percent and underscore as literals for patterns and equality", () => {
    expect(
      createFilters(projectGridDefinition, {
        items: [{ field: "title", operator: "contains", value: "50%_done" }],
      }),
    ).toEqual({
      OR: [
        {
          title: { contains: "50\\%\\_done", mode: "insensitive" },
        },
      ],
    });
    expect(
      createFilters(projectGridDefinition, {
        items: [{ field: "title", operator: "equals", value: "50%_done" }],
      }),
    ).toEqual({
      OR: [
        {
          title: { equals: "50%_done", mode: "insensitive" },
        },
      ],
    });
  });

  it("compiles and validates enum filters without text-only Prisma options", () => {
    expect(
      createFilters(baseLayerGridDefinition, {
        items: [{ field: "type", operator: "is", value: "TERRAIN" }],
      }),
    ).toEqual({ OR: [{ type: { equals: "TERRAIN" } }] });
    expect(
      createFilters(baseLayerGridDefinition, {
        items: [
          {
            field: "type",
            operator: "isAnyOf",
            value: ["IMAGERY", "WMS"],
          },
        ],
      }),
    ).toEqual({ OR: [{ type: { in: ["IMAGERY", "WMS"] } }] });
    expect(() =>
      createFilters(baseLayerGridDefinition, {
        items: [{ field: "type", operator: "is", value: "UNKNOWN" }],
      }),
    ).toThrowError(
      expect.objectContaining<Partial<TRPCError>>({ code: "BAD_REQUEST" }),
    );
    expect(() =>
      createFilters(baseLayerGridDefinition, {
        items: [{ field: "type", operator: "contains", value: "TERR" }],
      }),
    ).toThrowError(
      expect.objectContaining<Partial<TRPCError>>({ code: "BAD_REQUEST" }),
    );
  });

  it("rejects null and blank numeric values instead of coercing them to zero", () => {
    for (const value of [null, "   "]) {
      expect(() =>
        createFilters(baseLayerGridDefinition, {
          items: [{ field: "sizeGB", operator: "=", value }],
        }),
      ).toThrowError(
        expect.objectContaining<Partial<TRPCError>>({ code: "BAD_REQUEST" }),
      );
    }
  });

  it("ignores MUI filter rows that are not filled in yet", () => {
    expect(
      createFilters(projectGridDefinition, {
        items: [{ field: "owner", operator: "contains" }],
      }),
    ).toEqual({});
  });

  it("uses none for negative to-many filters, including empty relations", () => {
    expect(
      createFilters(projectGridDefinition, {
        items: [
          {
            field: "visibleForUsers",
            operator: "doesNotContain",
            value: "Super",
          },
        ],
      }),
    ).toEqual({
      OR: [
        {
          visibleForUsers: {
            none: {
              name: { contains: "Super", mode: "insensitive" },
            },
          },
        },
      ],
    });
  });

  it("combines quick terms with AND and fields with OR", () => {
    const result = createFilters(sharedProjectGridDefinition, {
      items: [],
      quickFilterValues: ["Super", "Projekt"],
    });
    expect(result.AND).toHaveLength(2);
    expect((result.AND as Array<{ OR: unknown[] }>)[0].OR).toHaveLength(3);
    expect((result.AND as Array<{ OR: unknown[] }>)[1].OR).toHaveLength(3);
  });

  it("rejects unknown and unsupported fields as BAD_REQUEST", () => {
    expect(() =>
      createFilters(projectGridDefinition, {
        items: [
          { field: "owner.name", operator: "contains", value: "Super" },
        ],
      }),
    ).toThrowError(
      expect.objectContaining<Partial<TRPCError>>({ code: "BAD_REQUEST" }),
    );
    expect(() =>
      createSort(projectGridDefinition, [
        { field: "visibleForUsers", sort: "asc" },
      ]),
    ).toThrowError(
      expect.objectContaining<Partial<TRPCError>>({ code: "BAD_REQUEST" }),
    );
  });

  it("keeps compiled pagination arguments authoritative", () => {
    const query = createPaginationArguments(
      {
        where: { ownerId: "current-user" },
        take: 999,
        skip: 999,
        orderBy: { title: "desc" },
        select: { id: true },
      },
      {
        filterModel: {
          items: [{ field: "title", operator: "contains", value: "Super" }],
          quickFilterValues: [],
        },
        paginationModel: { page: 2, pageSize: 50 },
        sortModel: [{ field: "title", sort: "asc" }],
      },
      projectGridDefinition,
    );

    expect(query.take).toBe(50);
    expect(query.skip).toBe(100);
    expect(query.orderBy).toEqual([{ title: "asc" }, { id: "asc" }]);
    expect(query.where).toEqual({
      AND: [
        { ownerId: "current-user" },
        {
          OR: [
            {
              title: { contains: "Super", mode: "insensitive" },
            },
          ],
        },
      ],
    });
    expect(query.select).toEqual({ id: true });
  });
});
