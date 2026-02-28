import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { canAccessShelter, requireApiUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sanitizeNeedData } from "@/lib/text-normalization";
import { needSchema } from "@/lib/validators";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  if (!canAccessShelter(auth.user, context.params.id)) {
    return NextResponse.json({ error: "Sem permissão para acessar necessidades." }, { status: 403 });
  }

  const needs = await prisma.need.findMany({
    where: { shelterId: context.params.id },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(needs);
}

export async function POST(
  request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  if (!canAccessShelter(auth.user, context.params.id)) {
    return NextResponse.json({ error: "Sem permissão para editar necessidades." }, { status: 403 });
  }

  const shelter = await prisma.shelter.findUnique({
    where: { id: context.params.id },
    select: { id: true },
  });
  if (!shelter) {
    return NextResponse.json({ error: "Abrigo não encontrado." }, { status: 404 });
  }

  try {
    const json = await request.json();
    const parsed = needSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const sanitized = sanitizeNeedData(parsed.data);

    const created = await prisma.need.create({
      data: {
        shelterId: context.params.id,
        category: sanitized.category,
        item: sanitized.item,
        priority: sanitized.priority,
        quantity: sanitized.quantity ?? null,
        unit: sanitized.unit || null,
        status: sanitized.status,
        notes: sanitized.notes || null,
      },
    });

    await logAudit({
      actorUserId: auth.user.id,
      entityType: "NEED",
      entityId: created.id,
      action: "CREATE",
      diff: created,
    });

    revalidateTag("shelters");
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível cadastrar a necessidade." }, { status: 500 });
  }
}
