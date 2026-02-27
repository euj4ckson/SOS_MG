import { NextResponse } from "next/server";
import { getUrgentNeedsAggregate } from "@/lib/shelters";

export const revalidate = 120;
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getUrgentNeedsAggregate();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
