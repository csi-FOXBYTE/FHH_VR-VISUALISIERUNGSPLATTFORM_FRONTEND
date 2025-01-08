import { PrismaClient } from "@prisma/client";
import { AbstractService } from "./abstractService";
import { Session } from "next-auth";
import { EventBus } from "../events";

export class UserService implements AbstractService {
  readonly name = "user";

  private readonly _db: PrismaClient;
  private readonly _session: Session;

  constructor(db: PrismaClient, eventBus: EventBus, session: Session) {
    this._db = db;
    this._session = session;
  }
}
