import { Router } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Inquiry from '../models/Inquiry.js';
import Lab from '../models/Lab.js';
import Research from '../models/Research.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getDemoUser, isDemoUserId, getAllDemoUsers } from '../lib/demoAccount.js';

const router = Router();
router.use(requireAuth, requireRole('administrator'));

const safeSlug = s => String(s || '').toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
const cleanText = (v, max = 1500) => typeof v === 'string' ? v.trim().slice(0, max) : '';

router.post('/change-password', async (req, res, next) => {
  try {
    if (isDemoUserId(req.user.id || req.user._id)) {
      return res.status(400).json({ error: 'The demo administrator credentials are configured via the .env file.' });
    }
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ error: 'Current password is required.' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ error: 'New password must be between 8 and 128 characters.' });
    }
    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user) return res.status(404).json({ error: 'Admin account not found.' });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect.' });
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ success: true, message: 'Admin password changed successfully.' });
  } catch (e) {
    next(e);
  }
});
router.get('/overview', async (_req, res, next) => {
  try {
    const [users, students, courses, publishedCourses, inquiries, openInquiries, research, publishedResearch, labs, publishedLabs] = await Promise.all([
      User.countDocuments(), User.countDocuments({ role: 'student' }), Course.countDocuments(), Course.countDocuments({ published: true }), Inquiry.countDocuments(), Inquiry.countDocuments({ status: { $ne: 'closed' } }), Research.countDocuments(), Research.countDocuments({ status: 'published' }), Lab.countDocuments(), Lab.countDocuments({ published: true })
    ]); res.json({ users: users + 1, students, courses, publishedCourses, inquiries, openInquiries, research, publishedResearch, labs, publishedLabs });
  } catch (e) { next(e); }
});



router.get('/bootstrap', async (_req, res, next) => {
  try {
    const [
      overview,
      users,
      courses,
      labs,
      services,
      research,
      inquiries
    ] = await Promise.all([
      Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        Course.countDocuments(),
        Course.countDocuments({ published: true }),
        Inquiry.countDocuments(),
        Inquiry.countDocuments({ status: { $ne: 'closed' } }),
        Research.countDocuments(),
        Research.countDocuments({ status: 'published' }),
        Lab.countDocuments(),
        Lab.countDocuments({ published: true })
      ]).then(([users, students, courses, publishedCourses, inquiries, openInquiries, research, publishedResearch, labs, publishedLabs]) => ({
        users, students, courses, publishedCourses, inquiries, openInquiries, research, publishedResearch, labs, publishedLabs
      })),
      User.find().select('name email role active createdAt').sort({ createdAt: -1 }).limit(500).lean(),
      Course.find().populate('instructor', 'name email').sort({ updatedAt: -1 }).lean(),
      Lab.find().sort({ createdAt: -1 }).lean(),
      Service.find().sort({ createdAt: -1 }).lean(),
      Research.find().populate('author', 'name').sort({ updatedAt: -1 }).lean(),
      Inquiry.find().sort({ createdAt: -1 }).limit(200).lean()
    ]);

    res.json({
      overview: { ...overview, users: overview.users + 3 },
      users: [...getAllDemoUsers(), ...users],
      courses,
      labs,
      services,
      research,
      inquiries
    });
  } catch (e) {
    next(e);
  }
});

router.get('/users', async (_req, res, next) => {
  try {
    const users = await User.find().select('name email role isVerifiedWriter active createdAt').sort({ createdAt: -1 }).limit(500).lean();
    res.json({ users: [...getAllDemoUsers(), ...users] });
  } catch (e) { next(e); }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    if (isDemoUserId(req.params.id)) return res.status(400).json({ error: 'Demo account settings are defined in the .env configuration.' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid user.' });
    if (req.params.id === req.user.id && (req.body?.active === false || req.body?.role !== undefined && req.body.role !== 'administrator')) return res.status(400).json({ error: 'You cannot deactivate or demote your own active administrator account.' });
    const update = {};
    if (['student', 'instructor', 'administrator', 'writer'].includes(req.body?.role)) update.role = req.body.role;
    else if (req.body?.role !== undefined) return res.status(400).json({ error: 'Invalid role.' });
    if (typeof req.body?.isVerifiedWriter === 'boolean') update.isVerifiedWriter = req.body.isVerifiedWriter;
    if (typeof req.body?.active === 'boolean') update.active = req.body.active;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('name email role isVerifiedWriter active');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (e) { next(e); }
});
router.get('/inquiries', async (_req, res, next) => { try { const inquiries = await Inquiry.find().select('name email company service message authorized status createdAt').sort({ createdAt: -1 }).limit(200).lean(); res.json({ inquiries }); } catch (e) { next(e); } });
router.patch('/inquiries/:id', async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid inquiry.' }); if (!['new', 'in_review', 'closed'].includes(req.body?.status)) return res.status(400).json({ error: 'Invalid inquiry status.' }); const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!inquiry) return res.status(404).json({ error: 'Inquiry not found.' }); res.json({ inquiry }); } catch (e) { next(e); } });
router.get('/courses', async (_req, res, next) => { try { res.json({ courses: await Course.find().populate('instructor', 'name email').sort({ updatedAt: -1 }).lean() }); } catch (e) { next(e); } });
router.post('/courses', async (req, res, next) => { try { const b = req.body || {}; if (cleanText(b.title, 180).length < 3 || cleanText(b.summary, 500).length < 10) return res.status(400).json({ error: 'Course title and summary are required.' }); const course = await Course.create({ title: cleanText(b.title, 180), slug: safeSlug(b.slug || b.title), category: cleanText(b.category, 100) || 'General', level: ['Beginner', 'Intermediate', 'Advanced'].includes(b.level) ? b.level : 'Beginner', duration: cleanText(b.duration, 80) || 'Self-paced', summary: cleanText(b.summary, 500), thumbnail: cleanText(b.thumbnail, 2000), bannerImage: cleanText(b.bannerImage, 2000), lessons: Array.isArray(b.lessons) ? b.lessons.slice(0, 100) : [], published: Boolean(b.published), instructor: mongoose.isValidObjectId(b.instructor) ? b.instructor : null }); res.status(201).json({ course }); } catch (e) { if (e.code === 11000) return res.status(409).json({ error: 'A course with that slug already exists.' }); next(e); } });
router.patch('/courses/:id', async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid course.' }); const b = req.body || {}, update = {}; for (const k of ['title', 'category', 'duration', 'summary', 'thumbnail', 'bannerImage']) if (typeof b[k] === 'string') update[k] = cleanText(b[k], k === 'summary' ? 500 : k === 'thumbnail' || k === 'bannerImage' ? 2000 : 180); if (typeof b.slug === 'string') update.slug = safeSlug(b.slug); if (['Beginner', 'Intermediate', 'Advanced'].includes(b.level)) update.level = b.level; if (typeof b.published === 'boolean') update.published = b.published; if (Array.isArray(b.lessons)) update.lessons = b.lessons.slice(0, 100); if (b.instructor === null || mongoose.isValidObjectId(b.instructor)) update.instructor = b.instructor || null; const course = await Course.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }); if (!course) return res.status(404).json({ error: 'Course not found.' }); res.json({ course }); } catch (e) { if (e.code === 11000) return res.status(409).json({ error: 'That slug is already in use.' }); next(e); } });
router.delete('/courses/:id', async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid course.' }); await Course.findByIdAndDelete(req.params.id); await Enrollment.deleteMany({ course: req.params.id }); res.json({ message: 'Course and related enrollment records deleted.' }); } catch (e) { next(e); } });
router.get('/services', async (_req, res, next) => { try { res.json({ services: await Service.find().sort({ createdAt: -1 }).lean() }); } catch (e) { next(e); } });
router.post('/services', async (req, res, next) => { try { const b = req.body || {}; const title = cleanText(b.title, 140), slug = safeSlug(b.slug || title), summary = cleanText(b.summary, 1000); if (title.length < 3 || !slug || summary.length < 10) return res.status(400).json({ error: 'Title and summary are required.' }); const service = await Service.create({ title, slug, category: cleanText(b.category, 80) || 'Security', summary, bullets: Array.isArray(b.bullets) ? b.bullets.filter(x => typeof x === 'string').slice(0, 12).map(x => cleanText(x, 160)) : [], published: Boolean(b.published) }); res.status(201).json({ service }); } catch (e) { if (e.code === 11000) return res.status(409).json({ error: 'That service slug already exists.' }); next(e); } });
router.patch('/services/:id', async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid service.' }); const b = req.body || {}, u = {}; for (const k of ['title', 'category', 'summary']) if (typeof b[k] === 'string') u[k] = cleanText(b[k], k === 'summary' ? 1000 : 140); if (typeof b.slug === 'string') u.slug = safeSlug(b.slug); if (typeof b.published === 'boolean') u.published = b.published; if (Array.isArray(b.bullets)) u.bullets = b.bullets.slice(0, 12).map(x => cleanText(x, 160)); const service = await Service.findByIdAndUpdate(req.params.id, u, { new: true, runValidators: true }); if (!service) return res.status(404).json({ error: 'Service not found.' }); res.json({ service }); } catch (e) { next(e); } });
router.delete('/services/:id', async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid service.' }); await Service.findByIdAndDelete(req.params.id); res.json({ message: 'Service deleted.' }); } catch (e) { next(e); } });
router.get('/research', async (_req, res, next) => { try { res.json({ research: await Research.find().populate('author', 'name role').sort({ updatedAt: -1 }).lean() }); } catch (e) { next(e); } });
router.post('/research', async (req, res, next) => { try { const b = req.body || {}, title = cleanText(b.title, 200), slug = safeSlug(b.slug || title), summary = cleanText(b.summary, 2500), content = cleanText(b.content, 50000), category = cleanText(b.category || 'CYBER RESEARCH', 60); if (title.length < 3 || !slug || summary.length < 10) return res.status(400).json({ error: 'Title and summary are required.' }); const status = b.status === 'published' ? 'published' : 'draft'; const bannerImage = cleanText(b.bannerImage, 2000); const pocImages = Array.isArray(b.pocImages) ? b.pocImages.slice(0, 20).map(img => ({ url: cleanText(img?.url, 2000), caption: cleanText(img?.caption, 500), title: cleanText(img?.title, 200) })).filter(img => Boolean(img.url)) : []; const research = await Research.create({ title, slug, category, summary, content, tags: Array.isArray(b.tags) ? b.tags.slice(0, 12).map(t => cleanText(t, 50)) : [], keyFindings: Array.isArray(b.keyFindings) ? b.keyFindings.slice(0, 10).map(k => cleanText(k, 500)) : [], architecturePoC: cleanText(b.architecturePoC, 20000), threatModel: cleanText(b.threatModel, 5000), readTimeMinutes: Number(b.readTimeMinutes) || 8, url: cleanText(b.url, 500), bannerImage, pocImages, status, author: req.user.id, authorName: req.user.name, authorRole: 'Principal Security Architect', publishedAt: status === 'published' ? new Date() : undefined }); res.status(201).json({ research }); } catch (e) { if (e.code === 11000) return res.status(409).json({ error: 'That research slug already exists.' }); next(e); } });
router.patch('/research/:id', async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid research item.' }); const b = req.body || {}, u = {}; for (const k of ['title', 'summary', 'url', 'content', 'category', 'threatModel', 'architecturePoC', 'bannerImage']) if (typeof b[k] === 'string') u[k] = cleanText(b[k], k === 'content' ? 50000 : k === 'architecturePoC' ? 20000 : k === 'threatModel' ? 5000 : k === 'summary' ? 2500 : k === 'url' || k === 'bannerImage' ? 2000 : 200); if (typeof b.slug === 'string') u.slug = safeSlug(b.slug); if (Array.isArray(b.tags)) u.tags = b.tags.slice(0, 12).map(t => cleanText(t, 50)); if (Array.isArray(b.keyFindings)) u.keyFindings = b.keyFindings.slice(0, 10).map(k => cleanText(k, 500)); if (Array.isArray(b.pocImages)) u.pocImages = b.pocImages.slice(0, 20).map(img => ({ url: cleanText(img?.url, 2000), caption: cleanText(img?.caption, 500), title: cleanText(img?.title, 200) })).filter(img => Boolean(img.url)); if (b.readTimeMinutes !== undefined) u.readTimeMinutes = Number(b.readTimeMinutes) || 8; if (['draft', 'published'].includes(b.status)) { u.status = b.status; u.publishedAt = b.status === 'published' ? new Date() : null; } const item = await Research.findByIdAndUpdate(req.params.id, u, { new: true, runValidators: true }); if (!item) return res.status(404).json({ error: 'Research item not found.' }); res.json({ research: item }); } catch (e) { next(e); } });
router.delete('/research/:id', async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid research item.' }); await Research.findByIdAndDelete(req.params.id); res.json({ message: 'Research item deleted.' }); } catch (e) { next(e); } });
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (isDemoUserId(req.params.id)) return res.status(400).json({ error: 'Demo administrator account cannot be deleted.' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid user.' });
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own active administrator account.' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    await Enrollment.deleteMany({ user: req.params.id });
    res.json({ message: 'User deleted.' });
  } catch (e) { next(e); }
});
router.get('/labs', async (_req, res, next) => {
  try {
    res.json({ labs: await Lab.find().sort({ createdAt: -1 }).lean() });
  } catch (e) { next(e); }
});
router.post('/labs', async (req, res, next) => {
  try {
    const b = req.body || {};
    const title = cleanText(b.title, 180);
    const slug = safeSlug(b.slug || title);
    const objective = cleanText(b.objective, 1500);
    if (title.length < 3 || !slug || objective.length < 10) {
      return res.status(400).json({ error: 'Lab title, slug, and objective are required.' });
    }
    const lab = await Lab.create({
      title,
      slug,
      level: ['Beginner', 'Intermediate', 'Advanced'].includes(b.level) ? b.level : 'Beginner',
      estimatedMinutes: Number(b.estimatedMinutes) || 30,
      objective,
      safety: cleanText(b.safety, 500) || 'Authorized sandbox environments only.',
      steps: Array.isArray(b.steps) ? b.steps.slice(0, 50) : [],
      challenge: typeof b.challenge === 'string' ? cleanText(b.challenge, 1500) : (b.challenge?.prompt ? cleanText(b.challenge.prompt, 1500) : 'Complete the hands-on security challenge.'),
      hints: Array.isArray(b.hints) ? b.hints.slice(0, 10).map(h => cleanText(h, 300)) : [],
      kind: cleanText(b.kind, 50) || 'interactive',
      published: Boolean(b.published)
    });
    res.status(201).json({ lab });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'That lab slug already exists.' });
    next(e);
  }
});
router.patch('/labs/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid lab.' });
    const b = req.body || {}, u = {};
    for (const k of ['title', 'objective', 'safety', 'kind']) if (typeof b[k] === 'string') u[k] = cleanText(b[k], 1500);
    if (typeof b.slug === 'string') u.slug = safeSlug(b.slug);
    if (['Beginner', 'Intermediate', 'Advanced'].includes(b.level)) u.level = b.level;
    if (b.estimatedMinutes !== undefined) u.estimatedMinutes = Number(b.estimatedMinutes) || 30;
    if (typeof b.published === 'boolean') u.published = b.published;
    if (Array.isArray(b.steps)) u.steps = b.steps.slice(0, 50);
    if (typeof b.challenge === 'string') u.challenge = cleanText(b.challenge, 1500);
    else if (b.challenge && typeof b.challenge === 'object') u.challenge = b.challenge.prompt ? cleanText(b.challenge.prompt, 1500) : b.challenge;
    if (Array.isArray(b.hints)) u.hints = b.hints.slice(0, 10).map(h => cleanText(h, 300));
    const lab = await Lab.findByIdAndUpdate(req.params.id, u, { new: true, runValidators: true });
    if (!lab) return res.status(404).json({ error: 'Lab not found.' });
    res.json({ lab });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'That slug is already in use.' });
    next(e);
  }
});
router.delete('/labs/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid lab.' });
    await Lab.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lab deleted.' });
  } catch (e) { next(e); }
});
export default router;
