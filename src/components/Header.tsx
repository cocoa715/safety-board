"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const update = () => {
      setNow(
        new Date().toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
      {/* 좌측: 로고 + 타이틀 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">
            안전보건 공지 현황판
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            안전보건공단 / 산업안전보건연구원 / 산업안전포털 / 고용노동부
          </p>
        </div>
      </div>

      {/* 우측: 상태 표시 */}
      <div className="hidden sm:flex items-center gap-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs text-emerald-400 font-medium">
            실시간 모니터링
          </span>
        </div>
        <div className="text-xs text-slate-500 font-mono tabular-nums">
          {now}
        </div>
      </div>
    </header>
  );
}
