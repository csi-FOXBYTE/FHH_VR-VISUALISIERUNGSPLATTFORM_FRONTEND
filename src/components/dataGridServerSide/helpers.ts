import { Prisma } from "@prisma/client";
import { FilterModelZodType, SortModelZodType } from "./zodTypes";
import {
  createBoolFilter,
  createDateTimeFilter,
  createNumberFilter,
  createStringFilter,
} from "./gridFilterServerSideHelpers";

function createFieldForFilterRecursively(
  accessor: string[],
  model: (typeof Prisma.dmmf.datamodel.models)[0],
  filterItem: FilterModelZodType["items"][0],
  result: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  const field = model.fields.find((field) => field.name === accessor[0]);

  if (!field) throw new Error("Found no matching field!");

  if (field.kind === "object") {
    const newRes = {};

    result[field.name] = field.isList ? { some: newRes } : newRes;

    createFieldForFilterRecursively(
      accessor.slice(1),
      Prisma.dmmf.datamodel.models.find((model) => model.name === field.type)!,
      filterItem,
      newRes
    );

    return result;
  }

  switch (field.type) {
    case "String":
      result[field.name] = createStringFilter(filterItem, !field.isRequired);
      break;
    case "Float":
      result[field.name] = createNumberFilter(filterItem, !field.isRequired);
      break;
    case "DateTime":
      result[field.name] = createDateTimeFilter(filterItem, !field.isRequired);
      break;
    case "Boolean":
      result[field.name] = createBoolFilter(filterItem, !field.isRequired);
      break;
  }

  return result;
}

export function createFilters(
  modelName: string,
  quickFilterableFields: string[],
  filterModel: FilterModelZodType
) {
  const model = Prisma.dmmf.datamodel.models.find(
    (model) => model.name === modelName
  );

  if (!model)
    throw new Error(
      `Found no model for ${model}, available models are "${Prisma.dmmf.datamodel.models
        .map((model) => model.dbName ?? model.name)
        .join(", ")}"`
    );

  const where: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

  let filters: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  if ((filterModel.logicOperator ?? "or") === "or") {
    where.OR = [];
    filters = where.OR;
  } else {
    where.AND = [];
    filters = where.AND;
  }

  for (const filterItem of filterModel.items) {
    if (!filterItem.field) continue;

    const accessor = filterItem.field.split(".");

    filters.push(createFieldForFilterRecursively(accessor, model, filterItem));
  }

  const whereOr: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

  for (const quickFilterValue of filterModel.quickFilterValues ?? []) {
    whereOr.push(
      ...quickFilterableFields.map((quickFilterableValue) => ({
        [quickFilterableValue]: { contains: quickFilterValue },
      }))
    );
  }

  if (whereOr.length > 0) where.OR = whereOr;

  if (where.OR?.length === 0) delete where.OR;

  return where;
}

export function createSort(modelName: string, sortModel: SortModelZodType) {
  const model = Prisma.dmmf.datamodel.models.find(
    (model) => model.name === modelName
  );

  if (!model)
    throw new Error(
      `Found no model for ${model}, available models are "${Prisma.dmmf.datamodel.models
        .map((model) => model.dbName ?? model.name)
        .join(", ")}"`
    );

  const orderBy: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

  for (const sortItem of sortModel) {
    if (!sortItem.sort) continue;

    const accessor = sortItem.field.split(".");

    if (accessor.length > 1) {
      throw new Error("Sorting nested objects is not possible with prisma!");
    }

    const field = model.fields.find((field) => field.name === sortItem.field);

    if (!field) throw new Error("Found no matching field!");

    orderBy[sortItem.field] = sortItem.sort;
  }

  return orderBy;
}
