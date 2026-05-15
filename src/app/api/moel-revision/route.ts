import { NextResponse } from "next/server";
import { fetchMoelRevision } from "@/lib/scrapers/moel-revision";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const preferredRegion = ["icn1", "hnd1"];

export async function GET() {
  const cached = getCache("moel-revision");
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached.data,
      source: "moel-revision",
      fetchedAt: cached.fetchedAt,
    });
  }

  try {
    const data = await fetchMoelRevision();
    const fetchedAt = new Date().toISOString();
    setCache("moel-revision", data, fetchedAt);
    return NextResponse.json({
      success: true,
      data,
      source: "moel-revision",
      fetchedAt,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "알 수 없는 오류";
    const stack = error instanceof Error ? error.stack?.slice(0, 300) : "";
    return NextResponse.json({
      success: false,
      data: [],
      source: "moel-revision",
      fetchedAt: new Date().toISOString(),
      error: `[law.go.kr] ${msg}`,
      debug: { cause: String((error as any)?.cause || ""), stack },
    });
  }
}
