// Automated API & End-to-End Test Suite for Nexguard MERN Platform
import assert from 'node:assert';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BASE_URL = 'http://localhost:5001';
const ORIGIN = 'http://localhost:5173';

let studentCookie = null;
let adminCookie = null;
let instructorCookie = null;
let testStudentId = null;
let testCourseId = null;
let testLessonId = null;
let inquiryId = null;
let labSessionId = null;

const uniqueId = Date.now();
const testStudentEmail = `student_${uniqueId}@nexguard.local`;
const testStudentPassword = 'TestPassword123!';
const testAdminEmail = `admin_${uniqueId}@nexguard.local`;
const testAdminPassword = 'AdminSecretPassword123!';
const testInstructorEmail = `instructor_${uniqueId}@nexguard.local`;
const testInstructorPassword = 'InstructorPassword123!';

async function req(path, options = {}) {
  const headers = {
    'Origin': ORIGIN,
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  const setCookie = res.headers.get('set-cookie');
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  return { status: res.status, ok: res.ok, data, headers: res.headers, setCookie };
}

function parseCookie(setCookieHeader) {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(/nexguard_session=([^;]+)/);
  return match ? `nexguard_session=${match[1]}` : null;
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`        ${err.message}`);
    failed++;
  }
}

async function runTests() {
  console.log('--- Nexguard Test Suite Starting ---\n');

  // Connect mongoose once upfront
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexguard';
  await mongoose.connect(mongoUri);
  const User = (await import('./server/models/User.js')).default;
  const Course = (await import('./server/models/Course.js')).default;

  try {
    console.log('1. Health & Infrastructure Endpoints');
    await test('GET /api/health should return ok with database connected', async () => {
      const res = await req('/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'ok');
      assert.strictEqual(res.data.database, 'connected');
    });

    await test('GET /api/ready should return 200 ready:true', async () => {
      const res = await req('/api/ready');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.ready, true);
    });

    console.log('\n2. Public Catalog & Content Endpoints');
    await test('GET /api/courses should return courses object containing course list', async () => {
      const res = await req('/api/courses');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.courses));
      assert.ok(res.data.courses.length > 0, 'Expected seeded courses to be returned');
      testCourseId = res.data.courses[0]._id;
    });

    await test('GET /api/services should return services array wrapper', async () => {
      const res = await req('/api/services');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.services));
    });

    await test('GET /api/research should return research items array wrapper', async () => {
      const res = await req('/api/research');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.research));
    });

    console.log('\n3. Public Inquiry & Assistant');
    await test('POST /api/inquiries should accept valid contact inquiry with authorization', async () => {
      const res = await req('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Alice Security',
          email: 'alice@cybercorp.example',
          company: 'CyberCorp',
          service: 'VAPT',
          authorized: true,
          message: 'Requesting a scope review and penetration test proposal for our infrastructure.'
        })
      });
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.id);
      inquiryId = res.data.id;
    });

    await test('POST /api/assistant should reply (either OpenAI or fallback demo mode)', async () => {
      const res = await req('/api/assistant', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'What is cross-site scripting?' }]
        })
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.reply);
    });

    console.log('\n4. Authentication & Student Registration');
    await test('POST /api/auth/register or login student account and set session cookie', async () => {
      let res = await req('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Student Tester',
          email: testStudentEmail,
          password: testStudentPassword
        })
      });

      if (res.status === 429 || res.status === 403) {
        // Registration restricted or rate limit hit; seed user directly and login
        const passwordHash = await bcrypt.hash(testStudentPassword, 12);
        const user = await User.create({
          name: 'Student Tester',
          email: testStudentEmail,
          passwordHash,
          role: 'student'
        });
        testStudentId = user._id.toString();

        res = await req('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: testStudentEmail,
            password: testStudentPassword
          })
        });
        assert.strictEqual(res.status, 200);
      } else {
        assert.strictEqual(res.status, 201);
        testStudentId = res.data.user.id;
      }

      studentCookie = parseCookie(res.setCookie);
      assert.ok(studentCookie, 'Session cookie must be set');
    });

    await test('GET /api/auth/me should return logged-in student', async () => {
      const res = await req('/api/auth/me', {
        headers: { Cookie: studentCookie }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.user);
      assert.strictEqual(res.data.user.email, testStudentEmail);
      assert.strictEqual(res.data.user.role, 'student');
    });

    await test('GET /api/auth/me without cookie should return null user', async () => {
      const res = await req('/api/auth/me');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.user, null);
    });

    console.log('\n5. LMS Workflow (Enrollment, Lessons, Quizzes)');
    await test('POST /api/lms/enroll/:courseId should enroll student in course', async () => {
      assert.ok(testCourseId, 'Need valid testCourseId');
      const res = await req(`/api/lms/enroll/${testCourseId}`, {
        method: 'POST',
        headers: { Cookie: studentCookie }
      });
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.enrollment);
    });

    await test('GET /api/lms/my-courses should list enrolled course', async () => {
      const res = await req('/api/lms/my-courses', {
        headers: { Cookie: studentCookie }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.enrollments));
      const found = res.data.enrollments.find(e => (e.course?._id || e.course) === testCourseId);
      assert.ok(found, 'Course should be found in enrollments');
    });

    await test('GET /api/lms/courses/:courseId should return course LMS progress and lessons', async () => {
      const res = await req(`/api/lms/courses/${testCourseId}`, {
        headers: { Cookie: studentCookie }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.course);
      assert.ok(Array.isArray(res.data.course.lessons));
      assert.ok(res.data.course.lessons.length > 0);
      testLessonId = res.data.course.lessons[0]._id;
    });

    await test('POST /api/lms/courses/:courseId/lessons/:lessonId/complete should mark lesson completed', async () => {
      assert.ok(testLessonId, 'Need valid testLessonId');
      const res = await req(`/api/lms/courses/${testCourseId}/lessons/${testLessonId}/complete`, {
        method: 'POST',
        headers: { Cookie: studentCookie }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.enrollment);
      assert.ok(res.data.progress >= 0);
    });

    await test('POST /api/lms/courses/:courseId/lessons/:lessonId/quiz should score quiz submission', async () => {
      assert.ok(testLessonId, 'Need valid testLessonId');
      const courseDoc = await Course.findById(testCourseId);
      const lessonDoc = courseDoc.lessons.id(testLessonId);
      const correctAnswers = lessonDoc.quiz.map(q => q.correctIndex);

      const res = await req(`/api/lms/courses/${testCourseId}/lessons/${testLessonId}/quiz`, {
        method: 'POST',
        headers: { Cookie: studentCookie },
        body: JSON.stringify({ answers: correctAnswers })
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.score, correctAnswers.length);
      assert.strictEqual(res.data.passed, true);
    });

    console.log('\n6. Labs Workflow');
    await test('GET /api/labs should list available practice labs', async () => {
      const res = await req('/api/labs', {
        headers: { Cookie: studentCookie }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.labs));
      assert.ok(res.data.labs.length > 0);
    });

    await test('POST /api/labs/:slug/start should start a lab session', async () => {
      const res = await req('/api/labs/http-headers/start', {
        method: 'POST',
        headers: { Cookie: studentCookie }
      });
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.session);
      labSessionId = res.data.session._id;
    });

    await test('PATCH /api/labs/:sessionId should update notes and completion status', async () => {
      assert.ok(labSessionId, 'Need valid labSessionId');
      const res = await req(`/api/labs/${labSessionId}`, {
        method: 'PATCH',
        headers: { Cookie: studentCookie },
        body: JSON.stringify({ notes: 'Completed task 1 and 2.', status: 'completed' })
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.session.status, 'completed');
      assert.strictEqual(res.data.session.notes, 'Completed task 1 and 2.');
    });

    console.log('\n7. Role Authorization & Access Control');
    await test('Student access to GET /api/admin/overview should be 403 Forbidden', async () => {
      const res = await req('/api/admin/overview', {
        headers: { Cookie: studentCookie }
      });
      assert.strictEqual(res.status, 403);
    });

    await test('Student access to GET /api/instructor/courses should be 403 Forbidden', async () => {
      const res = await req('/api/instructor/courses', {
        headers: { Cookie: studentCookie }
      });
      assert.strictEqual(res.status, 403);
    });

    console.log('\n8. Administrator Operations');
    await test('Bootstrap and login as administrator', async () => {
      const passwordHash = await bcrypt.hash(testAdminPassword, 12);
      await User.create({
        name: 'System Admin',
        email: testAdminEmail,
        passwordHash,
        role: 'administrator'
      });

      const loginRes = await req('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testAdminEmail,
          password: testAdminPassword
        })
      });
      assert.strictEqual(loginRes.status, 200);
      assert.strictEqual(loginRes.data.user.role, 'administrator');
      adminCookie = parseCookie(loginRes.setCookie);
      assert.ok(adminCookie, 'Admin session cookie must be set');
    });

    await test('GET /api/admin/overview should return platform statistics', async () => {
      const res = await req('/api/admin/overview', {
        headers: { Cookie: adminCookie }
      });
      assert.strictEqual(res.status, 200);
      assert.ok('users' in res.data);
      assert.ok('courses' in res.data);
      assert.ok('inquiries' in res.data);
    });

    await test('GET /api/admin/users should list all users', async () => {
      const res = await req('/api/admin/users', {
        headers: { Cookie: adminCookie }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.users));
      assert.ok(res.data.users.some(u => u.email === testStudentEmail));
    });

    await test('GET /api/admin/inquiries should list inquiries and allow updating status', async () => {
      const res = await req('/api/admin/inquiries', {
        headers: { Cookie: adminCookie }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.inquiries));

      if (inquiryId) {
        const updateRes = await req(`/api/admin/inquiries/${inquiryId}`, {
          method: 'PATCH',
          headers: { Cookie: adminCookie },
          body: JSON.stringify({ status: 'in_review' })
        });
        assert.strictEqual(updateRes.status, 200);
        assert.strictEqual(updateRes.data.inquiry.status, 'in_review');
      }
    });

    await test('Admin can promote a user to instructor', async () => {
      const passwordHash = await bcrypt.hash(testInstructorPassword, 12);
      const instructorCandidate = await User.create({
        name: 'Jane Instructor',
        email: testInstructorEmail,
        passwordHash,
        role: 'student'
      });

      const roleRes = await req(`/api/admin/users/${instructorCandidate._id}`, {
        method: 'PATCH',
        headers: { Cookie: adminCookie },
        body: JSON.stringify({ role: 'instructor' })
      });
      assert.strictEqual(roleRes.status, 200);
      assert.strictEqual(roleRes.data.user.role, 'instructor');

      const instLoginRes = await req('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testInstructorEmail,
          password: testInstructorPassword
        })
      });
      assert.strictEqual(instLoginRes.status, 200);
      assert.strictEqual(instLoginRes.data.user.role, 'instructor');
      instructorCookie = parseCookie(instLoginRes.setCookie);
      assert.ok(instructorCookie);
    });

    await test('Instructor can access /api/instructor/courses', async () => {
      const res = await req('/api/instructor/courses', {
        headers: { Cookie: instructorCookie }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.courses));
    });

    console.log('\n9. Authentication Teardown & Logout');
    await test('POST /api/auth/logout should clear cookie', async () => {
      const res = await req('/api/auth/logout', {
        method: 'POST',
        headers: { Cookie: studentCookie }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.message, 'Signed out.');
    });

  } finally {
    if (mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.collection('users').deleteMany({ email: { $regex: /@nexguard\.local$/ } });
        if (inquiryId && mongoose.isValidObjectId(inquiryId)) {
          await mongoose.connection.collection('inquiries').deleteOne({ _id: new mongoose.Types.ObjectId(inquiryId) });
        }
        if (labSessionId && mongoose.isValidObjectId(labSessionId)) {
          await mongoose.connection.collection('labsessions').deleteOne({ _id: new mongoose.Types.ObjectId(labSessionId) });
        }
      } catch (cleanupErr) {
        console.error('Cleanup warning:', cleanupErr.message);
      }
      await mongoose.disconnect();
    }
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner encountered an error:', err);
  process.exit(1);
});
