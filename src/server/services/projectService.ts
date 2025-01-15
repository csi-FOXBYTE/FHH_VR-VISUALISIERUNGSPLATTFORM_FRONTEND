import { PrismaClient } from "@prisma/client";
import { AbstractService } from "./abstractService";
import { Session } from "next-auth";
import { EventBus } from "../events";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import { IUser } from "./userService";
export interface IProject {
  id: string;
  title: string;
  buildingNumber: number;
  description: string;
  state: 'active' | 'critical' | 'delayed';
  projectLead: string;
  assignedDate: Date;
  requirements: IRequirement[];
  goals: IGoal[];
  members: IUser[];
}
export interface IRequirement {
  id: string;
  title: string;
  responsibleUser: string;
  category: 'Tec' | 'Org';
  assignedDate: Date;
  history: IRequirementHistory[];
}
export interface IGoal {
  id: string;
  title: string;
  responsibleUser: string;
  category: 'Schedule' | 'Cost' | 'Performance';
  assignedDate: Date;
  history: IGoalHistory[];
}

export interface IRequirementHistory extends Omit<IRequirement, 'id' | 'assignedDate' | 'history'> {
  changeDate: Date;
}
export interface IGoalHistory extends Omit<IGoal, 'id' | 'assignedDate' | 'history'> {
  changeDate: Date;
}

const mockProjects: IProject[] = new Array(3).fill(0).map(() => ({
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
  members: new Array(faker.number.int({ min: 1, max: 10 })).fill(0).map(() => ({
    id: crypto.randomUUID(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(["admin", "user"] as const),
  })),
  requirements: new Array(faker.number.int({ min: 1, max: 10 })).fill(0).map(() => ({
    id: crypto.randomUUID(),
    title: faker.company.catchPhrase(),
    responsibleUser: faker.person.firstName(),
    category: faker.helpers.arrayElement(["Tec", "Org"] as const),
    assignedDate: faker.date.between({
      from: dayjs().toISOString(),
      to: dayjs().add(7, "day").toISOString(),
    }),
    history: [],
  })),
  goals: new Array(faker.number.int({ min: 1, max: 10 })).fill(0).map(() => ({
    id: crypto.randomUUID(),
    title: faker.company.catchPhrase(),
    responsibleUser: faker.person.firstName(),
    category: faker.helpers.arrayElement(['Schedule', 'Cost', 'Performance'] as const),
    assignedDate: faker.date.between({
      from: dayjs().toISOString(),
      to: dayjs().add(7, "day").toISOString(),
    }),
    history: [],
  })),
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

  async getProject(projectId: string) {
    const project = mockProjects.find((mockProject) => mockProject.id === projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    return project;
  }

  // #region Requirements
  async getRequirement(projectId: string, requirementId: string) {
    const project = mockProjects.find((proj) => proj.id === projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const requirement = project.requirements.find((req: IRequirement) => req.id === requirementId);
    if (!requirement) {
      throw new Error(`Requirement with ID ${requirementId} not found in project ${projectId}`);
    }

    return requirement;
  }

  async deleteRequirement(projectId: string, requirementId: string): Promise<void> {
    const project = mockProjects.find((proj) => proj.id === projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const requirementIndex = project.requirements.findIndex((req: IRequirement) => req.id === requirementId);
    if (requirementIndex === -1) {
      throw new Error(`Requirement with ID ${requirementId} not found in project ${projectId}`);
    }

    project.requirements.splice(requirementIndex, 1);
    console.log(`Requirement with ID ${requirementId} deleted successfully from project ${projectId}.`);
  }

  async editRequirement(projectId: string, requirementId: string, data: Partial<IRequirement>) {
    const project = mockProjects.find((proj) => proj.id === projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const requirement = project.requirements.find((req: IRequirement) => req.id === requirementId);
    if (!requirement) {
      throw new Error(`Requirement with ID ${requirementId} not found in project ${projectId}`);
    }

    Object.assign(requirement, data);
    return requirement;
  }

  async addRequirement(projectId: string, data: Omit<IRequirement, 'id'>) {
    const project = mockProjects.find((proj: IProject) => proj.id === projectId);

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const newRequirement = { id: crypto.randomUUID(), ...data };
    project.requirements.push(newRequirement);
    return newRequirement;
  }

  // #endregion

  // #region Goals
  async getGoal(projectId: string, goalId: string) {
    const project = mockProjects.find((proj) => proj.id === projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const goal = project.goals.find((req: IGoal) => req.id === goalId);
    if (!goal) {
      throw new Error(`Goal with ID ${goalId} not found in project ${projectId}`);
    }

    return goal;
  }

  async deleteGoal(projectId: string, goalId: string): Promise<void> {
    const project = mockProjects.find((proj) => proj.id === projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const goalIndex = project.goals.findIndex((req: IGoal) => req.id === goalId);
    if (goalIndex === -1) {
      throw new Error(`Goal with ID ${goalId} not found in project ${projectId}`);
    }

    project.goals.splice(goalIndex, 1);
    console.log(`Goal with ID ${goalId} deleted successfully from project ${projectId}.`);
  }

  async editGoal(projectId: string, goalId: string, data: Partial<IGoal>) {
    const project = mockProjects.find((proj) => proj.id === projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const goal = project.goals.find((req: IGoal) => req.id === goalId);
    if (!goal) {
      throw new Error(`Goal with ID ${goalId} not found in project ${projectId}`);
    }

    Object.assign(goal, data);
    return goal;
  }

  async addGoal(projectId: string, data: Omit<IGoal, 'id'>) {
    const project = mockProjects.find((proj: IProject) => proj.id === projectId);

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const newGoal = { id: crypto.randomUUID(), ...data };
    project.goals.push(newGoal);
    return newGoal;
  }

  // #endregion

}