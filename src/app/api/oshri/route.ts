import { NextResponse } from "next/server";
import { fetchOshri } from "@/lib/scrapers/oshri";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const cached = getCache("oshri");
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached.data,
      source: "oshri",
      fetchedAt: cached.fetchedAt,
    });
  }

  try {
    const data = await fetchOshri();
    const fetchedAt = new Date().toISOString();
    setCache("oshri", data, fetchedAt);
    return NextResponse.json({
      success: true,
      data,
      source: "oshri",
      fetchedAt,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: [],
      source: "oshri",
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
}
