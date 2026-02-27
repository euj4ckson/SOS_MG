import { NextResponse } from "next/server";
import { getPublicShelterList } from "@/lib/shelters";
import { parseBooleanParam } from "@/lib/utils";
import { parseNeedFilters, shelterQuerySchema } from "@/lib/validators";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = shelterQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    accessible: searchParams.get("accessible") ?? undefined,
    acceptsPets: searchParams.get("acceptsPets") ?? undefined,
    donationOnly: searchParams.get("donationOnly") ?? undefined,
    needs: searchParams.get("needs") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Filtros inválidos.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const data = await getPublicShelterList({
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    search: parsed.data.search,
    city: parsed.data.city,
    status: parsed.data.status,
    accessible: parseBooleanParam(parsed.data.accessible),
    acceptsPets: parseBooleanParam(parsed.data.acceptsPets),
    donationOnly: parseBooleanParam(parsed.data.donationOnly),
    needs: parseNeedFilters(parsed.data.needs),
  });

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
