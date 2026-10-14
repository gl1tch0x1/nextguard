import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { requireAuth, signSession, sessionCookieOptions, cookieName } from '../middleware/auth.js';
import { getDemoUser, findDemoUserByCredentials, isDemoUserId, isDemoEmail } from '../lib/demoAccount.js';

const router = Router();
const publicUser = u => ({ id: u.id || u._id, name: u.name, email: u.email, role: u.role });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res, next) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (name.length < 2 || name.length > 100 || !emailPattern.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Enter a valid name and email address.' });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
    }

    if (isDemoEmail(email)) {
      return res.status(400).json({ error: 'This email address is reserved for demo access.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email address already exists.' });
    }

    // New registrations are always standard students.
    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'student'
    });

    res.cookie(cookieName, signSession(user), sessionCookieOptions())
      .status(201)
      .json({ user: publicUser(user) });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: 'An account with that email address already exists.' });
    }
    next(e);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    if (isDemoEmail(email)) {
      return res.json({
        success: true,
        message: 'Demo credentials are configured in your server .env file.'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password recovery code has been generated.'
      });
    }

    // 6-digit recovery code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = code;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    console.log(`[AUTH] Password recovery code for ${email}: ${code}`);

    res.json({
      success: true,
      message: 'Password recovery verification code generated.',
      recoveryCode: code
    });
  } catch (e) {
    next(e);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!emailPattern.test(email) || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ error: 'New password must be between 8 and 128 characters.' });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+passwordHash +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired recovery verification code.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.'
    });
  } catch (e) {
    next(e);
  }
});

router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    if (isDemoUserId(req.user.id || req.user._id)) {
      return res.status(400).json({ error: 'Demo account credentials are configuration-based and managed in the .env file.' });
    }

    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ error: 'Current password is required.' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ error: 'New password must be between 8 and 128 characters.' });
    }

    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!emailPattern.test(email) || password.length > 128) return res.status(400).json({ error: 'Enter your email and password.' });

    // Validate demo credentials directly against environment config (zero DB storage)
    const demoUser = findDemoUserByCredentials(email, password);
    if (demoUser) {
      return res
        .cookie(cookieName, signSession(demoUser), sessionCookieOptions())
        .json({ user: publicUser(demoUser) });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    res.cookie(cookieName, signSession(user), sessionCookieOptions()).json({ user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post('/logout', (req, res) => res.clearCookie(cookieName, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' }).json({ message: 'Signed out.' }));

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.[cookieName];
    if (!token) return res.json({ user: null });
    // Use the statically imported jwt (no dynamic import overhead on each request)
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'nexguard-api', audience: 'nexguard-web' });

    // Return virtual demo account directly without database query
    if (isDemoUserId(payload.sub)) {
      return res.json({ user: publicUser(getDemoUser(payload.sub)) });
    }

    const user = await User.findById(payload.sub).select('_id name email role active').lean();
    if (!user || !user.active) return res.json({ user: null });
    res.json({ user: publicUser(user) });
  } catch {
    res.json({ user: null });
  }
});
export default router;
