import { faker } from "@faker-js/faker";
import {
  Floor,
  PrismaClient,
  Room,
  PROJECT_STATUS,
  REQUIREMENT_CATEGORY,
  TARGET_CATEGORY,
  Requirement,
  Target,
} from "@prisma/client";

(async () => {
  const prisma = new PrismaClient();

  console.log("Creating users...");

  const users = await prisma.user.createManyAndReturn({
    data: faker.helpers.multiple(
      () => ({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        emailVerified: new Date().toISOString(),
      }),
      { count: { min: 100, max: 500 } }
    ),
  });

  console.log("Creating project categories...");

  const projectCategories = await prisma.projectCategory.createManyAndReturn({
    data: faker.helpers.multiple(
      () => ({
        name: faker.word.noun(),
      }),
      { count: { min: 5, max: 10 } }
    ),
  });

  console.log("Creating buildings...");

  const buildings = await prisma.building.createManyAndReturn({
    data: faker.helpers.multiple(
      () => ({
        name: faker.location.streetAddress(),
      }),
      { count: { min: 100, max: 200 } }
    ),
  });

  const totalFloors: Floor[] = [];
  const totalRooms: Room[] = [];

  console.log("Creating floors and rooms...");

  for (const building of buildings) {
    const floors = await prisma.floor.createManyAndReturn({
      data: faker.helpers.multiple(
        () => ({
          buildingId: building.id,
          name: faker.location.buildingNumber(),
        }),
        { count: { min: 2, max: 20 } }
      ),
    });

    totalFloors.push(...floors);

    for (const floor of floors) {
      const rooms = await prisma.room.createManyAndReturn({
        data: faker.helpers.multiple(
          () => ({
            floorId: floor.id,
            name: `${faker.word.adjective()} ${faker.word.noun()}`,
          }),
          { count: { min: 10, max: 50 } }
        ),
      });

      totalRooms.push(...rooms);
    }
  }

  console.log("Creating cost centers...");

  const costCenters = await prisma.costCenter.createManyAndReturn({
    data: faker.helpers.multiple(
      () => ({
        name: `${faker.word.verb()} ${faker.word.noun()}`,
      }),
      { count: { min: 10, max: 30 } }
    ),
  });

  console.log("Creating folders...");

  const folders = await prisma.folder.createManyAndReturn({
    data: faker.helpers.multiple(() => ({}), { count: { min: 100, max: 300 } }),
  });

  console.log("Creating projects...");

  const projects = await prisma.project.createManyAndReturn({
    data: faker.helpers.multiple(
      () => ({
        buildingId: faker.helpers.arrayElement(buildings).id,
        contactPersonId: faker.helpers.arrayElement(users).id,
        costCenterId: faker.helpers.arrayElement(costCenters).id,
        creatorId: faker.helpers.arrayElement(users).id,
        startDate: faker.date.past(),
        endDate: faker.date.future(),
        name: `${faker.word.verb()} ${faker.word.noun()}`,
        projectCategoryId: faker.helpers.arrayElement(projectCategories).id,
        projectManagerId: faker.helpers.arrayElement(users).id,
        projectType: faker.word.noun(),
        rootFolderId: faker.helpers.arrayElement(folders).id,
        status: faker.helpers.enumValue(PROJECT_STATUS),
        calculateTargetFromSubProjectSpecifications: Math.random() < 0.5,
        description: faker.word.words({ count: { min: 10, max: 50 } }),
        plannedBudget:
          Math.random() < 0.5
            ? faker.number.int({ min: 100, max: 100_000 })
            : undefined,
      }),
      { count: { min: 200, max: 500 } }
    ),
  });

  const totalRequirements: Requirement[] = [];
  // const totalParticipants: User[] = [];
  const totalTargets: Target[] = [];

  console.log("Creating requirements, participants and targets...");

  for (const project of projects) {
    const requirements = await prisma.requirement.createManyAndReturn({
      data: faker.helpers.multiple(
        () => ({
          assignedToUserId: faker.helpers.arrayElement(users).id,
          creatorId: project.projectManagerId,
          description: faker.word.words({ count: { min: 10, max: 50 } }),
          name: faker.book.title(),
          projectId: project.id,
          requirementCategory: faker.helpers.enumValue(REQUIREMENT_CATEGORY),
        }),
        { count: { min: 10, max: 20 } }
      ),
    });

    await prisma.project.update({
      where: { id: project.id },
      data: {
        participants: {
          connect: faker.helpers.arrayElements(users, { min: 2, max: 20 }).map(user => ({
            id: user.id
          }))
        }
      },
    });

    totalRequirements.push(...requirements);

    // totalParticipants.push(...participants);

    const targets = await prisma.target.createManyAndReturn({
      data: faker.helpers.multiple(() => ({
        assignedToUserId: faker.helpers.arrayElement(users).id,
        creatorId: project.projectManagerId,
        description: faker.word.words({ count: { min: 10, max: 50 } }),
        name: faker.book.title(),
        projectId: project.id,
        targetCategory: faker.helpers.enumValue(TARGET_CATEGORY),
      })),
    });

    totalTargets.push(...targets);
  }
})().then(() => process.exit(0));
