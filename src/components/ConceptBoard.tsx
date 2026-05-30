"use client";

import { useEffect } from "react";
import { POPCA_STYLES } from "@/lib/styles";

type Props = { imageSrc: string; selectedIndex: number | null; onSelect: (index: number) => void };

export function ConceptBoard({ imageSrc, selectedIndex, onSelect }: Props) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const parsed = Number(event.key);
      if (parsed >= 1 && parsed <= 6) onSelect(parsed - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSelect]);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-2 shadow-2xl sm:p-3" data-testid="concept-board">
      <div className="relative overflow-hidden rounded-[1.35rem] sm:rounded-[1.5rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt="6종 디지털 명함 콘셉트 보드" className="block h-auto w-full select-none" draggable={false} />
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-3" aria-label="생성된 6개 명함 중 선택">
          {POPCA_STYLES.map((style, index) => {
            const isSelected = selectedIndex === index;
            return (
              <button
                key={style.styleName}
                type="button"
                aria-label={`${index + 1}번 ${style.styleName} 선택`}
                aria-pressed={isSelected}
                onClick={() => onSelect(index)}
                className={`group relative min-h-0 min-w-0 rounded-[clamp(0.75rem,3vw,1.75rem)] outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  isSelected ? "bg-cyan-200/10 ring-2 ring-inset ring-cyan-200/90" : "hover:bg-cyan-200/8 hover:ring-1 hover:ring-inset hover:ring-cyan-200/55"
                }`}
              >
                <span
                  className={`absolute left-[7%] top-[7%] grid h-[clamp(2rem,8vw,3.75rem)] w-[clamp(2rem,8vw,3.75rem)] place-items-center rounded-full text-[clamp(1rem,3.7vw,1.9rem)] font-black shadow-xl ring-1 backdrop-blur-md transition group-hover:scale-105 ${
                    isSelected ? "bg-cyan-200 text-slate-950 ring-white/50" : "bg-slate-950/82 text-white ring-white/25"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="sr-only">{style.short}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300 sm:grid-cols-3 sm:text-xs" aria-hidden="true">
        {POPCA_STYLES.map((style, index) => (
          <div key={style.styleName} className={`rounded-2xl border px-3 py-2 ${selectedIndex === index ? "border-cyan-200/70 bg-cyan-200/10 text-cyan-50" : "border-white/10 bg-white/[.04]"}`}>
            <span className="font-black text-white">{index + 1}</span>
            <span className="ml-2 font-semibold">{style.short}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-slate-400">키보드 1~6 또는 이미지 위 번호 클릭으로 마음에 드는 칸을 고르세요.</p>
    </div>
  );
}
