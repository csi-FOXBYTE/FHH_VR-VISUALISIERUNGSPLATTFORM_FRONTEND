import {
  createFilters,
  createSort,
  GridDefinition,
} from "@/components/dataGridServerSide/helpers";
import { DataGridZodType } from "@/components/dataGridServerSide/zodTypes";
import { Prisma } from "@prisma/client";

export function createPaginationArguments<T extends Record<string, unknown>>(
  args: T,
  dataGrid: DataGridZodType,
  definition: GridDefinition,
) {
  const where = {
    AND: [args.where ?? {}, createFilters(definition, dataGrid.filterModel)],
  };
  return {
    ...args,
    take: dataGrid.paginationModel.pageSize,
    skip: dataGrid.paginationModel.page * dataGrid.paginationModel.pageSize,
    where,
    orderBy: createSort(definition, dataGrid.sortModel),
  };
}

export default function paginationExtension() {
  return Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      model: {
        $allModels: {
          async paginate<T, A>(
            this: T,
            args: Prisma.Exact<A, Prisma.Args<T, "findMany">>,
            dataGridZod: DataGridZodType,
            definition: GridDefinition
          ): Promise<{ data: Prisma.Result<T, A, "findMany">; count: number }> {
            const context = Prisma.getExtensionContext(this) as unknown as {
              $name: Prisma.ModelName;
              findMany: (
                args: Record<string, unknown>
              ) => Promise<Prisma.Result<T, A, "findMany">>;
              count: (args: Record<string, unknown>) => Promise<number>;
            };

            const queryArgs = args as Record<string, unknown>;
            const paginationArgs = createPaginationArguments(
              queryArgs,
              dataGridZod,
              definition,
            );

            const [data, count] = await Promise.all([
              context.findMany(paginationArgs),
              context.count({
                where: paginationArgs.where,
              }),
            ]);

            return { data, count };
          },
        },
      },
    });
  });
}
