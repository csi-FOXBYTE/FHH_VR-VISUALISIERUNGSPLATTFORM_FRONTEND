import "server-only";
import { PrismaClient } from "@prisma/client";
import paginationExtension from "./extensions/paginationExtension";

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(paginationExtension());
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
