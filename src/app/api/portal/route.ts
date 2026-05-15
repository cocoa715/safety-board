import { NextResponse } from "next/server";
import { fetchPortal } from "@/lib/scrapers/portal";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const cached = getCache("portal");
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached.data,
      source: "portal",
      fetchedAt: cached.fetchedAt,
    });
  }

  try {
    const data = await fetchPortal();
    const fetchedAt = new Date().toISOString();
    setCache("portal", data, fetchedAt);
    return NextResponse.json({
      success: true,
      data,
      source: "portal",
      fetchedAt,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: [],
      source: "portal",
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
}
