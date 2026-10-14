import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getDemoUser, isDemoUserId } from '../lib/demoAccount.js';

const cookieName = 'nexguard_session';

export function signSession(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  return jwt.sign(
    { sub: user.id || user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.SESSION_TTL || '8h', issuer: 'nexguard-api', audience: 'nexguard-web' }
  );
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000
  };
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[cookieName];
    if (!token) return res.status(401).json({ error: 'Sign in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'nexguard-api', audience: 'nexguard-web' });

    // Handle virtual demo account directly from environment config (bypasses DB)
    if (isDemoUserId(payload.sub)) {
      req.user = getDemoUser(payload.sub);
      return next();
    }

    const user = await User.findById(payload.sub).select('_id name email role isVerifiedWriter active');
    if (!user || !user.active) return res.status(401).json({ error: 'This account is unavailable.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Your session is invalid or expired. Please sign in again.' });
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const token = req.cookies?.[cookieName];
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'nexguard-api', audience: 'nexguard-web' });

    if (isDemoUserId(payload.sub)) {
      req.user = getDemoUser(payload.sub);
      return next();
    }

    const user = await User.findById(payload.sub).select('_id name email role isVerifiedWriter active');
    if (user && user.active) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (roles.includes(req.user?.role)) return next();
    return res.status(403).json({ error: 'You do not have permission to perform this action.' });
  };
}

/**
 * Check if the user is authorized to author/manage research articles
 * Allowed: Administrator, Instructor, or Verified Writer
 */
export function canWriteArticles(user) {
  if (!user) return false;
  return (
    user.role === 'administrator' ||
    user.role === 'instructor' ||
    user.role === 'writer' ||
    user.isVerifiedWriter === true
  );
}

export function requireArticleWriter(req, res, next) {
  if (canWriteArticles(req.user)) return next();
  return res.status(403).json({
    error: 'Only administrators, instructors, and verified writers can author or publish research articles.'
  });
}

export function verifyCsrfHeader(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (!origin) return next();
  const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const isAllowed =
    clientOrigins.includes(origin) ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:');
  if (!isAllowed) {
    return res.status(403).json({ error: 'Cross-site request blocked.' });
  }
  next();
}

export { cookieName };
