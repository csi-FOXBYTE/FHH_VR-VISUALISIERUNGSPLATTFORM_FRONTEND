import { z } from "zod";

export const GRID_QUERY_LIMITS = {
  filters: 10,
  quickFilterTerms: 5,
  valueLength: 200,
  pageSize: 100,
} as const;

const scalarValueZod = z.union([
  z.string().max(GRID_QUERY_LIMITS.valueLength),
  z.number().finite(),
  z.boolean(),
  z.date(),
  z.null(),
]);

export const filterModelZod = z
  .object({
    items: z
      .array(
        z
          .object({
            id: z.union([z.string(), z.number()]).optional(),
            fromInput: z.string().max(100).optional(),
            field: z.string().min(1).max(100),
            value: z
              .union([
                scalarValueZod,
                z.array(scalarValueZod).max(GRID_QUERY_LIMITS.pageSize),
              ])
              .optional(),
            // MUI deliberately types operators as strings. The grid registry
            // performs the capability- and field-type-specific validation.
            operator: z.string().min(1).max(50),
          })
          .strict(),
      )
      .max(GRID_QUERY_LIMITS.filters),
    logicOperator: z.enum(["and", "or"]).optional(),
    quickFilterValues: z
      .array(z.string().max(GRID_QUERY_LIMITS.valueLength))
      .max(GRID_QUERY_LIMITS.quickFilterTerms)
      .optional(),
    quickFilterLogicOperator: z.enum(["and", "or"]).optional(),
    quickFilterExcludeHiddenColumns: z.boolean().optional(),
  })
  .strict();

export type FilterModelZodType = z.infer<typeof filterModelZod>;

export const paginationModelZod = z
  .object({
    pageSize: z.number().int().min(1).max(GRID_QUERY_LIMITS.pageSize),
    page: z.number().int().min(0),
  })
  .strict();

export type PaginationModelZodType = z.infer<typeof paginationModelZod>;

export const sortModelZod = z
  .array(
    z
      .object({
        sort: z.enum(["asc", "desc"]).nullish(),
        field: z.string().min(1).max(100),
      })
      .strict(),
  )
  .max(GRID_QUERY_LIMITS.filters);

export type SortModelZodType = z.infer<typeof sortModelZod>;

export const dataGridZod = z
  .object({
    paginationModel: paginationModelZod
      .optional()
      .default({ page: 0, pageSize: 50 }),
    filterModel: filterModelZod.optional().default({
      items: [],
      quickFilterValues: [],
    }),
    sortModel: sortModelZod.optional().default([]),
  })
  .strict();

export type DataGridZodType = z.infer<typeof dataGridZod>;
