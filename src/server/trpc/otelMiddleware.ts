import { trace, SpanStatusCode } from "@opentelemetry/api";
import { initTRPC } from "@trpc/server";

function safeParseJson(data: unknown): string {
  try {
    return JSON.stringify(data);
  } catch (e) {
    return "";
  }
}

export function createOTelPlugin(
  opts: { tracerName: string } = { tracerName: "trpc" }
) {
  const t = initTRPC.context<{}>().meta<{}>().create();

  const tracer = trace.getTracer(opts.tracerName);

  return {
    pluginProc: t.procedure.use(
      async ({ ctx, next, path, type, meta, getRawInput }) => {
        return tracer.startActiveSpan(path, async (span) => {
          const result = await next({ ctx });

          if (!result.ok) {
            span.recordException(result.error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: result.error.message,
            });
            span.setAttributes({
              ["trpc.type"]: type,
              ["trpc.meta"]: safeParseJson(meta),
              ["trpc.input"]: safeParseJson(await getRawInput()),
              ["trpc.code"]: result.error.code,
            });
          } else {
            span.end();
          }

          return result;
        });
      }
    ),
  };
}
