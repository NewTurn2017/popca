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
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-3 shadow-2xl" data-testid="concept-board">
      <div className="relative overflow-hidden rounded-[1.5rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt="6종 디지털 명함 콘셉트 보드" className="block w-full" />
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-2 p-4">
          {POPCA_STYLES.map((style, index) => (
            <button
              key={style.styleName}
              type="button"
              aria-label={`${index + 1}번 ${style.styleName} 선택`}
              onClick={() => onSelect(index)}
              className={`group relative rounded-2xl border-2 transition ${selectedIndex === index ? "border-cyan-200 bg-cyan-200/18" : "border-white/30 bg-black/5 hover:border-cyan-200/80 hover:bg-cyan-200/10"}`}
            >
              <span className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-slate-950/85 text-lg font-black text-white ring-1 ring-white/20 group-hover:scale-105">
                {index + 1}
              </span>
              <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{style.short}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-slate-400">키보드 1~6 또는 클릭으로 마음에 드는 칸을 고르세요.</p>
    </div>
  );
}
