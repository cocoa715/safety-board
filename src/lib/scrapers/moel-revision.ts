import * as cheerio from "cheerio";
import { Notice } from "../types";
import { IMPORTANT_KEYWORDS } from "../constants";
import { isRecent } from "../utils";

// 법제처 국가법령정보센터 - 고용노동부 최근공포법령
// 여러 URL을 순차적으로 시도 (ECONNRESET 대비)
const LIST_URLS = [
  "https://www.law.go.kr/LSW/nwRvsLsPop.do?pageIndex=1&cptOfi=1492000",
  "http://www.law.go.kr/LSW/nwRvsLsPop.do?pageIndex=1&cptOfi=1492000",
  "https://open.law.go.kr/LSO/nwRvsLsPop.do?pageIndex=1&cptOfi=1492000",
];
const BASE_URL = "https://www.law.go.kr/LSW/";

export async function fetchMoelRevision(): Promise<Notice[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    let res: Response | null = null;
    let lastError: Error | null = null;

    for (const url of LIST_URLS) {
      try {
        res = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Accept":
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ko-KR,ko;q=0.9",
          },
          signal: controller.signal,
        });
        if (res.ok) break;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        res = null;
      }
    }

    if (!res || !res.ok) throw lastError || new Error("all URLs failed");

    const html = await res.text();
    const $ = cheerio.load(html);
    const notices: Notice[] = [];

    $("table tbody tr, table tr").each((i, el) => {
      const tds = $(el).find("td");
      if (tds.length < 7) return;

      const idx = tds.eq(0).text().trim();
      if (!idx || isNaN(Number(idx))) return;
      if (notices.length >= 5) return false;

      const anchor = tds.eq(1).find("a");
      const title = anchor.attr("title") || anchor.text().trim();
      const href = anchor.attr("href") || "";
      const revisionType = tds.eq(3).text().trim();
      const rawDate = tds.eq(6).text().trim();

      const dateMatch = rawDate.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
      const date = dateMatch
        ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`
        : rawDate;

      const seqMatch = href.match(/lsiSeq=(\d+)/);
      const uniqueId = seqMatch ? seqMatch[1] : `${date}-${i}`;
      const detailUrl = href
        ? `${BASE_URL}${href.replace(/^\.\//, "")}`
        : LIST_URLS[0];

      const fullTitle = revisionType ? `[${revisionType}] ${title}` : title;

      if (title) {
        notices.push({
          id: `moel-rev-${uniqueId}`,
          title: fullTitle,
          date,
          url: detailUrl,
          isImportant: IMPORTANT_KEYWORDS.some((kw) => fullTitle.includes(kw)),
          isNew: isRecent(date),
        });
      }
    });

    return notices;
  } finally {
    clearTimeout(timeout);
  }
}
