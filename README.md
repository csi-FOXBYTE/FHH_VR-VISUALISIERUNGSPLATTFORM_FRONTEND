[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

![Mercedes Logo](./public/favicon_mobile_196x196.png =64x64)

# Infocus

**Infocus** is a project management platform developed for Mercedes Benz to streamline the organization of building-related data. Designed to optimize the efficiency and transparency of construction processes, Infocus brings together all relevant project information into a unified digital environment. It draws inspiration from Lean Construction Management practices, similar to tools like Lindner's Lean Construction platform, allowing for a structured, collaborative approach to managing tasks and workflows. With Infocus, stakeholders can visualize project progress in real time, enhance coordination, and ultimately improve decision-making throughout the entire lifecycle of a construction project.

[[_TOC_]]

# Setup dev environment

Please follow the following chapters in order to setup your dev environment.

## [PNPM](https://pnpm.io/motivation)

1. Install nvm via the Symantec Management console. (If already installed skip to the next step)  
  ![Install nvm symantec management console](./resources/install-nvm.png)

2. Install/Switch Node version 20.x.x  
  ![Install / switch node version symantec management console](./resources/switch-node-version.png)

3. !!!IMPORTANT!!! Restart Computer

4. Check node install by entering node -v, it should return v20.x.x

5. Install pnpm via
  > npm i -g pnpm

## [Docker](https://www.docker.com/)

1. It's super simple just install docker.


2. After installation run ```pnpm dev``` to spinup the required docker containers (this will also start the frontend).

## [Keycloak](https://www.keycloak.org/)

Since we cannot use the Mercedes Benz PingID locally we resort to using another OpenID Connect Identity provider which in its open source form is called keycloak.

1. Navigate to http://localhost:8080/

2. Click on administration console

3. Sign in with username (admin) and password (password)

4. Click on create realm

![alt text](./resources/keycloak-create-realm-button.png)

5. Fill in the following name: `MB - Infocus` (it's important that it uses this exact form).

![alt text](./resources/keycloak-create-realm.png)

6. On the left side click on clients

7. Click on create client

8. Fill in the following values

![alt text](./resources/keycloak-create-client-general-settings.png)

9. Click next and fill in the following values

![alt text](./resources/keycloak-create-client-capability-config.png)

10. Click next and fill in the last following values

![alt text](./resources/keycloak-create-client-login-settings.png)

11. Navigate to credentials

![alt text](./resources/keycloak-infocus-credentials.png)

12. Copy the secret and paste it into the environment file (.env)

```
KEYCLOAK_ID=infocus
KEYCLOAK_SECRET=<your-pasted-secret-key>
KEYCLOAK_ISSUER=http://localhost:8080/realms/MB%20-%20Infocus
```

13. The last important step is that you have to create a user in keycloak (don't forget to set a password as well).

## Build process

To be determined.

# Conventions

## Commits

# Base Techstack

- Communication - [tRPC](https://trpc.io/docs)

- ORM - [Prisma](https://www.prisma.io/docs/orm)

- Internationalization - [next-intl](https://next-intl-docs.vercel.app/docs/usage)

- UI-Framework - [MUI](https://mui.com/material-ui/all-components/)

- Validation - [zod](https://zod.dev/?id=basic-usage)

# Todo's

Document this:

- [ ] Implement husky checks for clean code and commits
- [ ] Dev environment setup
- [ ] Docker setup
- [ ] Keycloak setup
- [ ] Prisma setup
- [ ] Explanation internationalization / authentication / nuqs etc.
