import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { shouldRetryQuery } from "@/server/trpc/queryClient";

describe("grid client request behavior", () => {
  it("publishes only the final filter value after 400 ms", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 400),
      { initialProps: { value: "" } },
    );

    rerender({ value: "S" });
    rerender({ value: "Su" });
    rerender({ value: "Sup" });
    rerender({ value: "Super" });
    expect(result.current).toBe("");

    act(() => vi.advanceTimersByTime(399));
    expect(result.current).toBe("");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("Super");
    vi.useRealTimers();
  });

  it("does not retry 4xx and retries network/5xx only once", () => {
    expect(shouldRetryQuery(0, { data: { httpStatus: 400 } })).toBe(false);
    expect(shouldRetryQuery(0, { data: { httpStatus: 500 } })).toBe(true);
    expect(shouldRetryQuery(0, new Error("network"))).toBe(true);
    expect(shouldRetryQuery(1, { data: { httpStatus: 500 } })).toBe(false);
  });
});
