# Nexguard — MERN Cybersecurity Platform

An enterprise-grade MERN cybersecurity services portal and interactive training platform. Nexguard integrates a public security services and research marketing site with role-based access control (RBAC), an administrative command console, a full Learning Management System (LMS) with quizzes, static practice security labs, a server-side AI cybersecurity assistant, and production Docker deployment assets.

---

## Architecture & Technology Stack

- **Frontend:** React 18, Vite 6, Lucide React icons, Vanilla CSS custom design system with dark cyber terminal aesthetics
- **Backend:** Node.js 20+ (ES Modules), Express 4, Mongoose 8 / MongoDB 7+
- **Security & Auth:** bcrypt password hashing (cost factor 12), JWT stored in HttpOnly/SameSite session cookies, CSRF origin verification, Helmet security headers, Express rate limiting, and server-side role enforcement
- **Testing & Quality:** Automated integration test suite (`test-suite.js`) covering authentication, LMS progress, static labs, and administrative operations
- **Deployment:** Multi-stage Dockerfiles, Nginx reverse proxy with hardened CSP/security headers, Docker Compose, structured JSON logging, and health checks

---

## Project Structure

```
nexguard-mern/
├── frontend/ (client/)          # React 18 + Vite frontend workspace
│   ├── src/
│   │   ├── api/                 # API client with CSRF and error handling
│   │   ├── components/
│   │   │   ├── academy/         # LMS & Course curriculum components (LearningView, CourseDetail, Quiz)
│   │   │   ├── labs/            # Security lab components (LabsView, LabDetailView)
│   │   │   ├── admin/           # Administrative console & instructor studio (AdminView, InstructorStudio)
│   │   │   ├── platform/        # Platform dashboard shell & authentication (OverviewView, AuthView)
│   │   │   ├── public/          # Public marketing & service showcase views
│   │   │   └── common/          # Shared navigation and footer layouts
│   │   ├── context/             # Authentication and session context
│   │   ├── Platform.jsx         # Authenticated command center shell
│   │   ├── main.jsx             # Public portal root and course explorer
│   │   └── styles.css           # Cyber terminal design system tokens and styling
│   ├── nginx.conf               # Production Nginx reverse proxy configuration
│   └── vite.config.js           # Vite config with /api proxy to backend (port 5001)
├── backend/ (server/)           # Express + Mongoose API workspace
│   ├── middleware/              # Auth, role-based access control, CSRF, errors
│   ├── models/                  # Mongoose schemas (User, Course, Enrollment, LabSession, Inquiry)
│   ├── routes/                  # Express API endpoints (/auth, /courses, /lms, /labs, /admin)
│   ├── scripts/                 # Database seeders (seed-content.js, create-admin.js)
│   └── index.js                 # Server entry point, rate limiting, and lifecycle handlers
├── academy/                     # Dedicated Cybersecurity Academy Curriculum & Tracks
│   ├── curriculum/              # Learning paths, track specifications, and prerequisites
│   ├── courses/                 # Canonical course, lesson, and quiz JSON schemas
│   └── README.md                # Academy architecture and authoring documentation
├── labs/                        # Dedicated Hands-on Security Practice & Testbeds
│   ├── docker/                  # Isolated Docker compose vulnerability targets (OWASP Juice Shop)
│   ├── scenarios/               # Static guided exercises, steps, challenges, and hints
│   └── README.md                # Security lab guidelines and execution rules
├── deploy/                      # Docker Compose and Caddy/Nginx deployment recipes
├── test-suite.js                # Comprehensive end-to-end and API integration tests
└── package.json                 # Workspace configuration and unified scripts
```


---

## Quick Start & Local Development

### Prerequisites
- **Node.js**: v20.x or newer (v22 LTS recommended)
- **MongoDB**: Local MongoDB instance running on `127.0.0.1:27017` or a MongoDB Atlas connection URI

### 1. Installation
Install root dependencies and workspaces:
```bash
npm install
```

### 2. Environment Configuration
Copy the sample environment file in `server/`:
```bash
cp server/.env.example server/.env
```
Ensure your `server/.env` contains valid values:
```env
PORT=5001
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/nexguard
JWT_SECRET=your-secure-random-secret-at-least-32-chars-long
SESSION_TTL=8h
AI_DAILY_REQUEST_LIMIT=30
MAX_CHAT_MESSAGES=8
TRUST_PROXY=0
```

> **Note on Ports:** Local development runs the Express API on port `5001` and Vite frontend on port `5173`. Vite automatically proxies `/api` requests to `http://localhost:5001`.

### 3. Database Seeding & Content Synchronization
Seed and sync 100% of rich services, courses, and research whitepapers into MongoDB:
```bash
# Sync all canonical content directly into MongoDB:
node server/scripts/sync-all-database-content.js
```

### 4. Administrator Provisioning
Create or sync your single system administrator account (`admin@nexguard.io` / `nextguard.io`):
```bash
# On Linux / macOS
ADMIN_NAME="Nexguard Administrator" ADMIN_EMAIL="admin@nexguard.io" ADMIN_PASSWORD="nextguard.io" MONGODB_URI="mongodb://127.0.0.1:27017/nexguard" npm run seed:admin --workspace server

# On Windows PowerShell
$env:ADMIN_NAME="Nexguard Administrator"; $env:ADMIN_EMAIL="admin@nexguard.io"; $env:ADMIN_PASSWORD="nextguard.io"; $env:MONGODB_URI="mongodb://127.0.0.1:27017/nexguard"; npm run seed:admin --workspace server
```

### 5. Running the Application
Start both the client and server concurrently in development mode:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Production-Grade Architecture & Verification

The platform enforces a strict **Database-Driven Architecture**:
```
Database (MongoDB) ──> Backend Data Layer (Mongoose) ──> API & Auth Layer (Express) ──> Frontend UI (React)
```
- **No Hardcoded Client Fallbacks:** The frontend never silently replaces failed API requests with client-side mock arrays. If a database or network query fails, an explicit error state is shown with a retry trigger.
- **Admin Dashboard as Source of Truth:** All content mutations (create, edit, publish, unpublish, delete) are persisted directly to MongoDB with role-based authorization. Draft publications remain completely isolated from public endpoints (returning 404) until explicitly published by authorized staff.
- **Authentic Cybersecurity Design:** Eliminates generic AI "vibe-coded" aesthetics (no cartoonish concentric radar SVG rings, glowing blobs, neon gradients, or fake metrics). Replaced with an editorial, high-authority security engineering design system.

### Running the Architecture Verification Test Suite
Run the automated verification suite validating MongoDB persistence, draft isolation, RBAC boundaries, and public API loaders:
```bash
node server/scripts/verify-production-architecture.js
```

### Running the Automated Platform Test Suite
The platform includes an automated end-to-end integration test runner validating all critical services, security barriers, and workflows:
```bash
npm test
```

### Test Coverage (27 Checks)
1. **Health & Readiness:** `GET /api/health` and `GET /api/ready` connectivity
2. **Public Catalogs:** Courses list, published security services, and research publications
3. **Inquiries & Assistant:** Contact inquiry submission with honeypot protection; AI assistant demo and OpenAI completions
4. **Authentication & Session:** Self-registration, login, HttpOnly cookie issuance, `/api/auth/me`, and unauthenticated rejection
5. **LMS Lifecycle:** Course enrollment, progress querying, lesson completion, and quiz scoring with answers validation
6. **Practice Labs:** Static lab session generation, note updating, and progress persistence
7. **RBAC Barriers:** Student restriction enforcement against `/api/admin/*` and `/api/instructor/*`
8. **Admin Operations:** Platform overview telemetry, user directory, inquiry lifecycle updates, instructor promotion, and assigned course authoring
9. **Session Teardown:** Clean logout and cookie invalidation

---

## Key Features & User Roles

| Role | Access Permissions & Workflows |
| :--- | :--- |
| **Anonymous / Public** | View marketing pages, services overview, published research, course catalog previews; submit consultation inquiries; chat with educational AI assistant. |
| **Student** | Self-register; enroll in courses; track lesson completion; take quizzes with explanations; launch static hands-on security exercises and take notes. |
| **Instructor** | Author and update lesson content, outlines, and quizzes for courses specifically assigned to them by administrators. |
| **Administrator** | Full command center; view system telemetry; assign instructors; create and publish courses; manage services and research articles; update inquiry statuses; manage user roles. |

---

## API Reference

### Health & Telemetry
- `GET /api/health` — Service status, database state, and environment
- `GET /api/ready` — Readiness probe for Kubernetes / Docker orchestrators

### Authentication & Identity
- `POST /api/auth/register` — Register a student account (`name`, `email`, `password`)
- `POST /api/auth/login` — Sign in and receive `nexguard_session` cookie
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Return current session identity and role

### Public Catalog & Inquiries
- `GET /api/courses` — Public course list (database records with fallback sample fallback)
- `GET /api/services` — Published security services
- `GET /api/research` — Published security whitepapers and findings
- `POST /api/inquiries` — Submit contact or testing inquiry (includes honeypot detection)
- `POST /api/assistant` — Ask the server-side AI assistant for security guidance

### LMS (Student Learning)
- `GET /api/lms/my-courses` — Retrieve enrolled courses and completion percentage
- `POST /api/lms/enroll/:courseId` — Enroll in a published course
- `GET /api/lms/courses/:courseId` — Course detail with lesson outlines
- `POST /api/lms/courses/:courseId/lessons/:lessonId/complete` — Mark lesson finished
- `POST /api/lms/courses/:courseId/lessons/:lessonId/quiz` — Submit quiz answers and receive score

### Security Practice Labs
- `GET /api/labs` — List interactive static educational lab modules
- `POST /api/labs/:slug/start` — Start a practice session
- `PATCH /api/labs/:sessionId` — Update session notes and completion flag

### Instructor Studio
- `GET /api/instructor/courses` — List assigned courses
- `PATCH /api/instructor/courses/:id/lessons` — Update lesson curriculum and quiz questions

### Administrator Command Center
- `GET /api/admin/overview` — Platform telemetry (user count, active courses, pending inquiries)
- `GET /api/admin/users` — List platform users
- `PATCH /api/admin/users/:id` — Update user active status or role (`student`, `instructor`, `administrator`)
- `GET /api/admin/inquiries` & `PATCH /api/admin/inquiries/:id` — Inquiry workflow management
- `GET /api/admin/courses`, `POST /api/admin/courses`, `PATCH /api/admin/courses/:id`, `DELETE /api/admin/courses/:id` — Catalog CRUD and instructor assignment
- `POST /api/instructor/courses/:id/publish` — Toggle public course visibility
- `GET /api/admin/services` & `GET /api/admin/research` — Manage marketing assets

---

## Security Model & Best Practices

1. **Defense in Depth**: Access controls and role validations are strictly enforced on the server for every non-public operation.
2. **Session Protection**: JWTs are transmitted exclusively inside an `HttpOnly`, `SameSite=Strict` cookie.
3. **Cross-Site Request Forgery (CSRF)**: State-changing requests (`POST`, `PATCH`, `DELETE`) require custom headers and origin matching against `CLIENT_ORIGIN`.
4. **Input Sanitization & Honeypots**: Inquiries and form submissions enforce strict character limits, type casting, and silent honeypot filtering to prevent spam.
5. **No Untrusted Execution**: Educational practice labs in this core application are designed as instructional templates; the main application deliberately does not execute untrusted student shell code or arbitrary container workloads in production.

---

## Production Deployment (Docker Compose)

1. Set up a reverse proxy with a valid TLS certificate pointing to your server.
2. Configure production variables in `server/.env` including your MongoDB Atlas connection URI and public `CLIENT_ORIGIN`:
   ```bash
   CLIENT_ORIGIN=https://security.example.com
   NODE_ENV=production
   ```
3. Run the Compose cluster from `deploy/`:
   ```bash
   cd deploy
   CLIENT_ORIGIN=https://security.example.com docker compose up -d --build
   ```
4. Verify deployment health at `https://security.example.com/api/health`.
