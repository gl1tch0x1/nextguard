import { Router } from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth, requireRole('instructor', 'administrator'));
router.get('/courses', async (req, res, next) => {
  try {
    const filter = (req.user.role === 'administrator' || req.user.isDemo) ? {} : { instructor: req.user.id };
    res.json({ courses: await Course.find(filter).sort({ updatedAt: -1 }).lean() });
  } catch (e) {
    next(e);
  }
});
router.patch('/courses/:id/lessons', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid course.' });
    if (!Array.isArray(req.body?.lessons) || req.body.lessons.length > 100) return res.status(400).json({ error: 'Lessons must be an array of up to 100 items.' });
    const filter = { _id: req.params.id };
    if (req.user.role !== 'administrator' && !req.user.isDemo) filter.instructor = req.user.id;
    const lessons = req.body.lessons.map((l, i) => ({
      title: String(l.title || '').trim().slice(0, 180),
      summary: String(l.summary || '').trim().slice(0, 600),
      content: String(l.content || '').trim().slice(0, 20000),
      order: Number.isFinite(Number(l.order)) ? Number(l.order) : i,
      durationMinutes: Math.max(1, Math.min(600, Number(l.durationMinutes) || 10)),
      quiz: Array.isArray(l.quiz) ? l.quiz.slice(0, 20).map(q => ({
        question: String(q.question || '').slice(0, 500),
        options: Array.isArray(q.options) ? q.options.slice(0, 8).map(x => String(x).slice(0, 240)) : [],
        correctIndex: Number(q.correctIndex) || 0,
        explanation: String(q.explanation || '').slice(0, 1000)
      })) : []
    }));
    if (lessons.some(l => l.title.length < 2)) return res.status(400).json({ error: 'Each lesson needs a title.' });
    const course = await Course.findOneAndUpdate(filter, { $set: { lessons } }, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ error: 'Course not found or not assigned to this instructor.' });
    res.json({ course });
  } catch (e) {
    next(e);
  }
});
// Course publication toggle for instructors & administrators
router.patch('/courses/:id/publish', requireRole('instructor', 'administrator'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid course.' });
    const filter = { _id: req.params.id };
    if (req.user.role !== 'administrator' && !req.user.isDemo) filter.instructor = req.user.id;
    const course = await Course.findOneAndUpdate(filter, { $set: { published: Boolean(req.body?.published) } }, { new: true });
    if (!course) return res.status(404).json({ error: 'Course not found or not assigned to this instructor.' });
    res.json({ course });
  } catch (e) { next(e); }
});
export default router;
