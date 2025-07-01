import {
  createFilters,
  createSort,
} from "@/components/dataGridServerSide/helpers";

import prisma from "@/server/prisma";
import { Prisma } from "@prisma/client";
import { isMatch } from "matcher";

console.log(
  isMatch("tobias.ganzhorn@csi-online.de", "*@csi-online.de"),
  isMatch("tobias.ganzhorn@csi-online.de", "!*@csi-online.de"),
  isMatch("tobias.ganzhorn@abc.de", "!*@csi-online.de"),
  isMatch("tobias.ganzhorn@abc.de", "")
);

throw new Error();
console.log(
  Prisma.dmmf.datamodel.models.find((model) => model.name === "User")
);

createFilters("User", [], {
  items: [
    {
      field: "assignedGroups.isAdminGroup",
      operator: "eq",
      value: true,
    },
  ],
});

console.log(
  createSort("User", [
    {
      field: "assignedGroups.isAdminGroup",
      sort: "asc",
    },
  ])
);

prisma.user.findMany({
  where: {
    assignedGroups: {
      some: {},
    },
  },
  select: {
    assignedGroups: {
      select: {
        isAdminGroup: true,
      },
    },
  },
});
