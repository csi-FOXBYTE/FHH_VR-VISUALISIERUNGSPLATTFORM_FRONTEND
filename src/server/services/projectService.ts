import { PrismaClient } from "@prisma/client";
import { AbstractService } from "./abstractService";
import { Session } from "next-auth";
import { EventBus } from "../events";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

const mockProjects = new Array(1000).fill(0).map(() => ({
  title: `${faker.company.catchPhraseAdjective()} ${faker.company.catchPhraseNoun()}`,
  id: crypto.randomUUID(),
  buildingNumber: faker.number.int({ min: 1, max: 500 }),
  description: faker.word.words({ count: { min: 10, max: 100 } }),
  state: faker.helpers.arrayElement(["active", "critical", "delayed"] as const),
  projectLead: faker.person.fullName(),
  assignedDate: faker.date.between({
    from: dayjs().toISOString(),
    to: dayjs().add(7, "day").toISOString(),
  }),
}));

export class ProjectService implements AbstractService {
  readonly name = "project";

  private readonly _db: PrismaClient;
  private readonly _session: Session;
  private readonly _eventBus: EventBus;

  constructor(db: PrismaClient, eventBus: EventBus, session: Session) {
    this._db = db;
    this._session = session;
    this._eventBus = eventBus;
  }

  async getAllProjects(limit: number) {
    const projects = new Array(100).fill(0).map((_, index) => ({
      title: `Project ${index}`,
      id: crypto.randomUUID(),
    }));

    return projects.slice(0, limit);
  }

  async getProjects({
    skip = 0,
    limit = 100,
    filter = {},
    search = {},
    sortBy,
    sortOrder,
  }: {
    skip?: number;
    limit?: number;
    filter?: Record<string, string>;
    search?: Record<string, string>;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const data = mockProjects
      .filter((mockProject) => {
        for (const [filterKey, filterValue] of Array.from(
          Object.entries(filter)
        )) {
          if (
            String(mockProject[filterKey as keyof typeof mockProject]) !==
            filterValue
          )
            return false;
        }

        return true;
      })
      .filter((mockProject) => {
        for (const [searchKey, searchValue] of Array.from(
          Object.entries(search)
        )) {
          if (
            String(mockProject[searchKey as keyof typeof mockProject])
              .toLowerCase()
              .toLowerCase()
              .search(searchValue) === -1
          ) {
            return false;
          }
        }

        return true;
      });

    if (sortOrder === "asc" && sortBy)
      data.sort((a, b) =>
        String(a[sortBy as keyof typeof a]).localeCompare(
          String(b[sortBy as keyof typeof b])
        )
      );

    if (sortOrder === "desc" && sortBy)
      data.sort((a, b) =>
        String(b[sortBy as keyof typeof b]).localeCompare(
          String(a[sortBy as keyof typeof a])
        )
      );

    return {
      data: data.slice(skip, skip + limit),
      count: data.length,
    };
  }
}
