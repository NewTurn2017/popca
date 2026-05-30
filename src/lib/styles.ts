export type PopcaStyle = { styleName: string; accent: string; short: string };

export const POPCA_STYLES: PopcaStyle[] = [
  { styleName: "Arctic Glass", accent: "#5ac8ff", short: "서리빛 글래스" },
  { styleName: "Holographic Prism", accent: "#c47dff", short: "홀로 프리즘" },
  { styleName: "Neural Tech", accent: "#5cffc2", short: "뉴럴 테크" },
  { styleName: "Organic Aurora", accent: "#ff9d60", short: "오로라 유기체" },
  { styleName: "Editorial Mono", accent: "#f0f0f5", short: "에디토리얼 모노" },
  { styleName: "Liquid Metal", accent: "#b8b8ff", short: "리퀴드 메탈" },
] as const;

export const STYLE_NAMES = POPCA_STYLES.map((style) => style.styleName);

export function styleFor(index: number): PopcaStyle {
  if (!Number.isInteger(index) || index < 0 || index >= POPCA_STYLES.length) {
    throw new RangeError("cellIndex must be an integer from 0 to 5");
  }
  return POPCA_STYLES[index];
}
