import { Notice } from "../types";
import { normalizeDate, isRecent } from "../utils";

const PAGE_URL = "https://kosha.or.kr/notification/notice/contruction";
const API_URL = "https://kosha.or.kr/api/compn24/auth/stdtboard/process.do";

/**
 * 안전보건공단 공지사항 스크래퍼
 *
 * KOSHA 사이트가 Vue SPA + tboard 게시판 시스템을 사용하므로,
 * 실제 브라우저가 보내는 것과 동일한 형식(_JSON 이중 URL 인코딩)으로
 * API를 호출하여 데이터를 가져온다.
 */
export async function fetchKosha(): Promise<Notice[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const payload = {
      common: {
        frontInfo: { viewId: "", menuId: "", siteId: "" },
        frontAuthKey: "",
        auth: {},
        securityInfo: {},
        data: {
          pagingInfo: null,
          whereId: null,
          tboard: {
            systemCd: "50",
            channel: "web",
            bbsId: "B2025021400001",
            bbsGrpId: "",
            serviceId: "basicAccess",
          },
        },
      },
      service: {
        info: { id: "", type: "" },
        data: {
          searchDefaultCndGrid: [
            {
              orPstNm: "",
              orPstCn: "",
              curPageCo: 1,
              recodePageCo: 5,
              rowsPerPage: 5,
              pstSeCd: "1200001",
              atcflCntSrchYn: "Y",
              artclNoList: [],
              pstNoOrder: "Y",
              isDesc: "Y",
              sortType: "01",
              sortOrder: "1",
              isAddPstCn: "N",
            },
          ],
          searchArtclCndGrid: [],
        },
      },
    };

    const jsonStr = JSON.stringify(payload);
    const encoded = `_JSON=${encodeURIComponent(encodeURIComponent(jsonStr))}`;

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/json, text/javascript, */*; q=0.01",
        Origin: "https://kosha.or.kr",
        Referer: PAGE_URL,
        chnlid: "kosha24",
      },
      body: encoded,
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`KOSHA API failed: ${res.status}`);

    const data = await res.json();

    if (data?.code === 0 && data?.response) {
      const { bbsPstGrid = [], pstNoGrid = [] } = data.response;

      // bbsPstGrid에서 제목(pstNm)과 날짜(regYmd) 추출
      if (bbsPstGrid.length > 0) {
        // 공지(pstSeCd=1200002)를 제외한 일반 게시글만 필터, 최신순 정렬
        const normalPosts = bbsPstGrid
          .filter((p: Record<string, string>) => p.pstSeCd !== "1200002")
          .sort((a: Record<string, string>, b: Record<string, string>) =>
            (b.regYmd || "").localeCompare(a.regYmd || "")
          );

        return normalPosts.slice(0, 5).map(
          (item: Record<string, string | number>, idx: number) => {
            const date = normalizeDate((item.regYmd as string) || "");
            return {
              id: `kosha-${item.pstNo || idx}`,
              title: (item.pstNm as string) || "제목 없음",
              date,
              url: PAGE_URL,
              isNew: isRecent(date),
            };
          }
        );
      }

      // bbsPstGrid가 비어있으면 pstNoGrid의 pstNo로 날짜 추출 시도
      if (pstNoGrid.length > 0) {
        return pstNoGrid
          .filter((p: Record<string, number>) => p.totalCount > 1)
          .slice(0, 5)
          .map((item: Record<string, string | number>, idx: number) => ({
            id: `kosha-${item.pstNo || idx}`,
            title: `안전보건공단 공지사항 #${item.rnum}`,
            date: normalizeDate((item.pstNo as string) || ""),
            url: PAGE_URL,
          }));
      }
    }

    // 최종 fallback
    return [
      {
        id: "kosha-guide",
        title: "안전보건공단 공지사항 - 원본 사이트에서 확인",
        date: "",
        url: PAGE_URL,
      },
    ];
  } finally {
    clearTimeout(timeout);
  }
}
