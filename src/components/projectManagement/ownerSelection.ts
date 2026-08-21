export function selectedOwnerId(
  owner: { value?: string | null } | null | undefined,
) {
  const value = owner?.value?.trim();
  return value ? value : undefined;
}
