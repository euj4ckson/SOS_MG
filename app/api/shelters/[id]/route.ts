import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { buildDiff, logAudit } from "@/lib/audit";
import { canAccessShelter, requireApiUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sanitizeShelterData } from "@/lib/text-normalization";
import { shelterUpdateSchema } from "@/lib/validators";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  if (!canAccessShelter(auth.user, context.params.id)) {
    return NextResponse.json({ error: "Sem permissão para este abrigo." }, { status: 403 });
  }

  const shelter = await prisma.shelter.findUnique({
    where: { id: context.params.id },
    include: {
      needs: {
        orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
      },
      operators: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!shelter) {
    return NextResponse.json({ error: "Abrigo não encontrado." }, { status: 404 });
  }

  return NextResponse.json(shelter);
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  if (!canAccessShelter(auth.user, context.params.id)) {
    return NextResponse.json({ error: "Sem permissão para editar este abrigo." }, { status: 403 });
  }

  try {
    const existing = await prisma.shelter.findUnique({
      where: { id: context.params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Abrigo não encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = shelterUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const nextCapacity = parsed.data.capacity ?? existing.capacity;
    const nextOccupancy = parsed.data.occupancy ?? existing.occupancy;
    if (nextOccupancy > nextCapacity) {
      return NextResponse.json(
        { error: "Ocupação não pode ser maior que a capacidade." },
        { status: 400 },
      );
    }

    const updated = await prisma.shelter.update({
      where: { id: context.params.id },
      data: sanitizeShelterData(parsed.data),
    });

    await logAudit({
      actorUserId: auth.user.id,
      entityType: "SHELTER",
      entityId: updated.id,
      action: "UPDATE",
      diff: buildDiff(
        existing as unknown as Record<string, unknown>,
        updated as unknown as Record<string, unknown>,
      ),
    });

    revalidateTag("shelters");
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Falha ao atualizar abrigo." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  if (auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores podem excluir." }, { status: 403 });
  }

  const shelter = await prisma.shelter.findUnique({
    where: { id: context.params.id },
  });

  if (!shelter) {
    return NextResponse.json({ error: "Abrigo não encontrado." }, { status: 404 });
  }

  await prisma.shelter.delete({ where: { id: context.params.id } });

  await logAudit({
    actorUserId: auth.user.id,
    entityType: "SHELTER",
    entityId: context.params.id,
    action: "DELETE",
    diff: shelter,
  });

  revalidateTag("shelters");
  return NextResponse.json({ success: true });
}
