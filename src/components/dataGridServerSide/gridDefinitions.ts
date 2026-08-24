import type { GridDefinition } from "./helpers";

export const projectGridDefinition = {
  id: "projects",
  fields: {
    title: {
      path: ["title"],
      type: "string",
      filterable: true,
      sortable: true,
      quickFilter: true,
    },
    description: {
      path: ["description"],
      type: "string",
      quickFilter: true,
    },
    owner: {
      path: ["owner", "name"],
      type: "string",
      relation: "toOne",
      filterable: true,
      sortable: true,
      quickFilter: true,
      nullable: true,
    },
    visibleForUsers: {
      path: ["visibleForUsers", "name"],
      type: "string",
      relation: "toMany",
      filterable: true,
    },
    visibleForGroups: {
      path: ["visibleForGroups", "name"],
      type: "string",
      relation: "toMany",
      filterable: true,
    },
  },
} as const satisfies GridDefinition;

export const sharedProjectGridDefinition = {
  id: "shared-projects",
  fields: {
    title: projectGridDefinition.fields.title,
    description: projectGridDefinition.fields.description,
    owner: projectGridDefinition.fields.owner,
  },
} as const satisfies GridDefinition;

export const userGridDefinition = {
  id: "users",
  fields: {
    name: {
      path: ["name"],
      type: "string",
      filterable: true,
      sortable: true,
      quickFilter: true,
      nullable: true,
    },
    email: {
      path: ["email"],
      type: "string",
      filterable: true,
      sortable: true,
      quickFilter: true,
    },
    assignedGroups: {
      path: ["assignedGroups", "name"],
      type: "string",
      relation: "toMany",
      filterable: true,
    },
  },
} as const satisfies GridDefinition;

export const groupGridDefinition = {
  id: "groups",
  fields: {
    name: {
      path: ["name"],
      type: "string",
      filterable: true,
      sortable: true,
      quickFilter: true,
    },
    isAdminGroup: {
      path: ["isAdminGroup"],
      type: "boolean",
      filterable: true,
      sortable: true,
    },
    defaultFor: {
      path: ["defaultFor"],
      type: "stringArray",
      filterable: true,
    },
    assignedRoles: {
      path: ["assignedRoles", "name"],
      type: "string",
      relation: "toMany",
      filterable: true,
    },
  },
} as const satisfies GridDefinition;

export const baseLayerGridDefinition = {
  id: "base-layers",
  fields: {
    type: {
      path: ["type"],
      type: "enum",
      values: ["TILES3D", "TERRAIN", "IMAGERY", "WMS"],
      filterable: true,
      sortable: true,
    },
    isPublic: {
      path: ["isPublic"],
      type: "boolean",
      filterable: true,
      sortable: true,
    },
    name: {
      path: ["name"],
      type: "string",
      filterable: true,
      sortable: true,
      quickFilter: true,
    },
    description: {
      path: ["description"],
      type: "string",
      quickFilter: true,
    },
    progress: {
      path: ["progress"],
      type: "number",
      filterable: true,
      sortable: true,
    },
    owner: {
      path: ["owner", "name"],
      type: "string",
      relation: "toOne",
      filterable: true,
      sortable: true,
      quickFilter: true,
      nullable: true,
    },
    visibleForGroups: {
      path: ["visibleForGroups", "name"],
      type: "string",
      relation: "toMany",
      filterable: true,
    },
    sizeGB: {
      path: ["sizeGB"],
      type: "number",
      filterable: true,
      sortable: true,
    },
    createdAt: {
      path: ["createdAt"],
      type: "dateTime",
      filterable: true,
      sortable: true,
    },
  },
} as const satisfies GridDefinition;

export const visualAxisGridDefinition = {
  id: "visual-axes",
  fields: {
    name: {
      path: ["name"],
      type: "string",
      filterable: true,
      sortable: true,
      quickFilter: true,
    },
    description: {
      path: ["description"],
      type: "string",
      filterable: true,
      sortable: true,
      quickFilter: true,
    },
  },
} as const satisfies GridDefinition;
