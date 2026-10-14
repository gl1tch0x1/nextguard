// Demo Virtual Account Handler
// Credentials and identities are verified directly from process.env and NOT stored in MongoDB.

export const DEMO_ADMIN_ID = '000000000000000000000001';
export const DEMO_INSTRUCTOR_ID = '000000000000000000000002';
export const DEMO_STUDENT_ID = '000000000000000000000003';

// Backward compatibility alias
export const DEMO_USER_ID = DEMO_ADMIN_ID;

export function getAllDemoUsers() {
  return [
    {
      _id: DEMO_ADMIN_ID,
      id: DEMO_ADMIN_ID,
      name: process.env.DEMO_ADMIN_NAME || process.env.DEMO_NAME || 'Nexguard Demo Administrator',
      email: (process.env.DEMO_ADMIN_EMAIL || process.env.DEMO_EMAIL || 'demo@nexguard.io').trim().toLowerCase(),
      role: 'administrator',
      active: true,
      isVerifiedWriter: true,
      isDemo: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z')
    },
    {
      _id: DEMO_INSTRUCTOR_ID,
      id: DEMO_INSTRUCTOR_ID,
      name: process.env.DEMO_INSTRUCTOR_NAME || 'Nexguard Demo Instructor',
      email: (process.env.DEMO_INSTRUCTOR_EMAIL || 'instructor@nexguard.io').trim().toLowerCase(),
      role: 'instructor',
      active: true,
      isVerifiedWriter: true,
      isDemo: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z')
    },
    {
      _id: DEMO_STUDENT_ID,
      id: DEMO_STUDENT_ID,
      name: process.env.DEMO_STUDENT_NAME || 'Nexguard Demo Student',
      email: (process.env.DEMO_STUDENT_EMAIL || 'student@nexguard.io').trim().toLowerCase(),
      role: 'student',
      active: true,
      isVerifiedWriter: false,
      isDemo: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z')
    }
  ];
}

export function getDemoUser(idOrRole) {
  const users = getAllDemoUsers();
  if (!idOrRole) return users[0];
  const found = users.find(u => u.id === String(idOrRole) || u.role === String(idOrRole));
  return found || users[0];
}

export function findDemoUserByCredentials(email, password) {
  if (!email || !password) return null;
  const cleanEmail = String(email).trim().toLowerCase();
  const inputPassword = String(password);

  const adminEmail = (process.env.DEMO_ADMIN_EMAIL || process.env.DEMO_EMAIL || 'demo@nexguard.io').trim().toLowerCase();
  const adminPassword = String(process.env.DEMO_ADMIN_PASSWORD || process.env.DEMO_PASSWORD || 'nextguard.io');

  const instructorEmail = (process.env.DEMO_INSTRUCTOR_EMAIL || 'instructor@nexguard.io').trim().toLowerCase();
  const instructorPassword = String(process.env.DEMO_INSTRUCTOR_PASSWORD || 'nextguard.io');

  const studentEmail = (process.env.DEMO_STUDENT_EMAIL || 'student@nexguard.io').trim().toLowerCase();
  const studentPassword = String(process.env.DEMO_STUDENT_PASSWORD || 'nextguard.io');

  const legacyAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const legacyAdminPassword = String(process.env.ADMIN_PASSWORD || '');

  if (cleanEmail === adminEmail && inputPassword === adminPassword) {
    return getDemoUser(DEMO_ADMIN_ID);
  }
  if (legacyAdminEmail && cleanEmail === legacyAdminEmail && inputPassword === legacyAdminPassword) {
    return getDemoUser(DEMO_ADMIN_ID);
  }
  if (cleanEmail === instructorEmail && inputPassword === instructorPassword) {
    return getDemoUser(DEMO_INSTRUCTOR_ID);
  }
  if (cleanEmail === studentEmail && inputPassword === studentPassword) {
    return getDemoUser(DEMO_STUDENT_ID);
  }

  return null;
}

export function isDemoCredentials(email, password) {
  return findDemoUserByCredentials(email, password) !== null;
}

export function isDemoUserId(id) {
  if (!id) return false;
  const str = String(id);
  return str === DEMO_ADMIN_ID || str === DEMO_INSTRUCTOR_ID || str === DEMO_STUDENT_ID;
}

export function isDemoEmail(email) {
  if (!email) return false;
  const clean = String(email).trim().toLowerCase();
  return getAllDemoUsers().some(u => u.email === clean);
}
