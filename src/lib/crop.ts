export interface DeviceSpec {
  name: string;
  width: number;
  height: number;
}

export const DEVICES: DeviceSpec[] = [
  { name: "MacBook Pro 14\"", width: 3024, height: 1964 },
  { name: "MacBook Pro 16\"", width: 3456, height: 2234 },
  { name: "iPhone 15 Pro", width: 1179, height: 2556 },
  { name: "iPhone 15 Pro Max", width: 1290, height: 2796 },
  { name: "iPad Pro 12.9\"", width: 2048, height: 2732 },
  { name: "Studio Display", width: 5120, height: 2880 },
  { name: "Ultrawide 21:9", width: 3440, height: 1440 },
  { name: "Standard 4K", width: 3840, height: 2160 },
];

export async function cropImageToDevice(
  imageUrl: string,
  device: DeviceSpec,
  fallbackUrl?: string
): Promise<Blob> {
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
      img.src = url;
    });
  };

  let img: HTMLImageElement;
  try {
    img = await loadImage(imageUrl);
  } catch (err) {
    if (fallbackUrl && fallbackUrl !== imageUrl) {
      try {
        img = await loadImage(fallbackUrl);
      } catch (fallbackErr) {
        throw new Error("Failed to load both primary and fallback wallpaper images for cropping");
      }
    } else {
      throw err;
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = device.width;
      canvas.height = device.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: false });

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Calculate crop (cover mode)
      const targetAspect = device.width / device.height;
      const imageAspect = img.width / img.height;
      let drawWidth: number;
      let drawHeight: number;
      let offsetX: number;
      let offsetY: number;

      if (imageAspect > targetAspect) {
        drawHeight = img.height;
        drawWidth = img.height * targetAspect;
        offsetX = (img.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = img.width;
        drawHeight = img.width / targetAspect;
        offsetX = 0;
        offsetY = (img.height - drawHeight) / 2;
      }

      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
        0,
        0,
        device.width,
        device.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas toBlob generation failed"));
          }
        },
        "image/png"
      );
    } catch (e) {
      reject(e);
    }
  });
}

