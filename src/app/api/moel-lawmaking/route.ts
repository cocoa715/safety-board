import { NextResponse } from "next/server";
import { fetchMoelLawmaking } from "@/lib/scrapers/moel-lawmaking";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchMoelLawmaking();
    const fetchedAt = new Date().toISOString();
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
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
}
