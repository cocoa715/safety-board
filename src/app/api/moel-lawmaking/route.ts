import { NextResponse } from "next/server";
import { fetchMoelLawmaking } from "@/lib/scrapers/moel-lawmaking";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const cached = getCache("moel-lawmaking");
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached.data,
      source: "moel-lawmaking",
      fetchedAt: cached.fetchedAt,
    });
  }

  try {
    const data = await fetchMoelLawmaking();
    const fetchedAt = new Date().toISOString();
    setCache("moel-lawmaking", data, fetchedAt);
    return NextResponse.json({
      success: true,
      data,
      source: "moel-lawmaking",
      fetchedAt,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: [],
      source: "moel-lawmaking",
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? `[rss] ${error.message}` : "알 수 없는 오류",
    });
  }
}
