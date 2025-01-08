import { generatePermissions, type Flatten } from "../lib/permissions";

export const generatedPermissions = generatePermissions({
  user: {
    create: null,
    read: null,
    update: null,
    delete: null,
  },
  project: {
    create: null,
    read: null,
    update: null,
    delete: null,
  },
  actions: {},
  views: {
    home: null,
    user: null,
    project: null,
  },
});

export type GeneratedPermissions = Flatten<typeof generatedPermissions>;
