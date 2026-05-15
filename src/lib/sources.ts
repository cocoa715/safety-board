import { DataSource } from "./types";

export const DATA_SOURCES: DataSource[] = [
  {
    key: "kosha",
    label: "안전보건공단",
    subLabel: "건설 공지사항",
    shortName: "KOSHA",
    siteUrl: "https://kosha.or.kr/notification/notice/contruction",
    apiPath: "/api/kosha",
    linkText: "kosha.or.kr",
  },
  {
    key: "oshri",
    label: "산업안전보건연구원",
    subLabel: "공지사항",
    shortName: "OSHRI",
    siteUrl: "https://oshri.kosha.or.kr/oshri/researcherNews/notice.do",
    apiPath: "/api/oshri",
    linkText: "oshri.kosha.or.kr",
  },
  {
    key: "portal",
    label: "산업안전포털",
    subLabel: "보건위생 기술지원규정",
    shortName: "PORTAL",
    siteUrl:
      "https://portal.kosha.or.kr/archive/resources/tech-support/search/health",
    apiPath: "/api/portal",
    linkText: "portal.kosha.or.kr",
  },
  {
    key: "law-history",
    label: "법제처",
    subLabel: "안전보건규칙 개정이력",
    shortName: "규칙연혁",
    siteUrl:
      "https://www.law.go.kr/법령/산업안전보건기준에관한규칙",
    apiPath: "/api/law-history",
    linkText: "law.go.kr",
  },
  {
    key: "moel-revision",
    label: "고용노동부",
    subLabel: "최근 제·개정 법령",
    shortName: "제·개정",
    siteUrl: "https://www.moel.go.kr/info/lawinfo/revision/list.do",
    apiPath: "/api/moel-revision",
    linkText: "moel.go.kr",
    // externalOnly: true,
  },
  {
    key: "moel-lawmaking",
    label: "고용노동부",
    subLabel: "입법·행정예고",
    shortName: "입법예고",
    siteUrl: "https://www.moel.go.kr/info/lawinfo/lawmaking/list.do",
    apiPath: "/api/moel-lawmaking",
    linkText: "moel.go.kr",
    // externalOnly: true,
  },
];

export const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10분
export const MAX_NOTICES = 5;
