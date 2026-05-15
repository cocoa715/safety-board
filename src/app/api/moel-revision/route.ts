import { NextResponse } from "next/server";
import { fetchMoelRevision } from "@/lib/scrapers/moel-revision";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

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
    return NextResponse.json({
      success: false,
      data: [],
      source: "moel-revision",
      fetchedAt: new Date().toISOString(),
      error: "고용노동부 사이트 접속 제한 (직접 방문해주세요)",
    });
  }
}
