import { NextResponse } from "next/server";
import { fetchKosha } from "@/lib/scrapers/kosha";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const cached = getCache("kosha");
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached.data,
      source: "kosha",
      fetchedAt: cached.fetchedAt,
    });
  }

  try {
    const data = await fetchKosha();
    const fetchedAt = new Date().toISOString();
    setCache("kosha", data, fetchedAt);
    return NextResponse.json({
      success: true,
      data,
      source: "kosha",
      fetchedAt,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: [],
      source: "kosha",
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
}
