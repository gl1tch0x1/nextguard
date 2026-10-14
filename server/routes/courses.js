import { Router } from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const isStaff = ['administrator', 'instructor'].includes(req.user?.role);
    const includeDrafts = req.query.includeDrafts === 'true' && isStaff;
    const filter = includeDrafts ? {} : { published: true };

    const records = await Course.find(filter)
      .select('-lessons')
      .sort({ title: 1 })
      .lean();
    res.json({ courses: records, source: 'database' });
  } catch (e) {
    next(e);
  }
});

router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const isStaff = ['administrator', 'instructor'].includes(req.user?.role);
    let query = isStaff ? { slug } : { slug, published: true };
    if (mongoose.isValidObjectId(slug)) {
      query = isStaff ? { $or: [{ slug }, { _id: slug }] } : { $or: [{ slug }, { _id: slug }], published: true };
    }
    const course = await Course.findOne(query)
      .populate('instructor', 'name email')
      .lean();
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    res.json({ course });
  } catch (e) {
    next(e);
  }
});

export default router;
