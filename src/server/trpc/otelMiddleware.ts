import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { SpanStatusCode, trace, type Attributes } from "@opentelemetry/api";
import { initTRPC, TRPCError } from "@trpc/server";

function sanitizedGridAttributes(input: unknown): Attributes {
  if (!input || typeof input !== "object") return {};
  const candidate = input as {
    filterModel?: {
      items?: Array<{ field?: unknown; operator?: unknown }>;
      quickFilterValues?: unknown[];
    };
    paginationModel?: { pageSize?: unknown };
    sortModel?: Array<{ field?: unknown; sort?: unknown }>;
  };
  const items = Array.isArray(candidate.filterModel?.items)
    ? candidate.filterModel.items
    : [];
  const sorts = Array.isArray(candidate.sortModel) ? candidate.sortModel : [];
  const fields = items
    .map((item) => item.field)
    .filter((field): field is string => typeof field === "string");
  const operators = items
    .map((item) => item.operator)
    .filter((operator): operator is string => typeof operator === "string");
  const sortFields = sorts
    .map((item) => item.field)
    .filter((field): field is string => typeof field === "string");

  return {
    "grid.filter_count": items.length,
    "grid.filter_fields": fields.join(","),
    "grid.filter_operators": operators.join(","),
    "grid.quick_filter_term_count": Array.isArray(
      candidate.filterModel?.quickFilterValues,
    )
      ? candidate.filterModel.quickFilterValues.length
      : 0,
    "grid.sort_fields": sortFields.join(","),
    "grid.page_size":
      typeof candidate.paginationModel?.pageSize === "number"
        ? candidate.paginationModel.pageSize
        : 0,
  };
}

export function createOTelPlugin(
  opts: { tracerName: string } = { tracerName: "trpc" },
) {
  const t = initTRPC.context<object>().meta<object>().create();
  const tracer = trace.getTracer(opts.tracerName);

  return {
    pluginProc: t.procedure.use(
      async ({ ctx, next, path, type, getRawInput }) =>
        tracer.startActiveSpan(path, async (span) => {
          const startedAt = performance.now();
          try {
            span.setAttributes({
              "trpc.path": path,
              "trpc.type": type,
              ...sanitizedGridAttributes(await getRawInput()),
            });

            const result = await next({ ctx });
            if (!result.ok) {
              const referenceId = randomUUID();
              (
                result.error as TRPCError & { referenceId?: string }
              ).referenceId = referenceId;
              span.recordException(result.error);
              span.setStatus({ code: SpanStatusCode.ERROR });
              span.setAttributes({
                "error.reference_id": referenceId,
                "trpc.code": result.error.code,
              });
              console.error({
                event: "trpc_request_failed",
                path,
                code: result.error.code,
                referenceId,
              });
            } else {
              span.setStatus({ code: SpanStatusCode.OK });
            }
            return result;
          } catch (error) {
            const referenceId = randomUUID();
            span.setStatus({ code: SpanStatusCode.ERROR });
            span.setAttribute("error.reference_id", referenceId);
            if (error instanceof Error) span.recordException(error);
            console.error({
              event: "trpc_middleware_failed",
              path,
              referenceId,
            });
            throw error;
          } finally {
            span.setAttribute(
              "request.duration_ms",
              Math.round(performance.now() - startedAt),
            );
            span.end();
          }
        }),
    ),
  };
}
