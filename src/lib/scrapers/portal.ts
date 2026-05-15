import { Notice } from "../types";
import { normalizeDate, isRecent } from "../utils";

const API_URL =
  "https://portal.kosha.or.kr/api/portal24/bizV/p/VCPDG08009/selectList";
const SITE_URL =
  "https://portal.kosha.or.kr/archive/resources/tech-support/search/health";

export async function fetchPortal(): Promise<Notice[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Referer: SITE_URL,
      },
      body: JSON.stringify({
        techGdlnCtgryCd: "E",
        techGdlnSttsSeCdIng: "1",
        techGdlnSttsSeCdDel: "0",
        startDt: null,
        endDt: null,
        searchType: "all",
        searchVal: null,
        page: 1,
        rowsPerPage: "5",
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Portal failed: ${res.status}`);

    const data = await res.json();
    const list = data?.payload?.list || [];

    return list.slice(0, 5).map(
      (item: Record<string, string | number>, idx: number) => {
        const date = normalizeDate((item.techGdlnOfancYmd as string) || "");
        return {
          id: `portal-${item.techGdlnNo || idx}`,
          title: `[${item.techGdlnNo}] ${(item.techGdlnNm as string) || "제목 없음"}`,
          date,
          url: `${SITE_URL}/history?techGdlnNo=${item.techGdlnNo}`,
          isNew: isRecent(date),
        };
      }
    );
  } finally {
    clearTimeout(timeout);
  }
}
