import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, ms: number = 1000) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), ms);

    return () => window.clearTimeout(timer);
  }, [value, ms]);

  return debouncedValue;
}