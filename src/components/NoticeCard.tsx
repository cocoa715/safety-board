"use client";

import { useCallback, useEffect, useState } from "react";
import { DataSource, Notice, NoticeResponse } from "@/lib/types";
import { REFRESH_INTERVAL_MS } from "@/lib/sources";

interface Props {
  source: DataSource;
}

const ACCENT: Record<string, string> = {
  kosha: "bg-blue-500",
  oshri: "bg-violet-500",
  portal: "bg-teal-500",
  "law-history": "bg-emerald-500",
  "moel-revision": "bg-orange-500",
  "moel-lawmaking": "bg-rose-500",
};

const ACCENT_TEXT: Record<string, string> = {
  kosha: "text-blue-400",
  oshri: "text-violet-400",
  portal: "text-teal-400",
  "law-history": "text-emerald-400",
  "moel-revision": "text-orange-400",
  "moel-lawmaking": "text-rose-400",
};

const READ_STORAGE_KEY = "notice-read-ids";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function markAsRead(id: string) {
  const ids = getReadIds();
  ids.add(id);
  // 최대 500개만 유지 (오래된 것 자동 정리)
  const arr = [...ids];
  if (arr.length > 500) arr.splice(0, arr.length - 500);
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(arr));
}

export default function NoticeCard({ source }: Props) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // localStorage에서 읽음 상태 로드
  useEffect(() => {
    setReadIds(getReadIds());
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(source.apiPath);
      const json: NoticeResponse = await res.json();
      if (json.success) {
        setNotices(json.data);
        setFetchedAt(json.fetchedAt);
      } else {
        setError(json.error || "데이터를 불러올 수 없습니다");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }, [source.apiPath]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleClick = (noticeId: string) => {
    markAsRead(noticeId);
    setReadIds(new Set(getReadIds()));
  };

  const formatTime = (iso: string) => {
    if (!iso) return "--:--";
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const accent = ACCENT[source.key] || "bg-blue-500";
  const accentText = ACCENT_TEXT[source.key] || "text-blue-400";

  // externalOnly 소스는 바로가기 카드로 표시
  if (source.externalOnly) {
    return (
      <div className="group flex flex-col rounded-2xl bg-[#111827] border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all duration-300">
        <div className={`h-[2px] ${accent}`} />
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${accent}/10`}>
              <span className={`text-xs font-bold ${accentText}`}>
                {source.shortName.slice(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white leading-tight">
                {source.subLabel}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{source.label}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 px-5 pb-2">
          <div className="py-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-500/10 mb-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              정부 사이트 보안정책으로<br />클라우드 서버 접속이 제한됩니다
            </p>
            <a
              href={source.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium ${accent} text-white hover:opacity-90 transition-opacity`}
            >
              {source.subLabel} 바로가기
              <span>&#8599;</span>
            </a>
          </div>
        </div>
        <div className="mt-auto px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-[10px] text-slate-600">외부 사이트 연결</span>
          <a
            href={source.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[10px] ${accentText} opacity-60 hover:opacity-100 transition-opacity`}
          >
            {source.linkText}<span className="ml-0.5">&#8599;</span>
          </a>
        </div>
      </div>
    );
  }

  // 읽지 않은 NEW 게시글 수
  const unreadNewCount = notices.filter(
    (n) => n.isNew && !readIds.has(n.id)
  ).length;

  return (
    <div className="group flex flex-col rounded-2xl bg-[#111827] border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all duration-300">
      {/* 카드 상단 액센트 바 */}
      <div className={`h-[2px] ${accent}`} />

      {/* 헤더 */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${accent}/10`}
          >
            <span className={`text-xs font-bold ${accentText}`}>
              {source.shortName.slice(0, 2)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white leading-tight">
                {source.subLabel}
              </h3>
              {unreadNewCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {unreadNewCount}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {source.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 tabular-nums">
            {notices.length}건
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center w-7 h-7 rounded-lg
              bg-white/[0.04] border border-white/[0.06]
              hover:bg-white/[0.08] hover:border-white/[0.1]
              transition-all disabled:opacity-30 cursor-pointer"
            title="새로고침"
          >
            <svg
              className={`w-3.5 h-3.5 text-slate-400 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 공지 목록 */}
      <div className="flex-1 px-5 pb-2">
        {loading && notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-xs text-slate-500">
              데이터를 불러오는 중...
            </span>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 mb-3">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-xs text-slate-400 mb-1">
              정부 사이트 보안정책으로<br />클라우드 서버 접속이 제한됩니다
            </p>
            <a
              href={source.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium ${accent} text-white hover:opacity-90 transition-opacity`}
            >
              {source.subLabel} 바로가기
              <span>&#8599;</span>
            </a>
          </div>
        ) : notices.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            등록된 공지가 없습니다
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {notices.map((notice, idx) => {
              const isRead = readIds.has(notice.id);
              const showNew = notice.isNew && !isRead;

              return (
                <li key={notice.id} className="py-3 first:pt-1">
                  <a
                    href={notice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClick(notice.id)}
                    className={`group/item flex items-start gap-3 rounded-lg -mx-2 px-2 py-1.5 hover:bg-white/[0.03] transition-colors ${
                      isRead ? "opacity-60" : ""
                    }`}
                  >
                    {/* 번호 */}
                    <span className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center rounded text-[10px] font-semibold text-slate-500 bg-white/[0.04]">
                      {idx + 1}
                    </span>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-200 leading-relaxed line-clamp-2 group-hover/item:text-white transition-colors">
                        {notice.isImportant && (
                          <span className="inline-flex items-center mr-1.5 px-1.5 py-[1px] text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                            중요
                          </span>
                        )}
                        {showNew && (
                          <span className="inline-flex items-center mr-1.5 px-1.5 py-[1px] text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                            NEW
                          </span>
                        )}
                        {notice.title}
                      </p>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        {notice.date}
                      </span>
                    </div>

                    {/* 외부 링크 아이콘 */}
                    <svg
                      className="flex-shrink-0 w-3.5 h-3.5 mt-1 text-slate-600 group-hover/item:text-slate-400 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 푸터 */}
      <div className="mt-auto px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
        <span className="text-[10px] text-slate-600">
          갱신 {formatTime(fetchedAt)}
        </span>
        <a
          href={source.siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-[10px] ${accentText} opacity-60 hover:opacity-100 transition-opacity`}
        >
          {source.linkText}
          <span className="ml-0.5">&#8599;</span>
        </a>
      </div>
    </div>
  );
}
