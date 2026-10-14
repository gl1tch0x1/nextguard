import { Router } from 'express';
import mongoose from 'mongoose';
import Research from '../models/Research.js';
import { requireAuth, requireArticleWriter, canWriteArticles, optionalAuth } from '../middleware/auth.js';

const router = Router();

function cleanText(val, maxLen) {
  return String(val || '').trim().slice(0, maxLen);
}

function safeSlug(val) {
  return String(val || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 100);
}

/**
 * GET /api/research
 * Public: List published research papers.
 * If authenticated writer/admin with includeDrafts=true, return all papers (including drafts).
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const isStaff = Boolean(req.user && canWriteArticles(req.user));
    const includeDrafts = req.query.includeDrafts === 'true' && isStaff;

    const filter = includeDrafts ? {} : { status: 'published' };
    const research = await Research.find(filter)
      .select('title slug category summary tags keyFindings readTimeMinutes url status bannerImage pocImages authorName authorRole publishedAt createdAt')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ research });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/research/:slug
 * Public: Get full technical paper by slug (or ID).
 */
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const isStaff = Boolean(req.user && canWriteArticles(req.user));
    let query = isStaff ? { slug } : { slug, status: 'published' };

    if (mongoose.isValidObjectId(slug)) {
      query = isStaff ? { $or: [{ slug }, { _id: slug }] } : { $or: [{ slug }, { _id: slug }], status: 'published' };
    }

    const paper = await Research.findOne(query).populate('author', 'name role').lean();
    if (!paper) {
      return res.status(404).json({ error: 'Research paper not found.' });
    }

    if (paper.status !== 'published') {
      const isWriter = req.user ? canWriteArticles(req.user) : false;
      if (!isWriter) {
        return res.status(404).json({ error: 'Research paper is currently in draft review.' });
      }
    }

    res.json({ research: paper });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/research
 * Restricted: Administrator, Instructor, or Verified Writer
 */
router.post('/', requireAuth, requireArticleWriter, async (req, res, next) => {
  try {
    const b = req.body || {};
    const title = cleanText(b.title, 200);
    const slug = safeSlug(b.slug || title);
    const category = cleanText(b.category || 'CYBER RESEARCH', 60);
    const summary = cleanText(b.summary, 2500);
    const content = cleanText(b.content, 50000);
    const threatModel = cleanText(b.threatModel, 5000);
    const architecturePoC = cleanText(b.architecturePoC, 20000);
    const readTimeMinutes = Math.max(1, Math.min(120, Number(b.readTimeMinutes) || 8));
    const url = cleanText(b.url, 500);
    const status = b.status === 'published' ? 'published' : 'draft';

    if (title.length < 3) {
      return res.status(400).json({ error: 'Article title must be at least 3 characters.' });
    }
    if (!slug) {
      return res.status(400).json({ error: 'Valid URL slug is required.' });
    }
    if (summary.length < 10) {
      return res.status(400).json({ error: 'Executive summary / abstract must be at least 10 characters.' });
    }

    const tags = Array.isArray(b.tags)
      ? b.tags.slice(0, 12).map((t) => cleanText(t, 50)).filter(Boolean)
      : [];

    const keyFindings = Array.isArray(b.keyFindings)
      ? b.keyFindings.slice(0, 10).map((k) => cleanText(k, 500)).filter(Boolean)
      : [];

    const authorRole =
      req.user.role === 'administrator'
        ? 'Principal Security Architect'
        : req.user.role === 'instructor'
        ? 'Cybersecurity Research Instructor'
        : 'Verified Security Researcher';

    const bannerImage = cleanText(b.bannerImage, 2000);
    const pocImages = Array.isArray(b.pocImages)
      ? b.pocImages.slice(0, 20).map((img) => ({
          url: cleanText(img?.url, 2000),
          caption: cleanText(img?.caption, 500),
          title: cleanText(img?.title, 200)
        })).filter((img) => Boolean(img.url))
      : [];

    const paper = await Research.create({
      title,
      slug,
      category,
      summary,
      content,
      tags,
      keyFindings,
      architecturePoC,
      threatModel,
      readTimeMinutes,
      url,
      bannerImage,
      pocImages,
      status,
      author: req.user.id,
      authorName: req.user.name || 'NexGuard Contributor',
      authorRole,
      publishedAt: status === 'published' ? new Date() : undefined
    });

    res.status(201).json({ research: paper });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A research paper with that slug already exists.' });
    }
    next(err);
  }
});

/**
 * PATCH /api/research/:id
 * Restricted: Administrator, or the original author (Instructor/Writer)
 */
router.patch('/:id', requireAuth, requireArticleWriter, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid research paper identifier.' });
    }

    const paper = await Research.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Research paper not found.' });
    }

    // RBAC: Administrator, Demo accounts, or the original author can update
    if (req.user.role !== 'administrator' && !req.user.isDemo && String(paper.author) !== String(req.user.id)) {
      return res.status(403).json({ error: 'You are only authorized to edit articles you authored.' });
    }

    const b = req.body || {};
    const updates = {};

    if (typeof b.title === 'string') updates.title = cleanText(b.title, 200);
    if (typeof b.slug === 'string') updates.slug = safeSlug(b.slug);
    if (typeof b.category === 'string') updates.category = cleanText(b.category, 60);
    if (typeof b.summary === 'string') updates.summary = cleanText(b.summary, 2500);
    if (typeof b.content === 'string') updates.content = cleanText(b.content, 50000);
    if (typeof b.threatModel === 'string') updates.threatModel = cleanText(b.threatModel, 5000);
    if (typeof b.architecturePoC === 'string') updates.architecturePoC = cleanText(b.architecturePoC, 20000);
    if (typeof b.url === 'string') updates.url = cleanText(b.url, 500);
    if (Number.isFinite(Number(b.readTimeMinutes))) updates.readTimeMinutes = Math.max(1, Math.min(120, Number(b.readTimeMinutes)));

    if (Array.isArray(b.tags)) {
      updates.tags = b.tags.slice(0, 12).map((t) => cleanText(t, 50)).filter(Boolean);
    }
    if (Array.isArray(b.keyFindings)) {
      updates.keyFindings = b.keyFindings.slice(0, 10).map((k) => cleanText(k, 500)).filter(Boolean);
    }
    if (typeof b.bannerImage === 'string') {
      updates.bannerImage = cleanText(b.bannerImage, 2000);
    }
    if (Array.isArray(b.pocImages)) {
      updates.pocImages = b.pocImages.slice(0, 20).map((img) => ({
        url: cleanText(img?.url, 2000),
        caption: cleanText(img?.caption, 500),
        title: cleanText(img?.title, 200)
      })).filter((img) => Boolean(img.url));
    }

    if (['draft', 'published'].includes(b.status)) {
      updates.status = b.status;
      if (b.status === 'published' && !paper.publishedAt) {
        updates.publishedAt = new Date();
      } else if (b.status === 'draft') {
        updates.publishedAt = null;
      }
    }

    const updated = await Research.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ research: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A research paper with that slug already exists.' });
    }
    next(err);
  }
});

/**
 * DELETE /api/research/:id
 * Restricted: Administrator, or the original author
 */
router.delete('/:id', requireAuth, requireArticleWriter, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid research paper identifier.' });
    }

    const paper = await Research.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Research paper not found.' });
    }

    if (req.user.role !== 'administrator' && !req.user.isDemo && String(paper.author) !== String(req.user.id)) {
      return res.status(403).json({ error: 'You are only authorized to delete articles you authored.' });
    }

    await Research.findByIdAndDelete(req.params.id);
    res.json({ message: 'Research paper successfully removed.' });
  } catch (err) {
    next(err);
  }
});

export default router;
