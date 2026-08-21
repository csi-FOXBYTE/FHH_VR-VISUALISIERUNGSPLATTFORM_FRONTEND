export type OwnershipEntityType =
  | "PROJECT"
  | "BASE_LAYER"
  | "VISUAL_AXIS"
  | "EVENT";

export type OwnershipImpact = {
  projects: number;
  baseLayers: number;
  visualAxes: number;
  events: number;
  total: number;
  canDelete: boolean;
};

export type OwnershipPreflight = Omit<OwnershipImpact, "canDelete"> & {
  invalidReferences: number;
  readyForReleaseB: boolean;
};

export type OwnershipSuccessor = {
  id: string;
  name: string | null;
  email: string;
};

export type OwnershipSuccessors = Partial<
  Record<OwnershipEntityType, string>
>;

export class OwnershipApiError extends Error {
  constructor(
    readonly status: number,
    readonly payload: unknown,
  ) {
    super(`Ownership API failed with HTTP ${status}.`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/gateway${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new OwnershipApiError(response.status, payload);
  return payload as T;
}

export function getDeletionImpact(userId: string) {
  return request<OwnershipImpact>(
    `/user/${encodeURIComponent(userId)}/deletion-impact`,
  );
}

export function getDeletionSuccessors(
  userId: string,
  type: OwnershipEntityType,
) {
  return request<OwnershipSuccessor[]>(
    `/user/${encodeURIComponent(userId)}/deletion-successors?type=${type}`,
  );
}

export function getOwnershipPreflight() {
  return request<OwnershipPreflight>("/user/ownership-preflight");
}

export function getOwnershipSuccessors(type: OwnershipEntityType) {
  return request<OwnershipSuccessor[]>(
    `/user/ownership-successors?type=${type}`,
  );
}

export function repairOrphanedOwnership(successors: OwnershipSuccessors) {
  return request<{
    correlationId: string;
    repaired: Record<OwnershipEntityType, number>;
  }>("/user/repair-orphaned-ownership", {
    method: "POST",
    body: JSON.stringify(successors),
  });
}

export function transferAndDeleteUser(
  userId: string,
  successors: OwnershipSuccessors,
) {
  return request<{ correlationId: string; impact: OwnershipImpact }>(
    `/user/${encodeURIComponent(userId)}/transfer-and-delete`,
    { method: "POST", body: JSON.stringify(successors) },
  );
}
