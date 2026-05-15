# PRD (Product Requirements Document)

# 안전보건 공지 현황판

**문서 버전:** 1.0
**작성일:** 2026-04-28
**소속:** 씨젠의료재단 산업보건분석팀

---

## 1. 제품 개요

안전보건 관련 5개 공공기관의 최신 공지사항을 한 화면에 모아 실시간으로 보여주는 웹 대시보드 애플리케이션.

## 2. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.2.4 |
| 언어 | TypeScript | 5.x |
| UI 라이브러리 | React | 19.2.4 |
| 스타일링 | Tailwind CSS | 4.x |
| HTML 파싱 | Cheerio | 1.2.0 |
| 빌드 도구 | Turbopack (Next.js 내장) | - |
| 패키지 매니저 | npm | - |

## 3. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    브라우저 (Client)                    │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │NoticeCard│ │NoticeCard│ │NoticeCard│  ...× 5     │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘             │
│       │ fetch       │            │     10분 간격       │
│       │ (polling)   │            │     자동 갱신       │
│       ▼             ▼            ▼                    │
│  ┌─────────────────────────────────────┐             │
│  │          localStorage               │             │
│  │   (읽음 상태: notice-read-ids)       │             │
│  └─────────────────────────────────────┘             │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP GET /api/{source}
                        ▼
┌─────────────────────────────────────────────────────┐
│               Next.js API Routes (Server)            │
│                                                       │
│  /api/kosha  /api/oshri  /api/portal                 │
│  /api/moel-revision  /api/moel-lawmaking             │
│       │           │          │                        │
│       ▼           ▼          ▼                        │
│  ┌─────────────────────────────────────┐             │
│  │         Scrapers (lib/scrapers/)     │             │
│  │                                      │             │
│  │  kosha.ts    → tboard API 호출       │             │
│  │  oshri.ts    → HTML 테이블 파싱      │             │
│  │  portal.ts   → JSON API 호출         │             │
│  │  moel-*.ts   → HTML 테이블 파싱      │             │
│  └──────────────────┬──────────────────┘             │
└─────────────────────┼───────────────────────────────┘
                      │ fetch (서버 사이드)
                      ▼
┌─────────────────────────────────────────────────────┐
│              외부 공공기관 웹사이트                      │
│                                                       │
│  kosha.or.kr  │  oshri.kosha.or.kr  │  portal...     │
│  moel.go.kr (제·개정)  │  moel.go.kr (입법예고)       │
└─────────────────────────────────────────────────────┘
```

## 4. 데이터 소스 상세

### 4.1 안전보건공단 (KOSHA)

| 항목 | 상세 |
|------|------|
| **사이트 유형** | Vue SPA + tboard 게시판 |
| **수집 방식** | tboard API 직접 호출 (process.do) |
| **요청 형식** | `application/x-www-form-urlencoded`, `_JSON=<이중 URL 인코딩 JSON>` |
| **필수 헤더** | `chnlid: kosha24` |
| **응답 데이터** | `bbsPstGrid[]` → `pstNm`(제목), `regYmd`(날짜) |
| **정렬** | `regYmd` 내림차순 (최신순) |
| **링크** | 목록 페이지 (SPA 딥링크 불가) |

### 4.2 산업안전보건연구원 (OSHRI)

| 항목 | 상세 |
|------|------|
| **사이트 유형** | 서버 렌더링 HTML |
| **수집 방식** | Cheerio HTML 파싱 |
| **대상 셀렉터** | `table tbody tr > td` |
| **필드 매핑** | td[1]=제목, td[3]=날짜, a.href=링크 |
| **링크** | 개별 상세 페이지 (`?mode=view&articleNo=...`) |

### 4.3 산업안전포털 (PORTAL)

| 항목 | 상세 |
|------|------|
| **사이트 유형** | Vue SPA |
| **수집 방식** | JSON API 호출 (selectList) |
| **필터 조건** | `techGdlnCtgryCd: "E"` (보건위생분야), 시행 중 규정만 |
| **응답 데이터** | `payload.list[]` → `techGdlnNm`, `techGdlnOfancYmd`, `techGdlnNo` |
| **링크** | 개별 상세 페이지 (`/history?techGdlnNo=...`) |

### 4.4 고용노동부 - 제·개정 법령 (MOEL Revision)

| 항목 | 상세 |
|------|------|
| **사이트 유형** | 서버 렌더링 HTML |
| **수집 방식** | Cheerio HTML 파싱 |
| **대상 셀렉터** | `table tbody tr > td` |
| **필드 매핑** | td[1]=제목, td[2]=소관부서, td[3]=날짜, a.href=링크 |
| **중요 표시** | 키워드 매칭 → `isImportant: true` |
| **링크** | 개별 상세 페이지 (`view.do?bbs_seq=...`) |

### 4.5 고용노동부 - 입법·행정예고 (MOEL Lawmaking)

| 항목 | 상세 |
|------|------|
| **사이트 유형** | 서버 렌더링 HTML |
| **수집 방식** | Cheerio HTML 파싱 |
| **구조** | 제·개정 법령 스크래퍼와 동일 구조 |
| **중요 표시** | 동일 키워드 목록 사용 |
| **링크** | 개별 상세 페이지 (`view.do?bbs_seq=...`) |

## 5. 데이터 모델

### Notice (공지 항목)
```typescript
interface Notice {
  id: string;            // 고유 식별자 (예: "kosha-20260428151246QG58FZ")
  title: string;         // 공지 제목
  date: string;          // 게시 날짜 (YYYY-MM-DD)
  url: string;           // 원문 링크
  isNew?: boolean;       // 최근 7일 이내 게시 여부
  isImportant?: boolean; // 중요 키워드 포함 여부
}
```

### NoticeResponse (API 응답)
```typescript
interface NoticeResponse {
  success: boolean;      // 성공 여부
  data: Notice[];        // 공지 목록 (최대 5건)
  source: string;        // 소스 키 (kosha, oshri, ...)
  fetchedAt: string;     // 수집 시각 (ISO 8601)
  error?: string;        // 에러 메시지
}
```

## 6. 기능 명세

### F-01. 공지 수집 및 표시
- 각 소스별 최신 5건을 API Route에서 서버 사이드로 수집
- `force-dynamic` 설정으로 매 요청마다 최신 데이터 반환
- 15초 타임아웃 적용 (AbortController)
- 실패 시 에러 메시지 + 재시도 버튼 표시

### F-02. 자동 갱신
- 10분(600,000ms) 간격으로 모든 카드 자동 갱신
- `setInterval` 기반, 컴포넌트 언마운트 시 정리

### F-03. 수동 새로고침
- 각 카드 헤더의 새로고침 버튼 클릭으로 즉시 갱신
- 갱신 중 스피너 애니메이션 표시
- 중복 요청 방지 (disabled 상태)

### F-04. NEW 뱃지 (신규 게시글)
- 서버: 게시 날짜가 현재로부터 7일 이내이면 `isNew: true` 반환
- 클라이언트: `localStorage`에서 읽음 ID 목록 확인
- 읽지 않은 NEW 게시글에만 파란색 NEW 뱃지 표시
- 카드 헤더에 읽지 않은 NEW 건수 뱃지 표시

### F-05. 읽음 처리
- 공지 링크 클릭 시 해당 ID를 `localStorage`에 저장
- 저장 키: `notice-read-ids`
- 최대 500건 저장 (초과 시 오래된 항목 자동 삭제)
- 읽은 게시글: NEW 뱃지 제거 + 투명도 60% 처리

### F-06. 중요 표시
- 고용노동부 게시판(제·개정, 입법예고)에 적용
- 제목에 중요 키워드 포함 시 주황색 "중요" 뱃지 표시
- 대상 키워드 10개: 특수건강진단, 작업환경측정, 산업안전보건법, 산업안전보건, 유해인자, 화학물질, 허용기준, 노출기준, 건강진단, 보건규칙

### F-07. 외부 링크 이동
- 모든 공지 항목 클릭 시 새 탭(`target="_blank"`)으로 원문 열림
- KOSHA: 목록 페이지 (SPA 딥링크 불가)
- OSHRI: 개별 상세 페이지
- PORTAL: 개별 상세 페이지 (`?techGdlnNo=...`)
- MOEL: 개별 상세 페이지 (`view.do?bbs_seq=...`)

### F-08. 실시간 시계
- 헤더 우측에 현재 시각 표시 (초 단위 업데이트)
- 한국어 로케일 포맷: `YYYY. MM. DD. (요일) 오전/오후 HH:MM:SS`

### F-09. 모니터링 상태 표시
- 헤더에 초록색 펄스 애니메이션 "실시간 모니터링" 상태 표시
- 서브 헤더에 모니터링 소스 수, 갱신 주기, 표시 건수 요약

## 7. UI/UX 설계

### 7.1 디자인 컨셉
- **스타일:** 모던 기업용 Admin 대시보드
- **테마:** 다크 모드 고정 (배경 `#0b1120`)
- **폰트:** Geist Sans / Geist Mono (Google Fonts)
- **레이아웃:** 반응형 그리드 (1열/2열/3열)

### 7.2 카드 색상 체계

| 소스 | 액센트 바 | 텍스트 |
|------|----------|--------|
| KOSHA | `bg-blue-500` | `text-blue-400` |
| OSHRI | `bg-violet-500` | `text-violet-400` |
| PORTAL | `bg-teal-500` | `text-teal-400` |
| 제·개정 | `bg-orange-500` | `text-orange-400` |
| 입법예고 | `bg-rose-500` | `text-rose-400` |

### 7.3 뱃지 시스템

| 뱃지 | 색상 | 조건 |
|------|------|------|
| **NEW** | 파란색 (`blue-500/20`, 보더 `blue-500/30`) | 7일 이내 + 미열람 |
| **중요** | 주황색 (`amber-500/20`, 보더 `amber-500/30`) | 키워드 매칭 |
| **카운트** | 파란색 (`bg-blue-500`) | 카드당 미읽은 NEW 수 |

### 7.4 반응형 브레이크포인트

| 화면 | 그리드 |
|------|--------|
| 모바일 (<768px) | 1열 |
| 태블릿 (768px~1279px) | 2열 |
| 데스크톱 (1280px+) | 3열 |

## 8. 파일 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 대시보드 페이지
│   ├── layout.tsx            # 루트 레이아웃 (메타데이터, 폰트)
│   ├── globals.css           # 전역 스타일 (Tailwind, 커스텀)
│   └── api/
│       ├── kosha/route.ts    # KOSHA API 엔드포인트
│       ├── oshri/route.ts    # OSHRI API 엔드포인트
│       ├── portal/route.ts   # Portal API 엔드포인트
│       ├── moel-revision/route.ts   # 제·개정 API 엔드포인트
│       └── moel-lawmaking/route.ts  # 입법예고 API 엔드포인트
├── components/
│   ├── Header.tsx            # 상단 헤더 (로고, 시계, 상태)
│   ├── NoticeCard.tsx        # 공지 카드 (데이터 페칭, 읽음 처리)
│   └── ThemeProvider.tsx     # 테마 컨텍스트 (미사용)
└── lib/
    ├── types.ts              # TypeScript 인터페이스
    ├── sources.ts            # 데이터 소스 설정
    └── scrapers/
        ├── kosha.ts          # KOSHA 스크래퍼
        ├── oshri.ts          # OSHRI 스크래퍼
        ├── portal.ts         # Portal 스크래퍼
        ├── moel-revision.ts  # 제·개정 스크래퍼
        └── moel-lawmaking.ts # 입법예고 스크래퍼
```

## 9. 에러 처리

| 상황 | 처리 |
|------|------|
| 외부 사이트 응답 지연 | 15초 타임아웃 후 에러 반환 |
| 네트워크 오류 | "네트워크 오류가 발생했습니다" + 재시도 버튼 |
| 데이터 파싱 실패 | "데이터를 불러올 수 없습니다" + 에러 메시지 |
| KOSHA API 실패 | 안내 링크 폴백 제공 |
| 빈 결과 | "등록된 공지가 없습니다" 표시 |

## 10. 현재 알려진 한계

1. **KOSHA 딥링크 불가** — SPA 구조로 개별 게시글 URL 생성 불가, 목록 페이지로만 이동
2. **서버 사이드 캐싱 없음** — 매 요청마다 외부 사이트 호출 (`force-dynamic`)
3. **인증 불필요 데이터만 수집** — 로그인 필요 콘텐츠는 대상 외
4. **ThemeProvider 미사용** — 다크 모드 고정 운영 중, 라이트 모드 전환 UI 제거됨
