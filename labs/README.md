# Nexguard Security Labs — Interactive Practice Testbed

The **Nexguard Labs** directory houses both safe static cybersecurity exercises and isolated dynamic container environments.

---

## Directory Structure

```
labs/
├── docker/
│   └── docker-compose.yml       # Local isolated vulnerable testbed (e.g., OWASP Juice Shop)
├── docker-compose.yml           # Root-level convenience link for docker-compose up
├── scenarios/
│   ├── catalog.json             # Manifest of all interactive lab scenarios
│   ├── http-headers.json        # Exercise: HTTP Security Headers analysis & remediation
│   ├── access-control.json      # Exercise: Broken Access Control & IDOR review
│   ├── sqli-remediation.json    # Exercise: SQL Injection Root Cause & Parameterized Fix
│   ├── csrf-defense.json        # Exercise: Cross-Site Request Forgery & Token validation
│   └── xss-mitigation.json      # Exercise: Cross-Site Scripting & Contextual Encoding
└── README.md                    # Architecture and safety operational guidelines
```

---

## Core Security & Safety Guarantees

1. **Instructional Isolation:** The production API and server never run arbitrary student-supplied scripts, unvetted binaries, automated network scanners, or connect to third-party hosts.
2. **Deterministic Guided Scenarios:** Static exercises present realistic, real-world mock code snippets and network responses. Students analyze the flaw, formulate a remediation plan, and submit notes directly to their user profile.
3. **Local Docker Lab (Juice Shop):**
   - The included `docker-compose.yml` provides a local instance of OWASP Juice Shop pinned strictly to `127.0.0.1:3001`.
   - Running the local lab:
     ```bash
     cd labs
     docker compose up -d
     ```
   - It is configured with `cap_drop: [ALL]`, `read_only: true`, memory limits, and isolated internal bridge networking.
