import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";
import { version } from "./package.json";

const withNextIntl = createNextIntlPlugin("./src/server/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  webpack: (config, { isServer, nextRuntime }) => {
    if (!isServer || nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@azure/monitor-opentelemetry-exporter": path.resolve(
          __dirname,
          "stubs/azure-exporter.ts",
        ),
      };
    }

    return config;
  },
  env: {
    version,
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      [
        "remark-toc",
        {
          heading: "(table[ -]of[ -])?contents?|toc|inhaltsverzeichnis",
        },
      ],
    ],
    rehypePlugins: ["rehype-slug"],
  },
  extension: /\.(md|mdx)$/,
});

export default withMDX(withNextIntl(nextConfig));
