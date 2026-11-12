import { HttpError } from "./security";
export const MAX_REPORT_IMAGE = 2 * 1024 * 1024;
export const MAX_PACK_BYTES = 3 * 1024 * 1024;
export async function validateImage(file: File, maxBytes: number) {
  if (!file.size || file.size > maxBytes) throw new HttpError(413, "The image exceeds the upload limit.");
  const b = new Uint8Array(await file.arrayBuffer());
  const ascii = (start: number, end: number) => String.fromCharCode(...b.slice(start, end));
  let mime = ""; let ext = ""; let width = 0; let height = 0;
  if (b.length >= 45 && [137,80,78,71,13,10,26,10].every((v,i) => b[i] === v) && ascii(12,16) === "IHDR" && ascii(b.length - 8, b.length - 4) === "IEND") {
    const view = new DataView(b.buffer); width = view.getUint32(16); height = view.getUint32(20); mime = "image/png"; ext = "png";
  } else if (b.length > 16 && b[0] === 255 && b[1] === 216 && b[b.length-2] === 255 && b[b.length-1] === 217) {
    for (let i = 2; i + 9 < b.length;) {
      if (b[i] !== 255) break;
      while (b[i] === 255) i++;
      const marker = b[i++];
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      const length = b[i] * 256 + b[i+1];
      if (length < 2 || i + length > b.length) break;
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
        height = b[i+3] * 256 + b[i+4]; width = b[i+5] * 256 + b[i+6]; break;
      }
      i += length;
    }
    mime = "image/jpeg"; ext = "jpg";
  } else if (b.length >= 30 && ascii(0,4) === "RIFF" && ascii(8,12) === "WEBP" && new DataView(b.buffer).getUint32(4,true) + 8 === b.length) {
    const kind = ascii(12,16);
    if (kind === "VP8X") { width = 1 + b[24] + (b[25]<<8) + (b[26]<<16); height = 1 + b[27] + (b[28]<<8) + (b[29]<<16); }
    if (kind === "VP8L" && b[20] === 47) { width = 1 + b[21] + ((b[22]&63)<<8); height = 1 + (b[22]>>6) + (b[23]<<2) + ((b[24]&15)<<10); }
    if (kind === "VP8 " && b[23] === 157 && b[24] === 1 && b[25] === 42) { width = (b[26] + (b[27]<<8)) & 16383; height = (b[28] + (b[29]<<8)) & 16383; }
    mime = "image/webp"; ext = "webp";
  }
  if (!mime || file.type !== mime || width < 1 || height < 1 || width > 16384 || height > 16384 || width * height > 80_000_000) throw new HttpError(400, "Use a valid PNG, JPEG or WebP image within the supported dimensions.");
  return { mime, ext, width, height, bytes: b };
}
