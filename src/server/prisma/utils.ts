import { Prisma } from "@prisma/client";

type OrderBy = {
  [key: string]: "asc" | "desc" | OrderBy;
};

function traverseOrderBy(
  orderBy: OrderBy,
  sortOrder: "asc" | "desc",
  path: string[],
  model: Prisma.DMMF.Datamodel["models"][number]
) {
  if (path.length === 0) return;

  const segment = path.shift()!;

  const field = model.fields.find((field) => field.name === segment)!;

  if (path.length === 0) {
    switch (field.kind) {
      case "enum":
      case "scalar":
        orderBy[segment] = sortOrder;
        return;
      default:
        throw new Error(`createOrderBy does not support filtering by objects!`);
    }
  }

  if (field.kind !== "object") return console.log("Ohway");

  const newModel = Prisma.dmmf.datamodel.models.find(
    (model) => field.type === model.name
  );

  if (!newModel) throw new Error(`No matching model for ${field.type} found!`);

  const layer: OrderBy = {};

  orderBy[segment] = layer;

  traverseOrderBy(layer, sortOrder, path, newModel);
}

export function createOrderBy(
  modelName: Prisma.ModelName,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
) {
  if (!sortBy || !sortOrder) return {};

  const result: OrderBy = {};

  const model = Prisma.dmmf.datamodel.models.find(
    (model) => model.name === modelName
  );

  if (!model) throw new Error(`No matching model for ${modelName} found!`);

  traverseOrderBy(result, sortOrder, sortBy.split("."), model);

  return result;
}
