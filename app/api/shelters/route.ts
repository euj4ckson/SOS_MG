import { NeedStatus, type Prisma, type ShelterStatus } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { requireApiUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { shelterSchema } from "@/lib/validators";

function parsePage(value: string | null) {
  const page = Number(value ?? "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function parsePageSize(value: string | null) {
  const size = Number(value ?? "12");
  if (!Number.isFinite(size) || size <= 0) return 12;
  return Math.min(Math.floor(size), 50);
}

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = parsePage(searchParams.get("page"));
  const pageSize = parsePageSize(searchParams.get("pageSize"));
  const search = searchParams.get("search")?.trim();
  const city = searchParams.get("city")?.trim();
  const status = searchParams.get("status") as ShelterStatus | null;

  if (auth.user.role === "OPERATOR") {
    if (!auth.user.shelterId) {
      return NextResponse.json({ items: [], pagination: { page: 1, pageSize, total: 0, totalPages: 1 } });
    }

    const shelter = await prisma.shelter.findUnique({
      where: { id: auth.user.shelterId },
      include: {
        needs: {
          where: { status: NeedStatus.ACTIVE },
          orderBy: { updatedAt: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      items: shelter ? [shelter] : [],
      pagination: { page: 1, pageSize, total: shelter ? 1 : 0, totalPages: 1 },
    });
  }

  const whereClauses: Prisma.ShelterWhereInput[] = [];

  if (search) {
    whereClauses.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { neighborhood: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (city) whereClauses.push({ city: { equals: city, mode: "insensitive" } });
  if (status) whereClauses.push({ status });

  const where: Prisma.ShelterWhereInput = whereClauses.length > 0 ? { AND: whereClauses } : {};

  const [total, items] = await prisma.$transaction([
    prisma.shelter.count({ where }),
    prisma.shelter.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    },
  });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  if (auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores podem cadastrar abrigos." }, { status: 403 });
  }

  try {
    const json = await request.json();
    const parsed = shelterSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const created = await prisma.shelter.create({
      data: parsed.data,
    });

    await logAudit({
      actorUserId: auth.user.id,
      entityType: "SHELTER",
      entityId: created.id,
      action: "CREATE",
      diff: created,
    });

    revalidateTag("shelters");
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível cadastrar o abrigo. Tente novamente." },
      { status: 500 },
    );
  }
}
