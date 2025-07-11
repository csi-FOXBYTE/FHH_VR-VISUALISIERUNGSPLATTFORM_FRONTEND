import { GridFilterItem } from "@mui/x-data-grid";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";

/**
 * !!!NOT FOR TIME!!!
 * This filter is only for dates (e.g. 20.12.2025) but NOT for time
 * !!!NOT FOR TIME!!!
 * @param filterItem
 */
export function createDateFilter(
  filterItem: GridFilterItem,
  nullable?: boolean
): Prisma.DateTimeFilter;
export function createDateFilter(
  filterItem: GridFilterItem,
  nullable: true
): Prisma.DateTimeNullableFilter;
export function createDateFilter(
  filterItem: GridFilterItem,
  nullable = false
): Prisma.DateTimeNullableFilter {
  switch (filterItem.operator) {
    case "is":
      return {
        gt: filterItem.value,
        lt: dayjs(filterItem.value).add(1, "day").toISOString(),
      };
    case "not":
      return {
        not: {
          gt: filterItem.value,
          lt: dayjs(filterItem.value).add(1, "day").toISOString(),
        },
      };
    case "after":
      return {
        gt: dayjs(filterItem.value).add(1, "day").toISOString(),
      };
    case "onOrAfter":
      return {
        gte: filterItem.value,
      };
    case "before":
      return {
        lt: filterItem.value,
      };
    case "onOrBefore":
      return {
        lt: dayjs(filterItem.value).add(1, "day").toISOString(),
      };
    case "isEmpty":
      if (nullable)
        return {
          not: null,
        };
      return {};
    case "isNotEmpty":
      if (nullable)
        return {
          equals: null,
        };
      return {};
    default:
      throw new Error();
  }
}

/**
 * This filter is for date + time (e.g. 20.12.2025 12:15)
 * @param filterItem
 */
export function createDateTimeFilter(
  filterItem: GridFilterItem,
  nullable?: boolean
): Prisma.DateTimeFilter;
export function createDateTimeFilter(
  filterItem: GridFilterItem,
  nullable: true
): Prisma.DateTimeNullableFilter;
export function createDateTimeFilter(
  filterItem: GridFilterItem,
  nullable = false
): Prisma.DateTimeNullableFilter {
  switch (filterItem.operator) {
    case "is":
      return {
        gt: filterItem.value,
        lt: dayjs(filterItem.value).add(1, "minute").toISOString(),
      };
    case "not":
      return {
        not: {
          gt: filterItem.value,
          lt: dayjs(filterItem.value).add(1, "minute").toISOString(),
        },
      };
    case "after":
      return {
        gt: filterItem.value,
      };
    case "onOrAfter":
      return {
        gte: filterItem.value,
      };
    case "before":
      return {
        lt: filterItem.value,
      };
    case "onOrBefore":
      return {
        lte: filterItem.value,
      };
    case "isEmpty":
      if (nullable)
        return {
          not: null,
        };
      return {};
    case "isNotEmpty":
      if (nullable)
        return {
          equals: null,
        };
      return {};
    default:
      throw new Error();
  }
}

/**
 * This filter is for numbers
 * @param filterItem
 */
export function createNumberFilter(
  filterItem: GridFilterItem,
  nullable?: boolean
): Prisma.FloatFilter;
export function createNumberFilter(
  filterItem: GridFilterItem,
  nullable: true
): Prisma.FloatFilter;
export function createNumberFilter(
  filterItem: GridFilterItem,
  nullable = false
): Prisma.FloatFilter | Prisma.FloatFilter {
  switch (filterItem.operator) {
    case "=":
      return {
        equals: filterItem.value,
      };
    case "!=":
      return {
        not: {
          equals: filterItem.value,
        },
      };
    case ">":
      return {
        gt: filterItem.value,
      };
    case ">=":
      return {
        gte: filterItem.value,
      };
    case "<":
      return {
        lt: filterItem.value,
      };
    case "<=":
      return {
        lte: filterItem.value,
      };
    case "isEmpty":
      if (nullable)
        return {
          equals: 0, // should be null
        };
      return {};
    case "isNotEmpty":
      if (nullable)
        return {
          not: {
            equals: 0, // should be null
          },
        };
      return {};
    case "isAnyOf":
      return {
        in: filterItem.value,
      };
    default:
      throw new Error();
  }
}

/**
 * Because we are using an MSSQL Database without support for enums this is the same as a string filter.
 * @param filterItem
 * @returns
 */
export function createSingleSelectFilter(filterItem: GridFilterItem) {
  return createStringFilter(filterItem);
}

/**
 * This filter is for strings
 * @param filterItem
 * @param nullable
 */
export function createStringFilter(
  filterItem: GridFilterItem,
  nullable?: boolean
): Prisma.StringFilter;
export function createStringFilter(
  filterItem: GridFilterItem,
  nullable: true
): Prisma.StringNullableFilter;
export function createStringFilter(
  filterItem: GridFilterItem,
  nullable: boolean = false
): Prisma.StringFilter | Prisma.StringNullableFilter {
  switch (filterItem.operator) {
    case "contains":
      return { contains: filterItem.value };
    case "doesNotContain":
      return { not: { contains: filterItem.value } };
    case "equals":
      return { equals: filterItem.value };
    case "doesNotEqual":
      return { not: { equals: filterItem.value } };
    case "startsWith":
      return { startsWith: filterItem.value };
    case "endsWith":
      return { endsWith: filterItem.value };
    case "isEmpty":
      if (nullable) return { equals: null };
      return { equals: filterItem.value };
    case "isNotEmpty":
      if (nullable) return { not: { equals: null } };
      return { not: { equals: filterItem.value } };
    case "isAnyOf":
      return {
        in: filterItem.value.length !== 0 ? filterItem.value : undefined,
      };
    case "is":
      return { equals: filterItem.value };
    case "not":
      return { not: { equals: filterItem.value } };
    default:
      throw new Error(`No predefined operation for ${filterItem.operator}`);
  }
}

// /**
//  * This filter is for booleans
//  * @param filterItem
//  */
export function createBoolFilter(
  filterItem: GridFilterItem,
  nullable?: boolean
): Prisma.BoolFilter;
// export function createBoolFilter(
//   filterItem: GridFilterItem,
//   nullable: true
// ): Prisma.BoolNullableFilter;
export function createBoolFilter(
  filterItem: GridFilterItem
): /*Prisma.BoolNullableFilter |*/ Prisma.BoolFilter {
  return { equals: filterItem.value };
}
