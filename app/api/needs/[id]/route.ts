import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { buildDiff, logAudit } from "@/lib/audit";
import { canAccessShelter, requireApiUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { needUpdateSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const need = await prisma.need.findUnique({
    where: { id: context.params.id },
  });

  if (!need) {
    return NextResponse.json({ error: "Necessidade não encontrada." }, { status: 404 });
  }

  if (!canAccessShelter(auth.user, need.shelterId)) {
    return NextResponse.json({ error: "Sem permissão para alterar este registro." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = needUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await prisma.need.update({
      where: { id: context.params.id },
      data: {
        ...parsed.data,
        unit: parsed.data.unit ?? undefined,
        notes: parsed.data.notes ?? undefined,
      },
    });

    await logAudit({
      actorUserId: auth.user.id,
      entityType: "NEED",
      entityId: updated.id,
      action: "UPDATE",
      diff: buildDiff(
        need as unknown as Record<string, unknown>,
        updated as unknown as Record<string, unknown>,
      ),
    });

    revalidateTag("shelters");
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Falha ao atualizar necessidade." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const need = await prisma.need.findUnique({
    where: { id: context.params.id },
  });

  if (!need) {
    return NextResponse.json({ error: "Necessidade não encontrada." }, { status: 404 });
  }

  if (!canAccessShelter(auth.user, need.shelterId)) {
    return NextResponse.json({ error: "Sem permissão para excluir este registro." }, { status: 403 });
  }

  await prisma.need.delete({ where: { id: context.params.id } });

  await logAudit({
    actorUserId: auth.user.id,
    entityType: "NEED",
    entityId: context.params.id,
    action: "DELETE",
    diff: need,
  });

  revalidateTag("shelters");
  return NextResponse.json({ success: true });
}
