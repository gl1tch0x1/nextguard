import { Router } from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth);
router.get('/my-courses', async (req, res, next) => {
  try { const enrollments = await Enrollment.find({ user: req.user.id }).populate({ path: 'course', match: { published: true } }).lean();
    res.json({ enrollments: enrollments.filter(e => e.course).map(e => ({ ...e, progress: e.course.lessons?.length ? Math.round(e.completedLessons.length / e.course.lessons.length * 100) : 0 })) });
  } catch (e) { next(e); }
});
router.post('/enroll/:courseId', async (req, res, next) => {
  try { if (!mongoose.isValidObjectId(req.params.courseId)) return res.status(400).json({ error: 'Invalid course.' });
    const course = await Course.findOne({ _id: req.params.courseId, published: true }); if (!course) return res.status(404).json({ error: 'Course not found.' });
    const enrollment = await Enrollment.findOneAndUpdate({ user: req.user.id, course: course.id }, { $setOnInsert: { user: req.user.id, course: course.id } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json({ enrollment });
  } catch (e) { if (e.code === 11000) return res.status(409).json({ error: 'Already enrolled.' }); next(e); }
});
router.get('/courses/:courseId', async (req, res, next) => {
  try { if (!mongoose.isValidObjectId(req.params.courseId)) return res.status(400).json({ error: 'Invalid course.' });
    const course = await Course.findOne({ _id: req.params.courseId, published: true }).lean(); if (!course) return res.status(404).json({ error: 'Course not found.' });
    const enrollment = await Enrollment.findOne({ user: req.user.id, course: course._id }).lean();
    if (!enrollment && !['instructor', 'administrator'].includes(req.user.role)) return res.status(403).json({ error: 'Enroll in this course to view its lessons.' });
    const lessons = (course.lessons || []).map(l => ({ ...l, quiz: (l.quiz || []).map(q => ({ _id: q._id, question: q.question, options: q.options })) }));
    res.json({ course: { ...course, lessons }, enrollment });
  } catch (e) { next(e); }
});
router.post('/courses/:courseId/lessons/:lessonId/complete', async (req, res, next) => {
  try { const { courseId, lessonId } = req.params; if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(lessonId)) return res.status(400).json({ error: 'Invalid course or lesson.' });
    const course = await Course.findOne({ _id: courseId, published: true }); if (!course) return res.status(404).json({ error: 'Course not found.' });
    const lesson = course.lessons.id(lessonId); if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
    const enrollment = await Enrollment.findOne({ user: req.user.id, course: courseId }); if (!enrollment) return res.status(403).json({ error: 'Enroll before tracking progress.' });
    if (!enrollment.completedLessons.some(id => id.equals(lesson._id))) enrollment.completedLessons.push(lesson._id);
    if (enrollment.completedLessons.length >= course.lessons.length) enrollment.completedAt = new Date();
    await enrollment.save(); res.json({ enrollment, progress: Math.round(enrollment.completedLessons.length / Math.max(1, course.lessons.length) * 100) });
  } catch (e) { next(e); }
});
router.post('/courses/:courseId/lessons/:lessonId/quiz', async (req, res, next) => {
  try { const { courseId, lessonId } = req.params; if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(lessonId)) return res.status(400).json({ error: 'Invalid course or lesson.' });
    const course = await Course.findOne({ _id: courseId, published: true }); const enrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });
    if (!course || !enrollment) return res.status(403).json({ error: 'A valid course enrollment is required.' });
    const lesson = course.lessons.id(lessonId); if (!lesson || !lesson.quiz?.length) return res.status(404).json({ error: 'Quiz not found.' });
    const answers = req.body?.answers; if (!Array.isArray(answers) || answers.length !== lesson.quiz.length || answers.some(a => !Number.isInteger(a) || a < 0 || a > 10)) return res.status(400).json({ error: 'Submit one selected option per question.' });
    const score = lesson.quiz.reduce((n, q, i) => n + (q.correctIndex === answers[i] ? 1 : 0), 0);
    enrollment.quizAttempts.push({ lessonId: lesson._id, score, total: lesson.quiz.length, submittedAt: new Date() }); await enrollment.save();
    res.json({ score, total: lesson.quiz.length, percentage: Math.round(score / lesson.quiz.length * 100), passed: score / lesson.quiz.length >= 0.7, explanations: lesson.quiz.map((q, i) => ({ correctIndex: q.correctIndex, explanation: q.explanation, selected: answers[i] })) });
  } catch (e) { next(e); }
});
export default router;
