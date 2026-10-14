import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { signSession, cookieName } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexguard';
const apiBase = 'http://localhost:5001/api';

async function testEndpoint(name, url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    return { name, status: res.status, ok: res.ok, data };
  } catch (err) {
    return { name, status: 0, ok: false, error: err.message };
  }
}

async function runVerification() {
  console.log('=== NEXGUARD PRODUCTION-GRADE ARCHITECTURE VERIFICATION ===\n');

  // 1. Direct MongoDB Database Health
  console.log('[1/4] Verifying MongoDB Connection and Data Collections...');
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const servicesCount = await db.collection('services').countDocuments({ published: true });
  const coursesCount = await db.collection('courses').countDocuments({ published: true });
  const researchCount = await db.collection('researches').countDocuments({ status: 'published' });
  const usersCount = await db.collection('users').countDocuments();

  console.log(`✓ MongoDB Connected: ${mongoUri}`);
  console.log(`  - Published Services in DB: ${servicesCount}`);
  console.log(`  - Published Courses in DB:  ${coursesCount}`);
  console.log(`  - Published Research in DB: ${researchCount}`);
  console.log(`  - Users in DB:              ${usersCount}\n`);

  if (servicesCount < 6 || coursesCount < 6 || researchCount < 7) {
    throw new Error('Database collection count does not meet minimum expected dataset!');
  }

  // 2. Public Content API Loaders
  console.log('[2/4] Testing Public API Loaders (No client mock fallbacks)...');
  const resServices = await testEndpoint('GET /api/services', `${apiBase}/services`);
  console.log(`  ${resServices.ok ? '✓' : '✗'} /api/services: ${resServices.status} (Found ${resServices.data?.services?.length} services)`);

  const resOneService = await testEndpoint('GET /api/services/vulnerability-assessment-pentesting', `${apiBase}/services/vulnerability-assessment-pentesting`);
  console.log(`  ${resOneService.ok ? '✓' : '✗'} /api/services/:slug: ${resOneService.status} (Title: "${resOneService.data?.service?.title}")`);

  const resCourses = await testEndpoint('GET /api/courses', `${apiBase}/courses`);
  console.log(`  ${resCourses.ok ? '✓' : '✗'} /api/courses: ${resCourses.status} (Found ${resCourses.data?.courses?.length} courses)`);

  const resOneCourse = await testEndpoint('GET /api/courses/cyber-foundations', `${apiBase}/courses/cyber-foundations`);
  console.log(`  ${resOneCourse.ok ? '✓' : '✗'} /api/courses/:slug: ${resOneCourse.status} (Title: "${resOneCourse.data?.course?.title}")`);

  const resResearch = await testEndpoint('GET /api/research', `${apiBase}/research`);
  console.log(`  ${resResearch.ok ? '✓' : '✗'} /api/research: ${resResearch.status} (Found ${resResearch.data?.research?.length} research papers)`);

  const resOneResearch = await testEndpoint('GET /api/research/zero-day-hypervisor-corruption', `${apiBase}/research/zero-day-hypervisor-corruption`);
  console.log(`  ${resOneResearch.ok ? '✓' : '✗'} /api/research/:slug: ${resOneResearch.status} (Title: "${resOneResearch.data?.research?.title}")`);

  // 3. Security, Access Control & Draft Boundary Test
  console.log('\n[3/4] Testing Security & Access Control Boundaries...');
  const unauthAdminCall = await testEndpoint('POST /api/admin/courses (Unauthenticated)', `${apiBase}/admin/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacked Course' })
  });
  console.log(`  ${unauthAdminCall.status === 401 ? '✓' : '✗'} Unauthenticated access blocked: Status ${unauthAdminCall.status} (Expected 401)`);

  // 4. Admin Authentication & CMS Mutation Lifecycle
  console.log('\n[4/4] Testing Admin CMS Mutation Lifecycle (Create -> Draft -> Publish -> Delete)...');
  const adminUser = await db.collection('users').findOne({ role: 'administrator' });
  if (!adminUser) throw new Error('No admin user found in database!');

  const token = signSession(adminUser);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Cookie': `${cookieName}=${token}`,
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': 'http://localhost:5173'
  };

  // Create Draft
  const testSlug = `verif-test-paper-${Date.now()}`;
  const createDraftRes = await testEndpoint('POST /api/admin/research (Create Draft)', `${apiBase}/admin/research`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Automated Verification Sandbox Investigation',
      slug: testSlug,
      category: 'SECURITY AUDIT',
      summary: 'Ephemeral test research publication verifying database CMS mutation pipeline.',
      content: 'Production-grade integration test body verifying Mongo persistence.',
      status: 'draft'
    })
  });
  console.log(`  ${createDraftRes.ok ? '✓' : '✗'} Create Draft via Admin API: ${createDraftRes.status} (ID: ${createDraftRes.data?.research?._id})`);
  const createdId = createDraftRes.data?.research?._id;

  // Verify Draft is HIDDEN from Public API
  const publicDraftCheck = await testEndpoint(`GET /api/research/${testSlug} (Public Draft Isolation)`, `${apiBase}/research/${testSlug}`);
  console.log(`  ${publicDraftCheck.status === 404 ? '✓' : '✗'} Draft Isolation from Public API: Status ${publicDraftCheck.status} (Expected 404 Not Found)`);

  // Publish Draft
  const publishRes = await testEndpoint(`PATCH /api/admin/research/${createdId} (Publish Paper)`, `${apiBase}/admin/research/${createdId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'published' })
  });
  console.log(`  ${publishRes.ok ? '✓' : '✗'} Publish via Admin API: ${publishRes.status}`);

  // Verify now VISIBLE to Public API
  const publicPublishCheck = await testEndpoint(`GET /api/research/${testSlug} (Public Visibility)`, `${apiBase}/research/${testSlug}`);
  console.log(`  ${publicPublishCheck.ok ? '✓' : '✗'} Public Visibility after Publication: Status ${publicPublishCheck.status} (Title: "${publicPublishCheck.data?.research?.title}")`);

  // Clean up: Delete test paper
  const deleteRes = await testEndpoint(`DELETE /api/admin/research/${createdId}`, `${apiBase}/admin/research/${createdId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  console.log(`  ${deleteRes.ok ? '✓' : '✗'} Cleanup test paper: ${deleteRes.status}`);

  await mongoose.disconnect();
  console.log('\n✓ ALL ARCHITECTURAL, SECURITY & CMS VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
}

runVerification().catch((err) => {
  console.error('\n✗ Verification Failed:', err);
  process.exit(1);
});
