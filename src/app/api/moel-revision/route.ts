import { NextResponse } from "next/server";
import { fetchMoelRevision } from "@/lib/scrapers/moel-revision";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchMoelRevision();
    const fetchedAt = new Date().toISOString();
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
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
}
