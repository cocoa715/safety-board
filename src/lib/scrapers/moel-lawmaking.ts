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
    const notices: Notice[] = [];

    // <item>...</item> 블록 추출
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && notices.length < 5) {
      const block = match[1];

      // title: CDATA 또는 일반 텍스트
      const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
      const title = titleMatch ? titleMatch[1].trim() : "";

      // link
      const linkMatch = block.match(/<link>(.*?)<\/link>/);
      const link = linkMatch ? linkMatch[1].trim() : "";

      // dc:date
      const dateMatch = block.match(/<dc:date>(.*?)<\/dc:date>/);
      const rawDate = dateMatch ? dateMatch[1].trim() : "";
      const date = rawDate.split(" ")[0] || rawDate;

      const seqMatch = link.match(/bbs_seq=(\d+)/);
      const uniqueId = seqMatch ? seqMatch[1] : `${date}-${notices.length}`;

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
    }

    return notices;
  } finally {
    clearTimeout(timeout);
  }
}
