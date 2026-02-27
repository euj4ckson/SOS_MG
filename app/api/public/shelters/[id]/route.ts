import { NextResponse } from "next/server";
import { getPublicShelterById } from "@/lib/shelters";

export const revalidate = 60;

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const shelter = await getPublicShelterById(context.params.id);

  if (!shelter) {
    return NextResponse.json({ error: "Abrigo não encontrado." }, { status: 404 });
  }

  return NextResponse.json(shelter, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
