# FHH VR Visualisierungsplattform Frontend

Next.js 15 App Router frontend for the FHH VR visualization platform. The UI is built with React 19 and MUI, uses next-intl for localization, NextAuth for authentication, tRPC for internal APIs, Prisma/ZenStack for data access, and Cesium/Resium for 3D views.

Key highlights:
- App Router with authenticated and public areas
- MUI-based UI with i18n and typed API clients
- Prisma/ZenStack data layer and OpenAPI gateway

## Table of Contents

- [Setup and Installation](#setup-and-installation)
- [Scripts](#scripts)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Routing Model](#routing-model)
- [Authentication and Sessions](#authentication-and-sessions)
- [Localization (i18n)](#localization-i18n)
- [Data Layer (Prisma + ZenStack)](#data-layer-prisma--zenstack)
- [tRPC](#trpc)
- [OpenAPI Client](#openapi-client)
- [Server-Side Modules](#server-side-modules)
- [Gateway Proxy](#gateway-proxy)
- [3D Viewer (Cesium/Resium)](#3d-viewer-cesiumresium)
- [Configuration and Permissions](#configuration-and-permissions)
- [Environment Variables](#environment-variables)
- [Deployment Notes](#deployment-notes)
- [Notable Assets and Content](#notable-assets-and-content)

## Setup and Installation

### 1) Node.js via NVM

Use an LTS Node version (the project uses Node 20.x).
Docs: [nvm-windows](https://github.com/coreybutler/nvm-windows), [nvm](https://github.com/nvm-sh/nvm)

Windows (nvm-windows):
```bash
nvm install 20
nvm use 20
node -v
```

macOS/Linux (nvm):
```bash
nvm install 20
nvm use 20
node -v
```

### 2) Package Manager (pnpm)

Docs: [pnpm.io](https://pnpm.io/)
```bash
npm i -g pnpm
pnpm -v
```

### 3) Docker

Install Docker Desktop (Windows/macOS) or Docker Engine (Linux).
Docs: [Docker Desktop](https://www.docker.com/products/docker-desktop/), [Docker Engine](https://docs.docker.com/engine/)

Ensure `docker` and `docker compose` are available:
```bash
docker -v
docker compose version
```

### 4) Install Dependencies

```bash
pnpm install
```

### 5) Environment Configuration

Populate `.env` with required values (ask your team for the correct settings). Common values include auth provider keys and API endpoints like:
- `BACKEND_URL`
- `BASE_URL`
- `MICROSOFT_ENTRA_CLIENT_ID`
- `MICROSOFT_ENTRA_CLIENT_SECRET`
- `MICROSOFT_ENTRA_ISSUER`

### 6) Run the App

This starts Docker services and the Next.js dev server:
```bash
pnpm dev
```

Open `http://localhost:3000`.

### 7) Backend and Database

Most features require the backend API to be running (the frontend proxies requests via `BACKEND_URL`). Start the backend service before using authenticated or data-driven views.
Backend repository: [FHH_VR-VISUALISIERUNGSPLATTFORM_BACKEND](https://github.com/csi-FOXBYTE/FHH_VR-VISUALISIERUNGSPLATTFORM_BACKEND)

On first start (or after resetting the database), initialize the database:
```bash
pnpm prisma db push
pnpm prisma db seed
```

## Scripts

Run via `pnpm <script>`.

| Script | Purpose |
| --- | --- |
| `dev` | Starts required Docker services and runs Next.js in dev mode (Turbopack). |
| `build` | Creates a production build. |
| `start` | Starts the production server from a build. |
| `postinstall` | Copies the Cesium build into `public/cesium`. |
| `lint` | Runs Next.js linting. |
| `prepare` | Installs Git hooks via Husky. |
| `generate-gateway-api` | Regenerates the OpenAPI client from `http://localhost:5000/docs/json` (local backend URL). |
| `zenstack-generate` | Regenerates Prisma artifacts from `zmodel/schema.zmodel`. |
| `preinstall` | Enforces pnpm usage. |
| `db:reset` | Regenerates ZenStack artifacts and resets the database via `prisma db push --force-reset`. |
| `db:eject` | Outputs a SQL migration script to `prisma/migration.sql`. |
| `publish:docker` | Builds, tags, and pushes the Docker image (versioned). |

## Architecture Overview

This frontend is a Next.js App Router application that combines server components, client components, and API routes. The key architectural pieces are:

- UI: React 19 + MUI, with centralized theming and locale-aware components.
- Auth: NextAuth session for the frontend, plus a backend access token minted when calling the gateway.
- Data: Prisma client with ZenStack-generated models and permissions.
- APIs: tRPC for internal RPC calls and an OpenAPI client for backend services.
- Gateway: A proxy endpoint that forwards requests to the backend with the correct headers and tokens.
- 3D: Cesium/Resium-based viewer under `components/threeDViewer`.

## Project Structure

```
.
|-- src/                              # App Router routes, layouts, API handlers
|   |-- app/
|   |   |-- (withAuth)/               # Authenticated area (layout enforces session)
|   |   |   |-- api/                  # NextAuth + tRPC endpoints
|   |   |   `-- [locale]/(app)/       # App views grouped by layout
|   |   `-- (withoutAuth)/            # Public pages and API endpoints
|   |       |-- api/                  # Unity auth + gateway proxy
|   |       `-- [locale]/             # Landing, imprint, GDPR
|   |-- components/                   # Feature and shared UI components
|   |-- constants/                    # Theme + permission constants
|   |-- hooks/                        # Shared hooks
|   |-- permissions/                  # Permission guards and helpers
|   `-- server/                       # Server-side modules (auth, tRPC, Prisma, i18n)
|-- messages/                         # next-intl message catalogs
|-- prisma/                           # Prisma schema + seed script
|-- zmodel/                           # ZenStack models and permissions
|-- public/                           # Static assets, Cesium bundle, help content
|-- scripts/                          # Build utilities (e.g. Cesium copy)
|-- stubs/                            # Runtime stubs for non-node contexts
|-- docker-compose.yaml               # Local service dependencies
|-- Dockerfile                        # Production container build
`-- next.config.ts                    # Next.js, MDX, next-intl, and webpack config
```

## Routing Model

- `src/app/(withAuth)` enforces an authenticated session in its layout and hosts the main application.
- `src/app/(withoutAuth)` contains the landing/legal pages and unauthenticated API routes.
- `src/app/[locale]` drives localization via `next-intl`; messages live in `messages/*.json`.
- Layout groups under `(app)` split pages into static and dynamic layout variants.
- Feature routes live under `project-management`, `administration`, `collaboration`, `my-area`, and `profile`.

## Authentication and Sessions

Authentication uses NextAuth with Microsoft Entra ID. The authenticated layout (`src/app/(withAuth)/layout.tsx`) blocks access when no session exists and redirects to the sign-in redirect endpoint.

Two tokens are used:
- Frontend access: NextAuth session token stored in cookies.
- Backend access: A separate bearer token minted by the frontend and attached to requests sent via the gateway (used by the Unity client as well).

The session callback enriches the user with permissions and group assignments fetched from the database, which powers the permission helpers in `src/permissions`.

## Localization (i18n)

Localization is handled by `next-intl`. Messages live in `messages/*.json`, and locale routing is configured in `src/server/i18n`. The app uses a `[locale]` segment under both authenticated and public routes. Use `useTranslations()` in client components or `getMessages()` in server components.

## Data Layer (Prisma + ZenStack)

Prisma provides the database client, while ZenStack defines schema models and permission rules under `zmodel/`. The Prisma schema is generated from ZenStack, and the application uses Prisma extensions under `src/server/prisma/extensions`.

The data model is duplicated in the backend as well. When you change the frontend data layer (ZenStack/Prisma models), you must apply the same change in the backend to keep the schemas aligned.

Common tasks:
- Generate Prisma artifacts: `pnpm zenstack-generate`
- Sync schema to DB: `pnpm prisma db push`
- Seed initial data: `pnpm prisma db seed`

If you reset the database, rerun the generate and seed steps before starting the app.

## tRPC

tRPC powers internal APIs for authenticated views. Routers live in `src/server/trpc/routers`, and the client and server adapters are in `src/server/trpc`.

Use the client in React components:
```tsx
import { trpc } from "@/server/trpc/client";

export function Example() {
  const { data, isPending } = trpc.profile.get.useQuery();
  return <div>{isPending ? "Loading..." : data?.name}</div>;
}
```

For server components, prefetch and hydrate:
```tsx
import { trpc, HydrateClient } from "@/server/trpc/server";

export default async function Page() {
  await trpc.profile.get.prefetch();
  return (
    <HydrateClient>
      {/* client components here */}
    </HydrateClient>
  );
}
```

## OpenAPI Client

The backend OpenAPI client is generated under `src/server/gatewayApi/generated`. Use the typed wrapper in `src/server/gatewayApi/client.ts`, which targets `/api/gateway` and injects cookies on the server.

## Server-Side Modules

- `src/server/auth` configures NextAuth (Microsoft Entra ID) and Unity token helpers.
- `src/server/trpc` defines routers and tRPC client/server adapters.
- `src/server/gatewayApi` hosts the OpenAPI-generated client and a typed gateway wrapper.
- `src/server/prisma` provides Prisma client setup and custom extensions.
- `src/server/i18n` contains locale routing and request helpers.

## Gateway Proxy

The gateway endpoint lives at `src/app/(withoutAuth)/api/gateway/[...path]/route.ts`. It proxies frontend requests to the backend (`BACKEND_URL`) while handling headers and authentication:

- Forwards all HTTP methods and query strings to the upstream API.
- If no `Authorization` header is present, it mints a bearer token from the current session and attaches it.
- Sanitizes hop-by-hop headers and handles empty-body requests safely for HTTP/2/Azure edges.

There are two tokens in play: the NextAuth session token for accessing the frontend, and a separate backend access token minted by the frontend (the Unity client uses this backend token as well).

The OpenAPI client in `src/server/gatewayApi/client.ts` targets this proxy (via `/api/gateway`), so server and client components can call typed APIs without hardcoding the backend base URL.

## 3D Viewer (Cesium/Resium)

Cesium is bundled into `public/cesium` during `postinstall`. The editor/viewer lives under `src/components/threeDViewer` and is mounted from the project editor route.

Editor entry point:
- `src/app/(withAuth)/[locale]/(app)/(withDynamicLayout)/project-management/[projectId]/page.tsx` loads the project via the gateway API, wraps it in `ViewerProvider`, and renders `Wrapper`.
- `Wrapper` wires terrain/base layers through `BaseLayerProvider` and renders `ThreeDViewer`.

UI shell vs. scene:
- `src/components/threeDViewer/index.tsx` builds the editor shell (AppBar, Toolbar, RightDrawer, dialogs) and lazy-loads the Resium viewer.
- `src/components/threeDViewer/Viewer.tsx` is the Cesium scene composition point (ProjectObjects, StartingPoints, ClippingPolygons, imagery, tilesets, overlays).

Global editor store:
- `src/components/threeDViewer/ViewerProvider.tsx` defines a Zustand store and exports `useViewerStore`.
- The store owns project data, layers, base/extension selections, objects, tools, selection, and history (undo/redo).
- Use `useViewerStore((state) => ...)` in editor components to read or update state.

How to extend:
- New scene primitives or overlays: add a component in `src/components/threeDViewer` and mount it in `Viewer.tsx`.
- New editor UI: add a component in `src/components/threeDViewer` and wire it into `index.tsx`, `Toolbar.tsx`, or `RightDrawer.tsx`.
- New state or actions: extend `ViewerStoreType` and the store implementation in `ViewerProvider.tsx`, then use `useViewerStore` in your UI or scene component.
- If the feature should participate in undo/redo, capture snapshots via the history helpers in the store after state changes.

When deploying, ensure static assets are included so Cesium can load its workers and static files.

## Configuration and Permissions

Runtime configuration is built in `src/components/configuration` and provided via `ConfigurationProvider` in `src/appProviders.tsx`. Permission helpers in `src/permissions` read the session user permissions to gate UI and routes.

## Environment Variables

Common environment variables used by the app:

| Variable | Purpose |
| --- | --- |
| `BACKEND_URL` | Backend base URL used by the gateway proxy. |
| `BASE_URL` | Optional public base URL for API routing. |
| `MICROSOFT_ENTRA_CLIENT_ID` | Microsoft Entra client ID for NextAuth. |
| `MICROSOFT_ENTRA_CLIENT_SECRET` | Microsoft Entra client secret for NextAuth. |
| `MICROSOFT_ENTRA_ISSUER` | Microsoft Entra issuer URL for NextAuth. |
| `NEXTAUTH_SECRET` | NextAuth secret for session encryption. |

## Deployment Notes

`next.config.ts` enables standalone output, which is compatible with containerized deployment. The provided `Dockerfile` and `docker-compose.yaml` are the recommended path for production builds and local services.

## Notable Assets and Content

- `public/cesium` is populated by `scripts/copyCesium.mjs` during install.
- `public/help` and `src/components/help/translations` contain the help content (MDX + images).
- `resources/` holds legacy documentation assets and is not used by the app runtime.
