import {
  createFilters,
  createSort,
} from "@/components/dataGridServerSide/helpers";
import { DataGridZodType } from "@/components/dataGridServerSide/zodTypes";
import { Prisma } from "@prisma/client";

export default function paginationExtension() {
  return Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      model: {
        $allModels: {
          async paginate<T, A>(
            this: T,
            args: Prisma.Exact<A, Prisma.Args<T, "findMany">>,
            dataGridZod: DataGridZodType,
            quickFilterableValues: string[] = []
          ): Promise<{ data: Prisma.Result<T, A, "findMany">; count: number }> {
            const context = Prisma.getExtensionContext(this) as unknown as {
              $name: Prisma.ModelName;
              findMany: (
                args: Prisma.Args<T, "findMany">
              ) => Promise<Prisma.Result<T, A, "findMany">>;
              count: (
                args: Prisma.Args<T, "count">
              ) => Promise<Prisma.Result<T, A, "count">>;
            };

            const modelName = context.$name;

            const where = createFilters(
              modelName,
              quickFilterableValues,
              dataGridZod.filterModel
            );
            const orderBy = createSort(modelName, dataGridZod.sortModel);

            return {
              data: await context.findMany({
                take: dataGridZod.paginationModel.pageSize,
                skip:
                  dataGridZod.paginationModel.page *
                  dataGridZod.paginationModel.pageSize,
                where,
                orderBy,
                // @ts-expect-error wrong types
                ...args,
              }),
              // @ts-expect-error wrong types
              count: await context.count({
                where,
              }),
            };
          },
        },
      },
    });
  });
}
