import { describe, expect, it } from "vitest";
import { selectedOwnerId } from "@/components/projectManagement/ownerSelection";

describe("owner selection hardening", () => {
  it("handles a cleared owner without dereferencing null", () => {
    expect(selectedOwnerId(null)).toBeUndefined();
    expect(selectedOwnerId(undefined)).toBeUndefined();
    expect(selectedOwnerId({ value: "" })).toBeUndefined();
    expect(selectedOwnerId({ value: "   " })).toBeUndefined();
  });

  it("returns a stable, trimmed owner id", () => {
    expect(selectedOwnerId({ value: "  owner-id  " })).toBe("owner-id");
  });
});
