import { TRPCError } from "@trpc/server";
import type {
  FilterModelZodType,
  SortModelZodType,
} from "./zodTypes";

export type GridFieldType =
  | "string"
  | "stringArray"
  | "number"
  | "dateTime"
  | "boolean";

export type GridFieldDefinition = {
  path: readonly string[];
  type: GridFieldType;
  filterable?: boolean;
  sortable?: boolean;
  quickFilter?: boolean;
  nullable?: boolean;
  relation?: "toOne" | "toMany";
};

export type GridDefinition = {
  id: string;
  fields: Readonly<Record<string, GridFieldDefinition>>;
};

type FilterItem = FilterModelZodType["items"][number];
type QueryObject = Record<string, unknown>;

const FILTER_OPERATORS: Record<GridFieldType, ReadonlySet<string>> = {
  string: new Set([
    "contains",
    "doesNotContain",
    "equals",
    "doesNotEqual",
    "startsWith",
    "endsWith",
    "isEmpty",
    "isNotEmpty",
    "isAnyOf",
    "is",
    "not",
  ]),
  stringArray: new Set([
    "contains",
    "doesNotContain",
    "equals",
    "doesNotEqual",
    "isEmpty",
    "isNotEmpty",
    "isAnyOf",
  ]),
  number: new Set([
    "=",
    "!=",
    ">",
    ">=",
    "<",
    "<=",
    "isEmpty",
    "isNotEmpty",
    "isAnyOf",
  ]),
  dateTime: new Set([
    "is",
    "not",
    "after",
    "onOrAfter",
    "before",
    "onOrBefore",
    "isEmpty",
    "isNotEmpty",
  ]),
  boolean: new Set(["is", "not", "equals", "doesNotEqual"]),
};

function badRequest(message: string): never {
  throw new TRPCError({ code: "BAD_REQUEST", message });
}

function getField(
  definition: GridDefinition,
  fieldId: string,
  capability: "filterable" | "sortable",
) {
  const field = definition.fields[fieldId];
  if (!field || !field[capability]) {
    badRequest(
      `Field '${fieldId}' is not ${capability} in grid '${definition.id}'.`,
    );
  }
  return field;
}

function escapedText(value: unknown): string {
  if (typeof value !== "string") {
    badRequest("A text filter requires a string value.");
  }
  return value.replace(/[\\%_]/g, "\\$&");
}

function numberValue(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    badRequest("A number filter requires a finite value.");
  }
  return parsed;
}

function dateValue(value: unknown): Date {
  const parsed = value instanceof Date ? new Date(value) : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    badRequest("A date filter requires a valid date.");
  }
  return parsed;
}

function arrayValue(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    badRequest("This filter requires an array value.");
  }
  return value;
}

function isValueLessOperator(operator: string): boolean {
  return operator === "isEmpty" || operator === "isNotEmpty";
}

function assertValue(filter: FilterItem) {
  if (!isValueLessOperator(filter.operator) && filter.value === undefined) {
    badRequest(`Filter '${filter.field}' requires a value.`);
  }
}

function hasUsableValue(filter: FilterItem) {
  if (isValueLessOperator(filter.operator)) return true;
  if (filter.value === undefined || filter.value === "") return false;
  return !Array.isArray(filter.value) || filter.value.length > 0;
}

function stringFilter(filter: FilterItem): QueryObject {
  const mode = "insensitive" as const;
  switch (filter.operator) {
    case "contains":
      return { contains: escapedText(filter.value), mode };
    case "doesNotContain":
      return { not: { contains: escapedText(filter.value), mode } };
    case "equals":
    case "is":
      return { equals: escapedText(filter.value), mode };
    case "doesNotEqual":
    case "not":
      return { not: { equals: escapedText(filter.value), mode } };
    case "startsWith":
      return { startsWith: escapedText(filter.value), mode };
    case "endsWith":
      return { endsWith: escapedText(filter.value), mode };
    case "isEmpty":
      return { equals: "" };
    case "isNotEmpty":
      return { not: { equals: "" } };
    case "isAnyOf":
      return { in: arrayValue(filter.value).map(escapedText), mode };
    default:
      return badRequest(`Operator '${filter.operator}' is not valid for text.`);
  }
}

function numberFilter(filter: FilterItem): QueryObject {
  switch (filter.operator) {
    case "=":
      return { equals: numberValue(filter.value) };
    case "!=":
      return { not: { equals: numberValue(filter.value) } };
    case ">":
      return { gt: numberValue(filter.value) };
    case ">=":
      return { gte: numberValue(filter.value) };
    case "<":
      return { lt: numberValue(filter.value) };
    case "<=":
      return { lte: numberValue(filter.value) };
    case "isEmpty":
      return { equals: null };
    case "isNotEmpty":
      return { not: { equals: null } };
    case "isAnyOf":
      return { in: arrayValue(filter.value).map(numberValue) };
    default:
      return badRequest(`Operator '${filter.operator}' is not valid for numbers.`);
  }
}

function dateFilter(filter: FilterItem): QueryObject {
  switch (filter.operator) {
    case "is": {
      const start = dateValue(filter.value);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      return { gte: start, lt: end };
    }
    case "not": {
      const start = dateValue(filter.value);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      return { not: { gte: start, lt: end } };
    }
    case "after":
      return { gt: dateValue(filter.value) };
    case "onOrAfter":
      return { gte: dateValue(filter.value) };
    case "before":
      return { lt: dateValue(filter.value) };
    case "onOrBefore": {
      const end = dateValue(filter.value);
      end.setUTCDate(end.getUTCDate() + 1);
      return { lt: end };
    }
    case "isEmpty":
      return { equals: null };
    case "isNotEmpty":
      return { not: { equals: null } };
    default:
      return badRequest(`Operator '${filter.operator}' is not valid for dates.`);
  }
}

function booleanFilter(filter: FilterItem): QueryObject {
  if (typeof filter.value !== "boolean") {
    badRequest("A boolean filter requires a boolean value.");
  }
  const equals =
    filter.operator === "not" || filter.operator === "doesNotEqual"
      ? !filter.value
      : filter.value;
  return { equals };
}

function scalarListClause(fieldName: string, filter: FilterItem): QueryObject {
  switch (filter.operator) {
    case "contains":
    case "equals":
      return { [fieldName]: { has: escapedText(filter.value) } };
    case "doesNotContain":
    case "doesNotEqual":
      return { NOT: { [fieldName]: { has: escapedText(filter.value) } } };
    case "isEmpty":
      return { [fieldName]: { isEmpty: true } };
    case "isNotEmpty":
      return { NOT: { [fieldName]: { isEmpty: true } } };
    case "isAnyOf":
      return {
        [fieldName]: { hasSome: arrayValue(filter.value).map(escapedText) },
      };
    default:
      return badRequest(`Operator '${filter.operator}' is not valid for lists.`);
  }
}

function positiveRelationOperator(filter: FilterItem): FilterItem {
  const map: Record<string, string> = {
    doesNotContain: "contains",
    doesNotEqual: "equals",
    not: "is",
  };
  return { ...filter, operator: map[filter.operator] ?? filter.operator };
}

function isNegativeRelationOperator(operator: string) {
  return ["doesNotContain", "doesNotEqual", "not"].includes(operator);
}

function scalarFilter(
  field: GridFieldDefinition,
  filter: FilterItem,
): QueryObject {
  switch (field.type) {
    case "string":
      return stringFilter(filter);
    case "number":
      return numberFilter(filter);
    case "dateTime":
      return dateFilter(filter);
    case "boolean":
      return booleanFilter(filter);
    case "stringArray":
      return badRequest("Scalar list filters are compiled at field level.");
  }
}

function nest(path: readonly string[], leaf: unknown): QueryObject {
  return path.reduceRight<QueryObject>(
    (result, segment) => ({ [segment]: result }),
    leaf as QueryObject,
  );
}

function compileFieldFilter(
  field: GridFieldDefinition,
  filter: FilterItem,
): QueryObject {
  assertValue(filter);
  if (!FILTER_OPERATORS[field.type].has(filter.operator)) {
    badRequest(
      `Operator '${filter.operator}' is not valid for field '${filter.field}'.`,
    );
  }

  const fieldName = field.path.at(-1);
  if (!fieldName) {
    badRequest(`Field '${filter.field}' has no database path.`);
  }

  if (
    field.type === "string" &&
    field.nullable &&
    field.relation !== "toMany" &&
    (filter.operator === "isEmpty" || filter.operator === "isNotEmpty")
  ) {
    const emptyClauses = [
      nest(field.path, { equals: null }),
      nest(field.path, { equals: "" }),
    ];
    if (field.relation === "toOne" && field.path.length === 2) {
      emptyClauses.unshift({ [field.path[0]]: { is: null } });
    }
    return filter.operator === "isEmpty"
      ? { OR: emptyClauses }
      : { NOT: { OR: emptyClauses } };
  }

  if (field.type === "stringArray") {
    if (field.path.length !== 1) {
      badRequest("Nested scalar lists are not supported.");
    }
    return scalarListClause(fieldName, filter);
  }

  const relationPath = field.path.slice(0, -1);
  if (field.relation === "toMany") {
    if (relationPath.length !== 1) {
      badRequest("Only one to-many relation level is supported.");
    }
    const relation = relationPath[0];
    if (filter.operator === "isEmpty") return { [relation]: { none: {} } };
    if (filter.operator === "isNotEmpty") return { [relation]: { some: {} } };
    const negative = isNegativeRelationOperator(filter.operator);
    const positive = positiveRelationOperator(filter);
    return {
      [relation]: {
        [negative ? "none" : "some"]: {
          [fieldName]: scalarFilter(field, positive),
        },
      },
    };
  }

  return nest(field.path, scalarFilter(field, filter));
}

export function createFilters(
  definition: GridDefinition,
  filterModel: FilterModelZodType,
): QueryObject {
  const itemClauses = filterModel.items
    .filter(hasUsableValue)
    .map((filter) => {
      const field = getField(definition, filter.field, "filterable");
      return compileFieldFilter(field, filter);
    });

  const quickFields = Object.values(definition.fields).filter(
    (field) => field.quickFilter && field.type === "string",
  );
  const quickClauses = (filterModel.quickFilterValues ?? [])
    .filter((value) => value.length > 0)
    .map((value) => ({
      OR: quickFields.map((field) =>
        compileFieldFilter(field, {
          field: "quickFilter",
          operator: "contains",
          value,
        }),
      ),
    }));

  const where: QueryObject = {};
  if (itemClauses.length > 0) {
    where[(filterModel.logicOperator ?? "or").toUpperCase()] = itemClauses;
  }
  if (quickClauses.length > 0) {
    const existingAnd = Array.isArray(where.AND) ? where.AND : [];
    where.AND = [...existingAnd, ...quickClauses];
  }
  return where;
}

export function createSort(
  definition: GridDefinition,
  sortModel: SortModelZodType,
): QueryObject[] {
  const orderBy = sortModel.flatMap((sortItem) => {
    if (!sortItem.sort) return [];
    const field = getField(definition, sortItem.field, "sortable");
    if (field.relation === "toMany") {
      badRequest(
        `Field '${sortItem.field}' is multi-valued and cannot be sorted.`,
      );
    }
    return [nest(field.path, sortItem.sort)];
  });

  if (!sortModel.some((item) => item.field === "id" && item.sort)) {
    orderBy.push({ id: "asc" });
  }
  return orderBy;
}
