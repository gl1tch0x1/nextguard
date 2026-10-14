/**
 * NexGuard Intelligent Image Optimization Engine
 * - Automatically converts any image (PNG, JPG, BMP, GIF, SVG) to high-efficiency .webp format
 * - Intelligently compresses and downscales oversized images (preserving crisp cybersecurity terminal text)
 * - Seamlessly extracts and normalizes Google Drive image URLs into high-speed WebP stream endpoints
 * - Posts to /api/upload to generate high-performance cached URL references
 */
import { postJson } from '../api/client.js';

export function parseGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();

  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const match1 = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) {
    return {
      fileId: match1[1],
      directUrl: `https://drive.google.com/thumbnail?id=${match1[1]}&sz=w1600`,
      embedUrl: `https://lh3.googleusercontent.com/d/${match1[1]}=w1600`
    };
  }

  // Pattern 2: https://drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
  const match2 = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) {
    return {
      fileId: match2[1],
      directUrl: `https://drive.google.com/thumbnail?id=${match2[1]}&sz=w1600`,
      embedUrl: `https://lh3.googleusercontent.com/d/${match2[1]}=w1600`
    };
  }

  return null;
}

/**
 * Automatically converts an image File or Blob to WebP format with hardware-accelerated Canvas.
 * @param {File|Blob} file
 * @param {Object} options - { maxWidth: 1920, maxHeight: 1200, quality: 0.82 }
 * @returns {Promise<{ dataUrl: string, blob: Blob, originalSize: number, webpSize: number, savingsPercent: number, width: number, height: number }>}
 */
export async function convertImageToWebp(file, options = {}) {
  const { maxWidth = 1920, maxHeight = 1200, quality = 0.82 } = options;
  const originalSize = file.size || 0;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image content. Verify image format.'));
      img.onload = () => {
        let { width, height } = img;

        // Maintain aspect ratio while bounding within max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Browser canvas 2D context unavailable.'));
        }

        // Draw with high image smoothing quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert directly to webp data URL
        const dataUrl = canvas.toDataURL('image/webp', quality);

        // Also convert to Blob for precise byte size telemetry
        canvas.toBlob(
          (blob) => {
            const webpSize = blob ? blob.size : Math.round((dataUrl.length * 3) / 4);
            const savingsPercent = originalSize > 0 ? Math.max(0, Math.round(((originalSize - webpSize) / originalSize) * 100)) : 0;

            resolve({
              dataUrl,
              blob,
              originalSize,
              webpSize,
              savingsPercent,
              width,
              height,
              format: 'webp'
            });
          },
          'image/webp',
          quality
        );
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * High-level helper: takes either a local File or Google Drive / web URL,
 * ensures WebP conversion & server storage, and returns standard URL.
 */
export async function processAndUploadImage({ file, url, name = 'asset' }) {
  // 1. Google Drive Link or Remote URL
  if (url && typeof url === 'string') {
    const trimmed = url.trim();
    const gDrive = parseGoogleDriveUrl(trimmed);

    // Call server to download / resolve as optimized WebP
    const res = await postJson('/upload', {
      url: gDrive ? gDrive.directUrl : trimmed,
      name
    });

    return {
      url: res.url || (gDrive ? gDrive.directUrl : trimmed),
      format: 'webp',
      source: gDrive ? 'google-drive' : 'remote-url',
      size: res.size || 0
    };
  }

  // 2. Local File -> Convert to WebP in browser -> Upload to Server
  if (file && (file instanceof File || file instanceof Blob)) {
    const webpResult = await convertImageToWebp(file, {
      maxWidth: 1920,
      maxHeight: 1200,
      quality: 0.82
    });

    const res = await postJson('/upload', {
      image: webpResult.dataUrl,
      name: name || file.name || 'asset'
    });

    return {
      url: res.url || webpResult.dataUrl,
      format: 'webp',
      source: 'local-file',
      size: webpResult.webpSize,
      originalSize: webpResult.originalSize,
      savingsPercent: webpResult.savingsPercent,
      width: webpResult.width,
      height: webpResult.height
    };
  }

  throw new Error('Provide a local image file or valid Google Drive link.');
}

/**
 * Format raw byte count into human-readable telemetry string
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
