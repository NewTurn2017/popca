export type CellRect = { sx: number; sy: number; sw: number; sh: number };

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

export async function cropCell(image: HTMLImageElement, index: number, type = "image/png"): Promise<Blob> {
  const rect = cellRect(image.naturalWidth || image.width, image.naturalHeight || image.height, index);
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
