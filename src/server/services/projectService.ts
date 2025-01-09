import { PrismaClient } from "@prisma/client";
import { AbstractService } from "./abstractService";
import { Session } from "next-auth";
import { EventBus } from "../events";
import { faker } from "@faker-js/faker";

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

  async getProjects() {
    return new Array(100).fill(0).map(() => ({
      title: faker.word.words(),
      id: crypto.randomUUID(),
    }))
  }
}
