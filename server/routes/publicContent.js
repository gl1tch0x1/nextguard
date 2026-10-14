import { Router } from 'express';
import mongoose from 'mongoose';
import Service from '../models/Service.js';
import Research from '../models/Research.js';

const router = Router();

router.get('/services', async (_req, res, next) => {
  try {
    const services = await Service.find({ published: true })
      .sort({ number: 1, title: 1 })
      .lean();
    res.json({ services });
  } catch (e) {
    next(e);
  }
});

router.get('/services/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    let query = { slug, published: true };
    if (mongoose.isValidObjectId(slug)) {
      query = { $or: [{ slug }, { _id: slug }], published: true };
    }
    const service = await Service.findOne(query).lean();
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    res.json({ service });
  } catch (e) {
    next(e);
  }
});

router.get('/research', async (_req, res, next) => {
  try {
    const research = await Research.find({ status: 'published' })
      .select('title slug category summary tags keyFindings readTimeMinutes url authorName authorRole publishedAt')
      .sort({ publishedAt: -1 })
      .limit(100)
      .lean();
    res.json({ research });
  } catch (e) {
    next(e);
  }
});

export default router;

