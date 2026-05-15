"use client";

import Header from "@/components/Header";
import NoticeCard from "@/components/NoticeCard";
import { DATA_SOURCES } from "@/lib/sources";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* 서브 헤더: 요약 통계 바 */}
      <div className="px-8 py-4 border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">모니터링 소스</span>
            <span className="font-semibold text-white tabular-nums">
              {DATA_SOURCES.length}
            </span>
          </div>
          <div className="w-px h-3 bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <span className="text-slate-500">갱신 주기</span>
            <span className="font-semibold text-white">10분</span>
          </div>
          <div className="w-px h-3 bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <span className="text-slate-500">표시 건수</span>
            <span className="font-semibold text-white">소스당 5건</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="inline-flex items-center px-1.5 py-[1px] text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
              중요
            </span>
            <span className="text-slate-500">
              특수건강진단 / 작업환경측정 관련
            </span>
          </div>
        </div>
      </div>

      {/* 메인 그리드 */}
      <main className="flex-1 px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {DATA_SOURCES.map((source) => (
            <NoticeCard key={source.key} source={source} />
          ))}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="px-8 py-4 border-t border-white/[0.04]">
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span>
            씨젠의료재단 산업보건분석팀
          </span>
          <span>
            데이터 출처 : 안전보건공단 / 산업안전보건연구원 / 산업안전포털 /
            고용노동부
          </span>
        </div>
      </footer>
    </div>
  );
}
