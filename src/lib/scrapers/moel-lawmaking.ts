import * as cheerio from "cheerio";
import { Notice } from "../types";
import { IMPORTANT_KEYWORDS } from "../constants";
import { normalizeDate, isRecent, resolveHref } from "../utils";

const LIST_URL = "https://www.moel.go.kr/info/lawinfo/lawmaking/list.do";
const BASE_URL = "https://www.moel.go.kr/info/lawinfo/lawmaking/";

export async function fetchMoelLawmaking(): Promise<Notice[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(LIST_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`MOEL lawmaking failed: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const notices: Notice[] = [];

    $("table tbody tr").each((i, el) => {
      if (i >= 5) return false;

      const tds = $(el).find("td");
      const rawTitle = tds.eq(1).text().trim();
      const rawDate = tds.eq(3).text().trim();
      const href = tds.eq(1).find("a").attr("href") || "";

      const title = rawTitle.replace(/\s+/g, " ").trim();
      const date = normalizeDate(rawDate);
      const detailUrl = resolveHref(href, BASE_URL, LIST_URL);

      const seqMatch = href.match(/bbs_seq=(\d+)/);
      const uniqueId = seqMatch ? seqMatch[1] : `${date}-${i}`;

      if (title) {
        notices.push({
          id: `moel-law-${uniqueId}`,
          title,
          date,
          url: detailUrl,
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
