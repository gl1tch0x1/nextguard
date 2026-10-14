# Nexguard Academy — Cybersecurity Curriculum Architecture

Welcome to the **Nexguard Academy** directory. This directory centralizes all educational content, structured course tracks, modules, lessons, and interactive quizzes for the Nexguard MERN cybersecurity learning management system (LMS).

---

## Directory Layout

```
academy/
├── curriculum/
│   └── tracks.json             # High-level syllabus, tracks, and skill progression map
├── courses/
│   ├── cyber-foundations.json   # Cybersecurity Foundations track
│   ├── network-linux.json       # Networking & Linux for Security track
│   ├── web-appsec.json          # Web Application Security track
│   ├── bug-bounty.json          # Bug Bounty Methodology track
│   ├── red-team.json            # Red Teaming Fundamentals track
│   └── ai-security.json         # AI for Cybersecurity track
└── README.md                    # Architecture and authoring guide
```

---

## Course JSON Schema

Every course in `academy/courses/*.json` adheres to the following specification:

```json
{
  "slug": "course-unique-slug",
  "title": "Course Title",
  "category": "Foundations | Infrastructure | Application Security | Offensive Security | AI & Automation",
  "level": "Beginner | Intermediate | Advanced",
  "duration": "4 weeks",
  "summary": "Brief executive summary of the learning track.",
  "published": true,
  "lessons": [
    {
      "title": "Lesson Title",
      "summary": "Key learning takeaways",
      "content": "In-depth instructional material formatted in clean Markdown / text.",
      "durationMinutes": 25,
      "quiz": [
        {
          "question": "Concept validation question?",
          "options": ["Option A", "Option B", "Option C"],
          "correctIndex": 1,
          "explanation": "Detailed explanation of why Option B is correct and why other choices fail."
        }
      ]
    }
  ]
}
```

---

## Authoring & Seeding Workflow

1. **Course Creation:** Instructors and curriculum authors can define or edit courses directly in `academy/courses/<slug>.json`.
2. **Database Synchronization:** The backend seed script automatically ingests all course definitions into the MongoDB database:
   ```bash
   npm run seed:content
   ```
3. **Runtime Delivery:** The frontend fetches course curriculum through the authenticated `/api/courses` and `/api/lms/*` endpoints. Progress, quiz attempts, and completions are tracked per student account.
