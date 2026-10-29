/**
 * Cloudinary & Image Optimization Service for DineDesk
 * Provides automated client-side compression and server-backed Cloudinary uploads.
 * Zero mock data and zero Base64 fallbacks to guarantee database URL persistence.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetMaxMB?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

export interface CompressedImageResult {
  file: File;
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
}

export interface UploadOptions extends ImageCompressionOptions {
  folder?: string;
}

export interface CloudinaryUploadResponse {
  success: boolean;
  url: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  provider: "cloudinary";
  format?: string;
  error?: string;
}

/**
 * Format raw byte size into user-friendly human-readable string (KB / MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compresses an image using HTML5 Canvas in the browser to optimize upload speed.
 */
export async function compressImage(
  file: File | Blob,
  options: ImageCompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85,
    targetMaxMB = 0.6,
    mimeType = "image/webp",
  } = options;

  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      const fallbackUrl = file instanceof File ? URL.createObjectURL(file) : "";
      return resolve({
        file: file instanceof File ? file : new File([file], "image.webp", { type: "image/webp" }),
        blob: file,
        dataUrl: fallbackUrl,
        originalSize,
        compressedSize: originalSize,
        savingsPercent: 0,
        width: maxWidth,
        height: maxHeight,
      });
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to parse image data."));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Unable to obtain 2D canvas rendering context."));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const tryExport = (currentQuality: number) => {
          let outputType = mimeType;
          const testWebp = canvas.toDataURL("image/webp");
          if (!testWebp.startsWith("data:image/webp")) {
            outputType = "image/jpeg";
          }

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error("Canvas failed to create image blob."));
              }

              if (blob.size > targetMaxMB * 1024 * 1024 && currentQuality > 0.5) {
                return tryExport(currentQuality - 0.15);
              }

              const dataUrl = canvas.toDataURL(outputType, currentQuality);
              const compressedSize = blob.size;
              const savings = Math.max(
                0,
                Math.round(((originalSize - compressedSize) / originalSize) * 100)
              );

              const originalFileName = (file as File).name || "avatar";
              const extension = outputType === "image/webp" ? ".webp" : ".jpg";
              const cleanName = originalFileName.replace(/\.[^/.]+$/, "") + extension;

              const compressedFile = new File([blob], cleanName, {
                type: outputType,
                lastModified: Date.now(),
              });

              resolve({
                file: compressedFile,
                blob,
                dataUrl,
                originalSize,
                compressedSize,
                savingsPercent: savings,
                width,
                height,
              });
            },
            outputType,
            currentQuality
          );
        };

        tryExport(quality);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image to Cloudinary via the server-side /api/upload route.
 * Guarantees a persistent HTTPS Cloudinary asset URL.
 */
export async function uploadImageToCloudinary(
  file: File | Blob,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResponse> {
  const folder = options.folder || "dinedesk/avatars";

  // Step 1: Pre-compress image in browser canvas
  const compressed = await compressImage(file, {
    maxWidth: options.maxWidth || 800,
    maxHeight: options.maxHeight || 800,
    quality: options.quality || 0.85,
    targetMaxMB: options.targetMaxMB || 0.6,
  });

  // Step 2: Post to Next.js API route that uploads directly to Cloudinary
  try {
    const formData = new FormData();
    formData.append("file", compressed.file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(
        errorJson.error || errorJson.message || `Upload failed with status ${res.status}`
      );
    }

    const data = await res.json();

    // Prevent any Base64 strings from escaping into the database
    if (!data.success || !data.url || data.url.startsWith("data:")) {
      throw new Error(data.error || data.message || "Invalid Cloudinary URL returned from server.");
    }

    return {
      success: true,
      url: data.url,
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
      savingsPercent: compressed.savingsPercent,
      provider: "cloudinary",
      format: data.format || compressed.file.type,
    };
  } catch (err: any) {
    console.error("Cloudinary upload failed:", err);
    return {
      success: false,
      url: "",
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
      savingsPercent: 0,
      provider: "cloudinary",
      error: err?.message || "Failed to upload image to Cloudinary.",
    };
  }
}

/**
 * Generate an optimized Cloudinary delivery URL with automatic format and quality flags.
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  transformations: {
    width?: number;
    height?: number;
    crop?: "fill" | "scale" | "fit" | "thumb";
    quality?: "auto" | "good" | "eco";
  } = {}
): string {
  if (!url || typeof url !== "string") return url;

  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  const { width, height, crop = "fill", quality = "auto" } = transformations;
  const parts: string[] = ["f_auto", `q_${quality}`];

  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (crop) parts.push(`c_${crop}`);

  const transformString = parts.join(",");
  return url.replace("/upload/", `/upload/${transformString}/`);
}