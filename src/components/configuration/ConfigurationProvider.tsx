"use client";

import { createContext, ReactNode, useContext } from "react";

export type ConfigurationProviderContextType = {
  globalStartPoint: { x: number; y: number; z: number };
  defaultEPSG: string;
};

const initial: ConfigurationProviderContextType = {
  defaultEPSG: "",
  globalStartPoint: { x: 0, y: 0, z: 0 },
};

const ConfigurationProviderContext =
  createContext<ConfigurationProviderContextType>(initial);

export default function ConfigurationProvider({
  children,
  configuration,
}: {
  children: ReactNode;
  configuration: ConfigurationProviderContextType;
}) {
  return (
    <ConfigurationProviderContext.Provider value={configuration}>
      {children}
    </ConfigurationProviderContext.Provider>
  );
}

export function useConfigurationProviderContext() {
  const ctx = useContext(ConfigurationProviderContext);

  if (!ctx) throw new Error("Must be called from within a BaseLayerProvider!");

  return ctx;
}
