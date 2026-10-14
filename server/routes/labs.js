import { Router } from 'express';
import mongoose from 'mongoose';
import Lab from '../models/Lab.js';
import LabSession from '../models/LabSession.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const isStaff = ['administrator', 'instructor'].includes(req.user?.role);
    const includeDrafts = req.query.includeDrafts === 'true' && isStaff;
    const filter = includeDrafts ? {} : { published: true };

    const [dbLabs, sessions] = await Promise.all([
      Lab.find(filter).sort({ createdAt: 1 }).lean(),
      LabSession.find({ user: req.user.id }).lean()
    ]);

    const labsWithSessions = dbLabs.map((l) => {
      const userSession = sessions
        .filter((s) => s.labSlug === l.slug)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || null;
      return { ...l, session: userSession };
    });

    res.json({ labs: labsWithSessions });
  } catch (e) {
    next(e);
  }
});

router.post('/:slug/start', async (req, res, next) => {
  try {
    const lab = await Lab.findOne({ slug: req.params.slug, published: true }).lean();
    if (!lab) return res.status(404).json({ error: 'Lab not found.' });

    const session = await LabSession.create({
      user: req.user.id,
      labSlug: lab.slug
    });

    res.status(201).json({ session, lab });
  } catch (e) {
    next(e);
  }
});

router.patch('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    if (!mongoose.isValidObjectId(sessionId)) return res.status(400).json({ error: 'Invalid lab session.' });

    const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim().slice(0, 2000) : undefined;
    const update = {};
    if (notes !== undefined) update.notes = notes;
    if (req.body?.status === 'completed') {
      update.status = 'completed';
      update.completedAt = new Date();
    }

    const session = await LabSession.findOneAndUpdate(
      { _id: sessionId, user: req.user.id },
      update,
      { new: true, runValidators: true }
    );
    if (!session) return res.status(404).json({ error: 'Lab session not found.' });

    res.json({ session });
  } catch (e) {
    next(e);
  }
});

export default router;
