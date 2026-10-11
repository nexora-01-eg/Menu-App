/**
 * Resizes an image file down to `maxWidth` (preserving aspect ratio)
 * and re-encodes it as JPEG at the given quality, entirely in the
 * browser via <canvas> — no extra npm dependency needed. Keeps
 * product photo uploads small without a server-side image pipeline.
 */
export async function compressImage(
  file: File,
  { maxWidth = 1200, quality = 0.82 }: { maxWidth?: number; quality?: number } = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed."))),
      "image/jpeg",
      quality,
    );
  });
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB pre-compression cap
