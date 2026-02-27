import {
  type NeedPriority,
  NeedStatus,
  type Prisma,
  type ShelterStatus,
} from "@prisma/client";
import { unstable_cache } from "next/cache";
import { SHELTER_PAGE_SIZE } from "./constants";
import { prisma } from "./prisma";

export type ShelterListFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  city?: string;
  status?: ShelterStatus;
  accessible?: boolean;
  acceptsPets?: boolean;
  needs?: string[];
};

function buildShelterWhere(filters: ShelterListFilters): Prisma.ShelterWhereInput {
  const where: Prisma.ShelterWhereInput[] = [];

  if (filters.search) {
    where.push({
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { neighborhood: { contains: filters.search, mode: "insensitive" } },
        { city: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  if (filters.city) {
    where.push({
      city: { equals: filters.city, mode: "insensitive" },
    });
  }

  if (filters.status) {
    where.push({ status: filters.status });
  }

  if (typeof filters.accessible === "boolean") {
    where.push({ accessible: filters.accessible });
  }

  if (typeof filters.acceptsPets === "boolean") {
    where.push({ acceptsPets: filters.acceptsPets });
  }

  if (filters.needs?.length) {
    const terms = filters.needs.filter(Boolean);
    if (terms.length > 0) {
      where.push({
        needs: {
          some: {
            status: NeedStatus.ACTIVE,
            OR: terms.flatMap((term) => [
              { category: { contains: term, mode: "insensitive" } },
              { item: { contains: term, mode: "insensitive" } },
            ]),
          },
        },
      });
    }
  }

  return where.length ? { AND: where } : {};
}

async function queryPublicShelters(filters: ShelterListFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? SHELTER_PAGE_SIZE;
  const where = buildShelterWhere(filters);
  const skip = (page - 1) * pageSize;

  const [total, shelters] = await prisma.$transaction([
    prisma.shelter.count({ where }),
    prisma.shelter.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        city: true,
        neighborhood: true,
        address: true,
        lat: true,
        lng: true,
        status: true,
        capacity: true,
        occupancy: true,
        accessible: true,
        acceptsPets: true,
        publicContact: true,
        updatedAt: true,
        needs: {
          where: { status: NeedStatus.ACTIVE },
          select: {
            id: true,
            item: true,
            priority: true,
            quantity: true,
            unit: true,
          },
          orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
          take: 3,
        },
      },
    }),
  ]);

  return {
    items: shelters,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    },
  };
}

export async function getPublicShelterList(filters: ShelterListFilters) {
  const key = JSON.stringify(filters);
  const cachedFn = unstable_cache(
    async () => queryPublicShelters(filters),
    ["public-shelter-list", key],
    {
      revalidate: 60,
      tags: ["shelters"],
    },
  );
  return cachedFn();
}

async function queryShelterById(id: string) {
  return prisma.shelter.findUnique({
    where: { id },
    include: {
      needs: {
        orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
      },
    },
  });
}

export async function getPublicShelterById(id: string) {
  const cachedFn = unstable_cache(async () => queryShelterById(id), ["shelter", id], {
    revalidate: 60,
    tags: ["shelters"],
  });
  return cachedFn();
}

export async function getShelterCities() {
  const cachedFn = unstable_cache(
    async () => {
      const cities = await prisma.shelter.findMany({
        distinct: ["city"],
        select: { city: true },
        orderBy: { city: "asc" },
      });
      return cities.map((entry) => entry.city);
    },
    ["shelter-cities"],
    { revalidate: 300, tags: ["shelters"] },
  );
  return cachedFn();
}

export async function getUrgentNeedsAggregate() {
  const cachedFn = unstable_cache(
    async () => {
      const grouped = await prisma.need.groupBy({
        by: ["category", "item", "unit", "priority"],
        where: { status: NeedStatus.ACTIVE },
        _sum: { quantity: true },
        _count: { _all: true },
      });

      const priorityScore: Record<NeedPriority, number> = {
        HIGH: 3,
        MED: 2,
        LOW: 1,
      };

      return grouped
        .sort((a, b) => {
          const priorityDelta = priorityScore[b.priority] - priorityScore[a.priority];
          if (priorityDelta !== 0) return priorityDelta;
          const quantityA = a._sum.quantity ?? 0;
          const quantityB = b._sum.quantity ?? 0;
          if (quantityB !== quantityA) return quantityB - quantityA;
          return b._count._all - a._count._all;
        })
        .slice(0, 20)
        .map((entry) => ({
          category: entry.category,
          item: entry.item,
          priority: entry.priority,
          unit: entry.unit,
          totalQuantity: entry._sum.quantity,
          sheltersCount: entry._count._all,
        }));
    },
    ["urgent-needs-aggregate"],
    { revalidate: 120, tags: ["shelters"] },
  );

  return cachedFn();
}

export async function getSheltersForManagement(user: {
  role: "ADMIN" | "OPERATOR";
  shelterId?: string | null;
}) {
  if (user.role === "OPERATOR" && user.shelterId) {
    const shelter = await prisma.shelter.findUnique({
      where: { id: user.shelterId },
      select: {
        id: true,
        name: true,
        city: true,
        neighborhood: true,
        status: true,
        capacity: true,
        occupancy: true,
        updatedAt: true,
      },
    });
    return shelter ? [shelter] : [];
  }

  return prisma.shelter.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      city: true,
      neighborhood: true,
      status: true,
      capacity: true,
      occupancy: true,
      updatedAt: true,
    },
  });
}

export async function getManagedShelterById(id: string) {
  return prisma.shelter.findUnique({
    where: { id },
    include: {
      needs: {
        orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
      },
      operators: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { needs: true },
      },
    },
  });
}
