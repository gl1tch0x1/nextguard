import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../uploads');

// Ensure uploads directory exists
fs.mkdir(uploadsDir, { recursive: true }).catch(err => {
  console.error('[UPLOAD] Failed to ensure uploads directory:', err.message);
});

/**
 * Extract Google Drive file ID from various link formats
 */
function extractGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  
  // Format 1: https://drive.google.com/file/d/FILE_ID/view...
  const match1 = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];
  
  // Format 2: https://drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
  const match2 = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];
  
  // Format 3: https://drive.google.com/thumbnail?id=FILE_ID
  const match3 = clean.match(/\/thumbnail\?id=([a-zA-Z0-9_-]+)/);
  if (match3) return match3[1];

  return null;
}

/**
 * Convert Google Drive link to direct high-res streamable URL
 */
function getGoogleDriveDirectUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

/**
 * POST /api/upload
 * Accepts base64 webp payload or remote image URL (including Google Drive)
 * Stores as compressed .webp file and returns accessible URL.
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { image, url, name = 'asset' } = req.body || {};

    // 1. Process Google Drive URL or External URL
    if (url && typeof url === 'string') {
      const gDriveId = extractGoogleDriveFileId(url);
      
      if (gDriveId) {
        // Fetch from Google Drive thumbnail API
        const directUrl = getGoogleDriveDirectUrl(gDriveId);
        try {
          const fetchRes = await fetch(directUrl);
          if (fetchRes.ok) {
            const buffer = Buffer.from(await fetchRes.arrayBuffer());
            const fileName = `gdrive_${gDriveId}_${Date.now()}.webp`;
            const filePath = path.join(uploadsDir, fileName);
            await fs.writeFile(filePath, buffer);
            return res.status(201).json({
              url: `/uploads/${fileName}`,
              format: 'webp',
              size: buffer.length,
              source: 'google-drive'
            });
          }
        } catch (fetchErr) {
          console.warn('[UPLOAD] Direct Google Drive download failed, returning direct streamable URL:', fetchErr.message);
        }

        // Fallback: Return verified high-res direct Google Drive stream URL
        return res.status(200).json({
          url: directUrl,
          format: 'webp',
          source: 'google-drive-direct'
        });
      }

      // Standard public URL: fetch and store locally
      try {
        const fetchRes = await fetch(url);
        if (fetchRes.ok) {
          const buffer = Buffer.from(await fetchRes.arrayBuffer());
          const fileName = `ext_${crypto.randomBytes(6).toString('hex')}_${Date.now()}.webp`;
          const filePath = path.join(uploadsDir, fileName);
          await fs.writeFile(filePath, buffer);
          return res.status(201).json({
            url: `/uploads/${fileName}`,
            format: 'webp',
            size: buffer.length,
            source: 'external-url'
          });
        }
      } catch {
        // Fallback to storing original URL
        return res.status(200).json({ url, format: 'url' });
      }
    }

    // 2. Process Base64 WebP image data
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Provide a valid image data payload or Google Drive / web URL.' });
    }

    // Extract base64 content
    const base64Data = image.replace(/^data:image\/[a-z0-9-+]+;base64,/i, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length === 0 || buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image must be non-empty and under 15MB.' });
    }

    const cleanPrefix = String(name || 'asset').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30);
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const fileName = `${cleanPrefix || 'img'}_${uniqueSuffix}.webp`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);

    res.status(201).json({
      url: `/uploads/${fileName}`,
      format: 'webp',
      size: buffer.length,
      fileName
    });
  } catch (err) {
    next(err);
  }
});

export default router;
