import { PrismaClient } from "@prisma/client";
import { AbstractService } from "./abstractService";
import { Session } from "next-auth";
import { EventBus } from "../events";

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
}