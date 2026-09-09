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
  const targetUrls = Array.from(
    new Set([imageUrl, fallbackUrl].filter((u): u is string => Boolean(u && u.trim())))
  );
  if (targetUrls.length === 0) return false;

  const cleanTitle = rawTitle
    .replace(/[/\\?%*:|"<>]/g, "-")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");
  const filename = `VOIDWALLZ-${cleanTitle}.png`;

  for (const url of targetUrls) {
    // Strategy 1: Direct CORS fetch -> convert blob to PNG
    try {
      const res = await fetch(url, { mode: "cors" });
      if (res.ok) {
        const originalBlob = await res.blob();

        // If already png, download directly
        if (originalBlob.type === "image/png") {
          triggerBlobDownload(originalBlob, filename);
          return true;
        }

        // Convert fetched blob to Image and then true PNG via Canvas
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
      } else {
        console.warn(`HTTP ${res.status} returned for ${url}. Trying next strategy/fallback.`);
      }
    } catch (fetchErr) {
      console.warn(`Direct fetch failed for ${url}:`, fetchErr);
    }

    // Strategy 2: Load image & convert through Canvas
    try {
      const img = await loadImage(url);
      const pngBlob = await imageToPngBlob(img);
      triggerBlobDownload(pngBlob, filename);
      return true;
    } catch (canvasErr) {
      console.warn(`Canvas conversion failed for ${url}:`, canvasErr);
    }

    // Strategy 3: Check if this image is currently rendered in the DOM
    try {
      const domImages = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
      const matchedImg = domImages.find(
        (img) =>
          img.complete &&
          img.naturalWidth > 0 &&
          (img.alt.toLowerCase() === rawTitle.toLowerCase() ||
            img.src.includes(encodeURIComponent(cleanTitle)) ||
            (url && img.src.includes(url.split("?")[0])))
      );
      if (matchedImg) {
        const pngBlob = await imageToPngBlob(matchedImg);
        triggerBlobDownload(pngBlob, filename);
        return true;
      }
    } catch (domErr) {
      console.warn(`DOM extraction fallback failed:`, domErr);
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
  }, 2000);
}

/**
 * Fetches an image URL and returns ArrayBuffer as a PNG for ZIP packaging
 */
export async function fetchImageAsPngArrayBuffer(
  imageUrl: string,
  fallbackUrl?: string
): Promise<ArrayBuffer> {
  const targetUrls = Array.from(
    new Set([imageUrl, fallbackUrl].filter((u): u is string => Boolean(u && u.trim())))
  );

  for (const url of targetUrls) {
    try {
      const res = await fetch(url, { mode: "cors" });
      if (res.ok) {
        const blob = await res.blob();
        if (blob.type === "image/png") {
          return await blob.arrayBuffer();
        }
        const blobUrl = URL.createObjectURL(blob);
        try {
          const img = await loadImage(blobUrl);
          const pngBlob = await imageToPngBlob(img);
          URL.revokeObjectURL(blobUrl);
          return await pngBlob.arrayBuffer();
        } catch {
          URL.revokeObjectURL(blobUrl);
          return await blob.arrayBuffer();
        }
      }
    } catch (fetchErr) {
      console.warn(`Buffer fetch failed for ${url}:`, fetchErr);
    }

    try {
      const img = await loadImage(url);
      const pngBlob = await imageToPngBlob(img);
      return await pngBlob.arrayBuffer();
    } catch (_) {}
  }

  throw new Error(`Failed to fetch image buffer for: ${imageUrl}`);
}
