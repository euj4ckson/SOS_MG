import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

type AuditInput = {
  actorUserId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  diff?: unknown;
};

export async function logAudit(input: AuditInput) {
  const diffJson =
    input.diff === undefined
      ? undefined
      : input.diff === null
        ? Prisma.JsonNull
        : (JSON.parse(JSON.stringify(input.diff)) as Prisma.InputJsonValue);

  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      diffJson,
    },
  });
}

export function buildDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  const changedEntries = Object.entries(after).filter(([key, value]) => before[key] !== value);

  return changedEntries.reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[key] = {
      before: before[key],
      after: value,
    };
    return acc;
  }, {});
}
