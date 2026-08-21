import { Prisma } from "@prisma/client";

export const gridTransactionOptions = {
  isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
} as const;
