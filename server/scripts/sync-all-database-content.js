import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import User from '../models/User.js';
import Service from '../models/Service.js';
import Course from '../models/Course.js';
import Research from '../models/Research.js';
import Lab from '../models/Lab.js';
import Enrollment from '../models/Enrollment.js';
import LabSession from '../models/LabSession.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexguard';
const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nexguard.io').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'nextguard.io';
const adminName = process.env.ADMIN_NAME || 'Nexguard Administrator';

async function syncAll() {
  console.log('Connecting to MongoDB at:', mongoUri);
  await mongoose.connect(mongoUri);

  try {
    // 1. ENSURE SINGLE ADMINISTRATOR (admin@nexguard.io / nextguard.io)
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      admin.name = adminName;
      admin.passwordHash = passwordHash;
      admin.role = 'administrator';
      admin.active = true;
      await admin.save();
      console.log(`[AUTH] Admin password and status synced: ${adminEmail}`);
    } else {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'administrator',
        active: true
      });
      console.log(`[AUTH] Admin created: ${adminEmail}`);
    }

    // 2. PURGE ALL OTHER USERS (SINGLE ADMIN ONLY)
    const purgeUsersRes = await User.deleteMany({ email: { $ne: adminEmail } });
    console.log(`[AUTH] Single admin enforced: purged ${purgeUsersRes.deletedCount} non-admin accounts.`);

    await Enrollment.deleteMany({ user: { $ne: admin._id } });
    await LabSession.deleteMany({ user: { $ne: admin._id } });

    // 3. SEED RICH SERVICES (Stored 100% in database!)
    const { pathToFileURL } = await import('node:url');
    const { SERVICE_DETAILS } = await import(pathToFileURL(path.join(rootDir, 'client', 'src', 'data', 'serviceDetails.js')).href);
    const serviceList = Object.values(SERVICE_DETAILS);

    for (const svc of serviceList) {
      await Service.updateOne(
        { slug: svc.slug },
        {
          $set: {
            ...svc,
            published: true
          }
        },
        { upsert: true }
      );
    }
    console.log(`[SERVICES] Synced ${serviceList.length} rich services into MongoDB.`);

    // 4. SEED RICH COURSES / LEARNING TRACKS (Stored 100% in database!)
    const { LEARNING_DETAILS } = await import(pathToFileURL(path.join(rootDir, 'client', 'src', 'data', 'learningDetails.js')).href);
    const courseList = Object.values(LEARNING_DETAILS);

    for (const crs of courseList) {
      // Map modules to lessons if needed
      const lessons = (crs.modules || []).flatMap((mod, mIdx) => 
        (mod.lessons || []).map((les, lIdx) => ({
          title: les.title || `Lesson ${lIdx + 1}`,
          summary: les.summary || les.detail || '',
          content: `${les.summary || ''}\n\nTopics covered: ${(les.topics || []).join(', ')}`,
          order: mIdx * 10 + lIdx,
          durationMinutes: les.durationMinutes || 25,
          quiz: (les.quiz || []).map(q => ({
            question: q.question,
            options: q.options || [],
            correctIndex: q.correctIndex || 0,
            explanation: q.explanation || ''
          }))
        }))
      );

      await Course.updateOne(
        { slug: crs.slug },
        {
          $set: {
            ...crs,
            lessons: lessons.length ? lessons : undefined,
            published: true,
            instructor: admin._id
          }
        },
        { upsert: true }
      );
    }
    console.log(`[COURSES] Synced ${courseList.length} rich learning courses into MongoDB.`);

    // 5. SEED RICH RESEARCH PAPERS (Stored 100% in database!)
    const { RESEARCH_DETAILS } = await import(pathToFileURL(path.join(rootDir, 'client', 'src', 'data', 'researchDetails.js')).href);
    const researchList = Object.values(RESEARCH_DETAILS);

    for (const res of researchList) {
      await Research.updateOne(
        { slug: res.slug },
        {
          $set: {
            ...res,
            status: 'published',
            author: admin._id,
            authorName: res.authorName || 'NexGuard Security Research Team',
            authorRole: res.authorRole || 'Principal Security Architect',
            publishedAt: res.publishedAt ? new Date(res.publishedAt) : new Date()
          }
        },
        { upsert: true }
      );
    }
    console.log(`[RESEARCH] Synced ${researchList.length} research publications into MongoDB.`);

    console.log('\n[SUCCESS] Full dynamic database sync completed! MongoDB is now the single source of truth.');
  } finally {
    await mongoose.disconnect();
  }
}

syncAll().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
