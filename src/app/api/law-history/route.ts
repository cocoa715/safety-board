import { NextResponse } from "next/server";
import { fetchLawHistory } from "@/lib/scrapers/law-history";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const cached = getCache("law-history");
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached.data,
      source: "law-history",
      fetchedAt: cached.fetchedAt,
    });
  }

  try {
    const data = await fetchLawHistory();
    const fetchedAt = new Date().toISOString();
    setCache("law-history", data, fetchedAt);
    return NextResponse.json({
      success: true,
      data,
      source: "law-history",
      fetchedAt,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: [],
      source: "law-history",
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
}
