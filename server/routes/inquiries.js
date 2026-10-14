import { Router } from 'express';
import mongoose from 'mongoose';
import Inquiry from '../models/Inquiry.js';

const router = Router();
const allowedServices = ['VAPT', 'Security Audit', 'Red Teaming', 'Web Development', 'Networking & IT', 'AI Security', 'Training', 'Other'];

router.post('/', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Inquiry storage is not configured yet. Please contact the site administrator.' });
    }
    const { name, email, company = '', service, message, authorized = false, website = '' } = req.body ?? {};
    // Honeypot field: silently reject automated submissions without revealing detection logic.
    if (String(website).trim()) return res.status(201).json({ message: 'Thanks. Your inquiry has been received.' });
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) return res.status(400).json({ error: 'Enter a name between 2 and 100 characters.' });
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: 'Enter a valid business email address.' });
    if (!allowedServices.includes(service)) return res.status(400).json({ error: 'Choose a valid service.' });
    if (['VAPT', 'Security Audit', 'Red Teaming'].includes(service) && authorized !== true) return res.status(400).json({ error: 'Confirm authorization for security testing requests.' });
    if (typeof message !== 'string' || message.trim().length < 10 || message.length > 4000) return res.status(400).json({ error: 'Your message must be between 10 and 4000 characters.' });
    const inquiry = await Inquiry.create({ name: name.trim(), email: email.trim(), company: String(company).trim().slice(0, 120), service, message: message.trim(), authorized: Boolean(authorized) });
    res.status(201).json({ message: 'Thanks. Your inquiry has been received.', id: inquiry.id });
  } catch (err) { next(err); }
});

export default router;
