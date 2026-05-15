import * as cheerio from "cheerio";
import { Notice } from "../types";
import { IMPORTANT_KEYWORDS } from "../constants";
import { isRecent } from "../utils";

// 산업안전보건기준에 관한 규칙 - 연혁 AJAX 엔드포인트
const HISTORY_URL =
  "https://www.law.go.kr/LSW/lsHstListR.do?lsiSeq=273603&lsId=007363&lsNm=%EC%82%B0%EC%97%85%EC%95%88%EC%A0%84%EB%B3%B4%EA%B1%B4%EA%B8%B0%EC%A4%80%EC%97%90%20%EA%B4%80%ED%95%9C%20%EA%B7%9C%EC%B9%99&ancYd=20250901&ancNo=00450&efYd=20260302&efYn=Y&chrClsCd=010202&nwJoYnInfo=Y&ancYnChk=0&netPrivateYn=N";

// 제정·개정이유 페이지로 바로 이동
const BASE_URL = "https://www.law.go.kr/LSW/lsRvsDocInfoR.do?lsiSeq=";

export async function fetchLawHistory(): Promise<Notice[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(HISTORY_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9",
        "Referer": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=273603",
      },
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`law history failed: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const notices: Notice[] = [];

    $("#lsHstDivKO li").each((i, el) => {
      if (i >= 5) return false;

      const anchor = $(el).find("a");
      const subtit = $(el).find(".subtit1_1").text().trim();
      const onclick = anchor.attr("onclick") || "";

      // onclick에서 lsiSeq, 개정유형 추출
      // lsViewLsHst2('273603', '20250901', '00450', '20260302', 'Y', '0' , '일부개정')
      const onclickMatch = onclick.match(
        /lsViewLsHst2\('(\d+)',\s*'(\d+)',\s*'(\d+)',\s*'(\d+)',\s*'[^']*',\s*'[^']*'\s*,\s*'([^']*)'/
      );

      const lsiSeq = onclickMatch ? onclickMatch[1] : "";
      const revisionType = onclickMatch ? onclickMatch[5] : "";

      // [시행 2026. 3. 2.] [고용노동부... 제450호, 2025. 9. 1., 일부개정]
      const dateMatch = subtit.match(/시행\s+(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
      const date = dateMatch
        ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`
        : "";

      // 호수 추출
      const noMatch = subtit.match(/제(\d+)호/);
      const lawNo = noMatch ? `제${noMatch[1]}호` : "";

      const title = `[${revisionType}] 안전보건규칙 ${lawNo}`;
      const detailUrl = lsiSeq ? `${BASE_URL}${lsiSeq}` : "";

      if (title && date) {
        notices.push({
          id: `law-hst-${lsiSeq}-${date}`,
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
