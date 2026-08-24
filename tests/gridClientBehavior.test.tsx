import { act, renderHook } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  makeQueryClient,
  shouldRetryQuery,
} from "@/server/trpc/queryClient";
import { getProjectTabQueryEnablement } from "@/components/projectManagement/projectTabQueries";

afterEach(() => {
  vi.useRealTimers();
});

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
  });

  it("queries only the active project tab when the tab changes", async () => {
    vi.useFakeTimers();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const ownedRequest = vi.fn().mockResolvedValue("owned");
    const sharedRequest = vi.fn().mockResolvedValue("shared");
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const { rerender } = renderHook(
      ({ selectedTab }) => {
        const enabled = getProjectTabQueryEnablement(selectedTab);
        useQuery({
          queryKey: ["owned-projects"],
          queryFn: ownedRequest,
          enabled: enabled.owned,
        });
        useQuery({
          queryKey: ["shared-projects"],
          queryFn: sharedRequest,
          enabled: enabled.shared,
        });
      },
      { initialProps: { selectedTab: 0 }, wrapper },
    );

    await act(() => vi.runAllTimersAsync());
    expect(ownedRequest).toHaveBeenCalledTimes(1);
    expect(sharedRequest).not.toHaveBeenCalled();

    rerender({ selectedTab: 1 });
    await act(() => vi.runAllTimersAsync());
    expect(ownedRequest).toHaveBeenCalledTimes(1);
    expect(sharedRequest).toHaveBeenCalledTimes(1);
    queryClient.clear();
  });

  it("does not retry 4xx and retries network/5xx only once", () => {
    expect(shouldRetryQuery(0, { data: { httpStatus: 400 } })).toBe(false);
    expect(shouldRetryQuery(0, { data: { httpStatus: 500 } })).toBe(true);
    expect(shouldRetryQuery(0, new Error("network"))).toBe(true);
    expect(shouldRetryQuery(1, { data: { httpStatus: 500 } })).toBe(false);
  });

  it("executes at most one timed retry for network and 5xx failures", async () => {
    vi.useFakeTimers();
    const networkClient = makeQueryClient();
    const networkError = new Error("network");
    const networkRequest = vi.fn().mockRejectedValue(networkError);
    const networkPromise = networkClient.fetchQuery({
      queryKey: ["network-retry"],
      queryFn: networkRequest,
      retryDelay: 100,
    });
    const networkRejection = expect(networkPromise).rejects.toBe(networkError);

    await vi.runAllTimersAsync();
    await networkRejection;
    expect(networkRequest).toHaveBeenCalledTimes(2);
    networkClient.clear();

    const clientErrorClient = makeQueryClient();
    const clientError = { data: { httpStatus: 400 } };
    const clientErrorRequest = vi.fn().mockRejectedValue(clientError);
    const clientErrorPromise = clientErrorClient.fetchQuery({
      queryKey: ["client-error-no-retry"],
      queryFn: clientErrorRequest,
      retryDelay: 100,
    });
    const clientErrorRejection = expect(clientErrorPromise).rejects.toBe(
      clientError,
    );

    await vi.runAllTimersAsync();
    await clientErrorRejection;
    expect(clientErrorRequest).toHaveBeenCalledTimes(1);
    clientErrorClient.clear();
  });
});
