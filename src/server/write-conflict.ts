import { Prisma } from "../generated/prisma/client";
/** Prisma's pg adapter nests SQLSTATE for raw row-lock conflicts. */
export function isWriteConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code === "P2034") return true;
  if (error.code !== "P2010") return false;
  const adapter = error.meta?.driverAdapterError as { cause?: { originalCode?: string } } | undefined;
  const sqlState = error.meta?.code ?? adapter?.cause?.originalCode;
  return sqlState === "40001" || sqlState === "40P01";
}
