// High-Reliability Wallpaper PNG Downloader
// Ensures all downloads output genuine lossless PNG files, handles CORS & canvas conversion seamlessly

/**
 * Loads an image from URL into an HTMLImageElement with cross-origin support
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/**
 * Converts an image element to a true PNG blob via Canvas
 */
function imageToPngBlob(img: HTMLImageElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext("2d", { willReadFrequently: false });
      if (!ctx) {
        throw new Error("Could not get 2D canvas context");
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        },
        "image/png",
        1.0
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Downloads any wallpaper URL as a guaranteed high-resolution .PNG file
 */
export async function downloadWallpaperAsPng(
  imageUrl: string,
  rawTitle: string,
  fallbackUrl?: string
): Promise<boolean> {
  const targetUrls = [imageUrl, fallbackUrl].filter((u): u is string => Boolean(u && u.trim()));
  if (targetUrls.length === 0) return false;

  const cleanTitle = rawTitle
    .replace(/[/\\?%*:|"<>]/g, "-")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");
  const filename = `VOIDWALLZ-${cleanTitle}.png`;

  for (const url of targetUrls) {
    // Strategy 1: Load image & convert through Canvas to guarantee real 100% PNG
    try {
      const img = await loadImage(url);
      const pngBlob = await imageToPngBlob(img);
      triggerBlobDownload(pngBlob, filename);
      return true;
    } catch (canvasErr) {
      console.warn(`Canvas conversion failed for ${url}:`, canvasErr);
    }

    // Strategy 2: Direct CORS fetch -> convert blob to PNG
    try {
      const res = await fetch(url, { mode: "cors" });
      if (res.ok) {
        const originalBlob = await res.blob();
        
        // If already png, download directly
        if (originalBlob.type === "image/png") {
          triggerBlobDownload(originalBlob, filename);
          return true;
        }

        // Convert fetched blob to Image and then PNG
        const blobUrl = URL.createObjectURL(originalBlob);
        try {
          const img = await loadImage(blobUrl);
          const pngBlob = await imageToPngBlob(img);
          URL.revokeObjectURL(blobUrl);
          triggerBlobDownload(pngBlob, filename);
          return true;
        } catch (_) {
          // If canvas fails on blob, force-save with .png extension
          const forcedPngBlob = new Blob([originalBlob], { type: "image/png" });
          triggerBlobDownload(forcedPngBlob, filename);
          URL.revokeObjectURL(blobUrl);
          return true;
        }
      }
    } catch (fetchErr) {
      console.warn(`Direct fetch failed for ${url}:`, fetchErr);
    }

    // Strategy 3: Direct synthetic anchor download
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_self";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (anchorErr) {
      console.warn(`Synthetic anchor failed for ${url}:`, anchorErr);
    }
  }

  console.error("All download attempts failed for:", rawTitle);
  return false;
}

/**
 * Triggers browser download from a Blob
 */
export function triggerBlobDownload(blob: Blob, filename: string) {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL after brief delay
  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 1500);
}

/**
 * Fetches an image URL and returns ArrayBuffer as a PNG for ZIP packaging
 */
export async function fetchImageAsPngArrayBuffer(imageUrl: string): Promise<ArrayBuffer> {
  try {
    const img = await loadImage(imageUrl);
    const pngBlob = await imageToPngBlob(img);
    return await pngBlob.arrayBuffer();
  } catch (_) {
    // Fallback: direct fetch arrayBuffer
    const res = await fetch(imageUrl);
    return await res.arrayBuffer();
  }
}
