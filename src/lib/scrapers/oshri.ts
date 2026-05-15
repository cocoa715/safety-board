import * as cheerio from "cheerio";
import { Notice } from "../types";
import { normalizeDate, isRecent } from "../utils";

const LIST_URL =
  "https://oshri.kosha.or.kr/oshri/researcherNews/notice.do";

export async function fetchOshri(): Promise<Notice[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(LIST_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`OSHRI failed: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const notices: Notice[] = [];

    $("table tbody tr").each((i, el) => {
      if (i >= 5) return false;
      const tds = $(el).find("td");
      const title = tds.eq(1).find("a").text().trim() || tds.eq(1).text().trim();
      const rawDate = tds.eq(3).text().trim() || tds.eq(2).text().trim();
      const href = tds.eq(1).find("a").attr("href") || "";

      const articleMatch = href.match(/articleNo=(\d+)/);
      const articleNo = articleMatch ? articleMatch[1] : null;

      let articleUrl = LIST_URL;
      if (articleNo) {
        articleUrl = `${LIST_URL}?mode=view&articleNo=${articleNo}&article.offset=0&articleLimit=10`;
      }

      if (title) {
        const date = normalizeDate(rawDate);
        notices.push({
          id: articleNo ? `oshri-${articleNo}` : `oshri-${date}-${i}`,
          title,
          date,
          url: articleUrl,
          isNew: isRecent(date),
        });
      }
    });

    return notices;
  } finally {
    clearTimeout(timeout);
  }
}
