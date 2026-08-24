export function getProjectTabQueryEnablement(selectedTab: number) {
  return {
    owned: selectedTab === 0,
    shared: selectedTab === 1,
  } as const;
}
