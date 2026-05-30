export type CellRect = { sx: number; sy: number; sw: number; sh: number };

const COMPOSITE_CARD_LAYOUT = {
  leftColumnX: 0.047,
  rightColumnX: 0.512,
  cardWidth: 0.441,
  rowY: [0.155, 0.43, 0.704],
  cardHeight: 0.205,
} as const;

function clampRect(rect: CellRect, width: number, height: number): CellRect {
  const sx = Math.max(0, Math.min(width - 1, rect.sx));
  const sy = Math.max(0, Math.min(height - 1, rect.sy));
  const sw = Math.max(1, Math.min(width - sx, rect.sw));
  const sh = Math.max(1, Math.min(height - sy, rect.sh));
  return { sx, sy, sw, sh };
}

function roundedRect(rect: { sx: number; sy: number; sw: number; sh: number }, width: number, height: number): CellRect {
  return clampRect(
    {
      sx: Math.round(rect.sx),
      sy: Math.round(rect.sy),
      sw: Math.round(rect.sw),
      sh: Math.round(rect.sh),
    },
    width,
    height,
  );
}

export function cellRect(width: number, height: number, index: number): CellRect {
  if (!Number.isInteger(index) || index < 0 || index > 5) {
    throw new RangeError("index must be 0..5");
  }
  const sw = Math.floor(width / 2);
  const sh = Math.floor(height / 3);
  const column = index % 2;
  const row = Math.floor(index / 2);
  return { sx: column * sw, sy: row * sh, sw, sh };
}

export function selectedCardRect(width: number, height: number, index: number): CellRect {
  if (!Number.isInteger(index) || index < 0 || index > 5) {
    throw new RangeError("index must be 0..5");
  }

  const isPortraitComposite = height / width > 1.2;
  if (!isPortraitComposite) return cellRect(width, height, index);

  const column = index % 2;
  const row = Math.floor(index / 2);
  return roundedRect(
    {
      sx: width * (column === 0 ? COMPOSITE_CARD_LAYOUT.leftColumnX : COMPOSITE_CARD_LAYOUT.rightColumnX),
      sy: height * COMPOSITE_CARD_LAYOUT.rowY[row],
      sw: width * COMPOSITE_CARD_LAYOUT.cardWidth,
      sh: height * COMPOSITE_CARD_LAYOUT.cardHeight,
    },
    width,
    height,
  );
}

export function legacyCellCardRect(width: number, height: number, index: number): CellRect {
  const compositeRect = selectedCardRect(width * 2, height * 3, index);
  const gridRect = cellRect(width * 2, height * 3, index);
  return clampRect(
    {
      sx: compositeRect.sx - gridRect.sx,
      sy: compositeRect.sy - gridRect.sy,
      sw: compositeRect.sw,
      sh: compositeRect.sh,
    },
    width,
    height,
  );
}

export async function cropCell(image: HTMLImageElement, index: number, type = "image/png"): Promise<Blob> {
  const rect = selectedCardRect(image.naturalWidth || image.width, image.naturalHeight || image.height, index);
  const canvas = document.createElement("canvas");
  canvas.width = rect.sw;
  canvas.height = rect.sh;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable");
  context.drawImage(image, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, rect.sw, rect.sh);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Failed to crop concept image"))), type);
  });
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}
