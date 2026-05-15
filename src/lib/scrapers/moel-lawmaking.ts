import * as cheerio from "cheerio";
import { Notice } from "../types";
import { IMPORTANT_KEYWORDS } from "../constants";
import { isRecent } from "../utils";

const RSS_URLS = [
  "https://www.moel.go.kr/rss/lawinfo.do",
  "http://www.moel.go.kr/rss/lawinfo.do",
];

export async function fetchMoelLawmaking(): Promise<Notice[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    let res: Response | null = null;
    let lastError: Error | null = null;

    for (const url of RSS_URLS) {
      try {
        res = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
          },
          signal: controller.signal,
        });
        if (res.ok) break;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        res = null;
      }
    }

    if (!res || !res.ok) throw lastError || new Error("all RSS URLs failed");

    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    const notices: Notice[] = [];

    $("item").each((i, el) => {
      if (i >= 5) return false;

      const title = $(el).find("title").text().trim();
      const link = $(el).find("link").text().trim();
      const rawDate = $(el).find("dc\\:date, date").text().trim();

      const date = rawDate.split(" ")[0] || rawDate;

      const seqMatch = link.match(/bbs_seq=(\d+)/);
      const uniqueId = seqMatch ? seqMatch[1] : `${date}-${i}`;

      if (title) {
        notices.push({
          id: `moel-law-${uniqueId}`,
          title,
          date,
          url: link,
          isImportant: IMPORTANT_KEYWORDS.some((kw) => title.includes(kw)),
          isNew: isRecent(date),
        });
      }
    });

    return notices;
  } finally {
    clearTimeout(timeout);
  }
}
