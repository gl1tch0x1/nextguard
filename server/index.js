import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import coursesRouter from './routes/courses.js';
import inquiriesRouter from './routes/inquiries.js';
import assistantRouter from './routes/assistant.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import lmsRouter from './routes/lms.js';
import labsRouter from './routes/labs.js';
import publicContentRouter from './routes/publicContent.js';
import instructorRouter from './routes/instructor.js';
import researchRouter from './routes/research.js';
import uploadRouter from './routes/upload.js';
import compression from 'compression';
import { notFound, errorHandler } from './middleware/notFound.js';
import { verifyCsrfHeader } from './middleware/auth.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean);
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) throw new Error('Set JWT_SECRET to a random secret of at least 32 characters before production start.');
app.use(compression());
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'https:', 'blob:'], scriptSrc: ["'self'"], connectSrc: ["'self'", ...origins], objectSrc: ["'none'"], frameAncestors: ["'none'"] } } }));
app.use(cors({
  origin(origin, cb) {
    if (!origin || origins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With']
}));
app.use(express.json({ limit: '15mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser());
app.use(verifyCsrfHeader);
app.use((req, res, next) => { req.requestId = crypto.randomUUID(); res.setHeader('X-Request-Id', req.requestId); const start = Date.now(); res.on('finish', () => console.log(JSON.stringify({ level: 'info', event: 'http_request', requestId: req.requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - start, ip: req.ip }))); next(); });
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: process.env.NODE_ENV === 'production' ? 1200 : 5000, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/auth/register', rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/assistant', rateLimit({ windowMs: 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (_req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', environment: process.env.NODE_ENV || 'development', timestamp: new Date().toISOString() }); });
app.get('/api/ready', (_req, res) => { const ready = mongoose.connection.readyState === 1; res.status(ready ? 200 : 503).json({ ready, database: ready ? 'connected' : 'disconnected' }); });
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/lms', lmsRouter);
app.use('/api/labs', labsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/instructor', instructorRouter);
app.use('/api/research', researchRouter);
app.use('/api/upload', uploadRouter);
app.use('/api', publicContentRouter);
app.use(notFound);
app.use(errorHandler);

mongoose.connection.on('error', err => console.error(JSON.stringify({ level: 'error', event: 'mongo_error', message: err.message })));
if (process.env.MONGODB_URI) { mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 }).then(() => console.log(JSON.stringify({ level: 'info', event: 'mongo_connected' }))).catch(err => console.error(JSON.stringify({ level: 'error', event: 'mongo_connect_failed', message: err.message }))); }
else console.warn(JSON.stringify({ level: 'warn', event: 'mongo_not_configured' }));
const server = app.listen(port, () => console.log(JSON.stringify({ level: 'info', event: 'api_started', port, environment: process.env.NODE_ENV || 'development' })));
const shutdown = signal => { console.log(JSON.stringify({ level: 'info', event: 'shutdown', signal })); server.close(() => mongoose.disconnect().finally(() => process.exit(0))); setTimeout(() => process.exit(1), 10000).unref(); };
process.on('SIGTERM', () => shutdown('SIGTERM')); process.on('SIGINT', () => shutdown('SIGINT'));
