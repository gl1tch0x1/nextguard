/**
 * Comprehensive Technical Learning Curricula for Nexguard Academy
 * Detailed, objective-driven syllabi, hands-on lab environments,
 * tools mastered, and real-world capstone competencies.
 */

export const LEARNING_DETAILS = {
  'cyber-foundations': {
    slug: 'cyber-foundations',
    title: 'Cybersecurity Foundations',
    category: 'Foundations',
    level: 'Beginner',
    duration: '4 weeks',
    modulesCount: 4,
    labsCount: 3,
    summary: 'Build a rigorous mental model of security principles, threat modeling, cryptographic foundations, identity management, and defensive operations.',
    heroSubtitle: 'Move beyond high-level buzzwords to master core security architecture, risk calculation, trust boundaries, and least-privilege defense.',
    prerequisites: ['Basic computer literacy', 'Familiarity with general OS concepts'],
    tools: ['OpenSSL', 'Wireshark', 'STRIDE Matrix', 'Hashcat', 'KeePassXC', 'OWASP ASVS'],
    targetAudience: 'Aspiring security analysts, software engineers transitioning into security, and IT systems administrators.',
    overview: {
      philosophy: 'Real-world cybersecurity begins not with tools, but with threat modeling and understanding systemic risk. This track establishes an uncompromising foundation in how adversaries think, how security controls function mathematically and structurally, and how modern defensive architectures isolate critical assets.',
      highlights: [
        'STRIDE & DREAD Threat Modeling frameworks applied to real application architectures.',
        'Cryptographic primitives: AES-256-GCM, RSA/ECC, SHA-3, HMAC, and PKI certificate chains.',
        'Server-side access control models: DAC, MAC, RBAC, ABAC, and Zero Trust identity fabrics.',
        'Defense-in-depth principles: endpoint isolation, network zoning, and SIEM event correlation.'
      ]
    },
    modules: [
      {
        id: 'mod-1',
        number: '01',
        title: 'First Principles of Cyber Defense & Threat Modeling',
        duration: '1 week',
        summary: 'Establish security objectives based on asset valuation, attacker economics, and structured threat modeling.',
        topics: [
          'The CIA Triad expanded: Confidentiality, Integrity, Availability, Non-Repudiation, and Auditability',
          'Asset inventory, attack surfaces, and defining verifiable trust boundaries',
          'Deconstructing STRIDE: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege',
          'Risk scoring matrices: DREAD vs CVSS v3.1 qualitative calculations'
        ],
        labExercise: {
          title: 'Threat Modeling a Banking Microservices Cluster',
          description: 'Draw trust boundaries across API gateways, auth servers, and database tiers. Identify 6 structural vulnerabilities using the STRIDE matrix.'
        }
      },
      {
        id: 'mod-2',
        number: '02',
        title: 'Cryptographic Primitives & Key Management',
        duration: '1 week',
        summary: 'Understand the mathematical foundations of encryption, hashing, digital signatures, and public key infrastructure.',
        topics: [
          'Symmetric vs Asymmetric encryption: AES-GCM authenticated modes vs ChaCha20-Poly1305',
          'Elliptic Curve Cryptography (ECC) vs RSA: Curve25519, key lengths, and performance trade-offs',
          'Cryptographic hash functions (SHA-256, SHA-3) and password storage (Argon2id, bcrypt, scrypt)',
          'Public Key Infrastructure (PKI): X.509 certificates, Certificate Authorities, and OCSP revocation'
        ],
        labExercise: {
          title: 'Building a Private PKI Hierarchy with OpenSSL',
          description: 'Generate Root and Intermediate CAs, issue signed TLS certificates with SAN extensions, and inspect certificate chain validation failures.'
        }
      },
      {
        id: 'mod-3',
        number: '03',
        title: 'Identity, Authentication & Access Control',
        duration: '1 week',
        summary: 'Architect resilient identity fabrics and enforce impenetrable server-side authorization boundaries.',
        topics: [
          'Authentication mechanisms: Multi-Factor Authentication (FIDO2/WebAuthn, TOTP) and session security',
          'Modern identity federation: OAuth 2.0 authorization grants, OpenID Connect (OIDC), and SAML',
          'Token security architecture: JWT structure, signature validation pitfalls, and refresh token rotation',
          'Enforcing server-side authorization: Role-Based (RBAC) and Attribute-Based (ABAC) access controls'
        ],
        labExercise: {
          title: 'Auditing and Hardening Insecure JWT Implementations',
          description: 'Identify common JWT flaws (algorithm confusion, missing signature verification, lack of expiration) and implement secure server-side validation.'
        }
      },
      {
        id: 'mod-4',
        number: '04',
        title: 'Defensive Operations, Logging & Incident Response',
        duration: '1 week',
        summary: 'Monitor systems, correlate telemetry, and execute structured containment during security incidents.',
        topics: [
          'Defense-in-Depth: defense layering from physical controls to database encryption',
          'Security Information and Event Management (SIEM): log ingestion, normalization, and detection alerts',
          'The Incident Response Lifecycle: Preparation, Detection, Containment, Eradication, and Lessons Learned',
          'Security hygiene: vulnerability scanning, patch orchestration, and configuration baselines'
        ],
        labExercise: {
          title: 'Incident Triage & Containment Simulation',
          description: 'Analyze mock firewall and authentication logs to trace an unauthorized account takeover, extract IoCs, and formulate an emergency containment plan.'
        }
      }
    ],
    capstone: {
      title: 'Enterprise Threat Model & Defense Architecture Defense',
      description: 'You will be handed an architectural blueprint of an e-commerce platform handling payments. You must produce a comprehensive STRIDE threat model, specify exact cryptographic controls for data at rest and in transit, design the RBAC authorization schema, and draft an incident response runbook.'
    }
  },

  'network-linux': {
    slug: 'network-linux',
    title: 'Networking & Linux for Security',
    category: 'Infrastructure',
    level: 'Beginner',
    duration: '6 weeks',
    modulesCount: 4,
    labsCount: 4,
    summary: 'Master TCP/IP packet dissection, network protocol security, Linux internals, POSIX permissions, process isolation, and firewall hardening.',
    heroSubtitle: 'Deep dive into binary network protocols, kernel security abstractions, and command-line mastery required for offensive and defensive operations.',
    prerequisites: ['Basic command-line terminal familiarity', 'Understanding of basic OS filesystem concepts'],
    tools: ['Wireshark', 'tcpdump', 'tshark', 'Nmap', 'nftables', 'systemd-analyze', 'AppArmor', 'strace'],
    targetAudience: 'Engineers needing rock-solid infrastructure grounding for penetration testing, SOC analysis, and cloud security.',
    overview: {
      philosophy: 'Security professionals cannot protect or attack systems they do not understand at the byte level. This track removes all abstraction, dissecting raw Ethernet frames, TCP state machines, kernel process management, and POSIX privilege boundaries.',
      highlights: [
        'Packet-level dissection: TCP handshakes, sequence numbers, fragmentation, and ARP spoofing.',
        'Network infrastructure: DNS resolution hierarchies, DNSSEC, BGP security, and TLS 1.3 handshakes.',
        'Linux kernel architecture: ELF binaries, namespaces, cgroups, file permissions, and SUID exploitation.',
        'Hardening production Linux: nftables firewalls, systemd sandboxing, and AppArmor mandatory access controls.'
      ]
    },
    modules: [
      {
        id: 'mod-1',
        number: '01',
        title: 'Deep-Dive Packet Analysis & Protocol Dissection',
        duration: '1.5 weeks',
        summary: 'Inspect live network traffic at the packet level to diagnose attacks and protocol anomalies.',
        topics: [
          'OSI 7-Layer model vs TCP/IP 4-Layer stack in operational practice',
          'Ethernet framing, ARP address resolution, and Layer 2 ARP poisoning attacks',
          'IPv4/IPv6 packet headers, MTU fragmentation, and ICMP messaging',
          'TCP connection state machine: SYN/ACK handshakes, window sizing, sequence validation, and teardowns'
        ],
        labExercise: {
          title: 'Wireshark Protocol Dissection & Malicious Flow Detection',
          description: 'Capture and inspect live PCAP streams using Wireshark and tshark. Identify port scans, SYN floods, and cleartext credential leaks.'
        }
      },
      {
        id: 'mod-2',
        number: '02',
        title: 'Internet Core Infrastructure: DNS, Routing & TLS',
        duration: '1.5 weeks',
        summary: 'Examine the protocols that power the global Internet and the vulnerabilities inherent in their designs.',
        topics: [
          'DNS resolution flow: Root hints, TLDs, authoritative servers, caching, and DNS spoofing',
          'Routing protocols: Autonomous Systems, BGP route advertisements, and BGP route leaks',
          'Application protocols: HTTP/1.1 vs HTTP/2 vs HTTP/3, SMTP, and SSH architecture',
          'TLS 1.3 cryptographic handshake: Ephemeral Diffie-Hellman, SNI encryption, and session resumption'
        ],
        labExercise: {
          title: 'Detecting Rogue DNS Spoofing on a Simulated Subnet',
          description: 'Deploy a DNS inspection proxy, analyze cache poisoning vectors, and configure DNS-over-HTTPS (DoH) with certificate validation.'
        }
      },
      {
        id: 'mod-3',
        number: '03',
        title: 'Linux Internals, POSIX Permissions & Process Execution',
        duration: '1.5 weeks',
        summary: 'Explore the Linux kernel execution model, file modes, UID/GID security, and privilege escalation vectors.',
        topics: [
          'Linux filesystem hierarchy (FHS), inode tables, and mount namespaces',
          'POSIX permissions (rwx), umask calculations, sticky bits, and SUID/SGID execution security',
          'Linux processes: fork/exec lifecycle, virtual memory spaces, procfs (`/proc`), and strace system calls',
          'Linux Capabilities (`cap_net_bind_service`, `cap_sys_admin`) as alternatives to full root execution'
        ],
        labExercise: {
          title: 'Auditing SUID Binaries & Misconfigured Sudo Rules',
          description: 'Enumerate misconfigured SUID binaries and sudoers entries on a Debian server and craft secure capability profiles to replace root privileges.'
        }
      },
      {
        id: 'mod-4',
        number: '04',
        title: 'Host Hardening, Sandboxing & Linux Firewalls',
        duration: '1.5 weeks',
        summary: 'Transform standard Linux installations into battle-hardened bastions with minimal attack surfaces.',
        topics: [
          'Stateful packet filtering with `nftables`: tables, chains, connection tracking, and rate limiting',
          'Hardening systemd services: `ProtectSystem`, `ProtectHome`, `NoNewPrivileges`, and `PrivateTmp`',
          'Mandatory Access Control (MAC): AppArmor profile creation, enforcement modes, and audit logs',
          'SSH hardening: Public key authentication, Ed25519 keys, disabling root logins, and Fail2ban integration'
        ],
        labExercise: {
          title: 'Building a Zero-Trust Linux Bastion with nftables & AppArmor',
          description: 'Construct a multi-tiered nftables firewall, sandbox an untrusted web daemon using systemd security directives, and verify AppArmor confinement.'
        }
      }
    ],
    capstone: {
      title: 'Infrastructure Triage & Hardening Challenge',
      description: 'You are provided access to a compromised Linux server on an active network. You must identify unauthorized background processes, analyze network connections using tshark and netstat, isolate the rogue process, remediate root privilege escalation flaws, and implement an nftables defense policy.'
    }
  },

  'web-appsec': {
    slug: 'web-appsec',
    title: 'Web Application Security',
    category: 'Application Security',
    level: 'Intermediate',
    duration: '6 weeks',
    modulesCount: 4,
    labsCount: 4,
    summary: 'Master OWASP Top 10 vulnerabilities, manual HTTP request manipulation, injection flaws, cross-site exploitation, access control testing, and secure remediation.',
    heroSubtitle: 'Learn modern web application security from the ground up through hands-on intercept proxies, manual payload crafting, and developer-level remediation.',
    prerequisites: ['Cybersecurity Foundations or equivalent', 'Basic JavaScript, HTML, and HTTP request understanding'],
    tools: ['Burp Suite Professional', 'OWASP ZAP', 'Postman', 'Semgrep', 'SQLMap', 'Caido'],
    targetAudience: 'Penetration testers, web developers, security champions, and AppSec engineers.',
    overview: {
      philosophy: 'Automated scanners miss the most critical web vulnerabilities—logic flaws, broken authorization, and complex multi-step exploits. This course trains you to think like an adversary: understanding how browsers process data, how APIs validate input, and how to surgically identify flaw patterns.',
      highlights: [
        'Deep interception proxy workflows using Burp Suite: Repeater, Intruder, Match & Replace, and extensions.',
        'SQL injection: boolean blind, time-based blind, union-based, and second-order injections.',
        'Cross-Site Scripting (XSS): DOM-based, Reflected, Stored, and CSP bypass techniques.',
        'Broken Object Level Authorization (BOLA/IDOR) & Server-Side Request Forgery (SSRF) in cloud environments.'
      ]
    },
    modules: [
      {
        id: 'mod-1',
        number: '01',
        title: 'Modern Web Architecture & Injection Vulnerabilities',
        duration: '1.5 weeks',
        summary: 'Deconstruct HTTP request/response pipelines and trace untrusted input across database engines.',
        topics: [
          'Intercepting proxies: mastering Burp Suite Repeater, Intruder, and custom macro workflows',
          'SQL Injection fundamentals: syntax breakdown, error-based, UNION-based data extraction',
          'Blind SQL Injection: Boolean inference and time-delay timing attacks against Postgres and MySQL',
          'Remediation: Parameterized queries, ORM safety boundaries, and defensive database account configurations'
        ],
        labExercise: {
          title: 'Manual Blind SQL Injection Data Extraction',
          description: 'Extract administrator password hashes from a vulnerable backend using manual binary-search time-based blind payloads in Burp Suite.'
        }
      },
      {
        id: 'mod-2',
        number: '02',
        title: 'Client-Side Exploitation & Browser Defense Architecture',
        duration: '1.5 weeks',
        summary: 'Analyze how browsers execute client code and prevent cross-origin data theft.',
        topics: [
          'Same-Origin Policy (SOP), Cross-Origin Resource Sharing (CORS) misconfigurations, and postMessage security',
          'Cross-Site Scripting (XSS): Reflected, Stored, and DOM-based vulnerability sinks (`eval`, `innerHTML`)',
          'Cross-Site Request Forgery (CSRF): SameSite cookie attributes (Strict, Lax, None) and anti-CSRF token lifecycle',
          'Content Security Policy (CSP): Nonce-based policies, hash-based policies, and bypassing insecure wildcards'
        ],
        labExercise: {
          title: 'Exploiting DOM XSS and Authoring a Nonced CSP',
          description: 'Trace an unsanitized URL hash into an innerHTML sink, execute proof-of-concept DOM XSS, and then author a bulletproof CSP 3 configuration to eliminate the vulnerability.'
        }
      },
      {
        id: 'mod-3',
        number: '03',
        title: 'Authorization Flaws (BOLA/IDOR) & Business Logic Vulnerabilities',
        duration: '1.5 weeks',
        summary: 'Uncover the highest-impact vulnerability category in modern APIs: broken authorization and logic failures.',
        topics: [
          'Broken Object Level Authorization (BOLA / IDOR): testing vertical and horizontal privilege escalations',
          'Broken Function Level Authorization (BFLA): bypassing administrative endpoints through HTTP method tampering',
          'Business logic vulnerabilities: payment rounding flaws, multi-step checkout state manipulation, and race conditions',
          'Mass assignment vulnerabilities in JSON APIs (Node.js, Ruby on Rails, Spring Boot)'
        ],
        labExercise: {
          title: 'Auditing Multi-Tenant REST API for BOLA/IDOR Flaws',
          description: 'Inspect authenticated user sessions across multiple tenant workspaces, bypass access checks via identifier tampering, and rewrite controller middleware to enforce database-level tenant checks.'
        }
      },
      {
        id: 'mod-4',
        number: '04',
        title: 'Server-Side Request Forgery (SSRF) & Cloud Metadata Pivots',
        duration: '1.5 weeks',
        summary: 'Force servers to make unauthorized internal network requests to extract secrets and access private VPCs.',
        topics: [
          'SSRF anatomy: URL parsers, protocol schemes (`gopher://`, `file://`, `http://`), and DNS rebinding',
          'Cloud metadata attacks: targeting AWS IMDSv1 (`169.254.169.254`), GCP metadata, and Azure Instance Metadata',
          'Blind SSRF: out-of-band (OAST) interaction detection and internal service discovery',
          'Defending against SSRF: strict allowlisting, disabling redirects, and enforcing AWS IMDSv2 session tokens'
        ],
        labExercise: {
          title: 'SSRF to AWS Metadata Token Extraction',
          description: 'Leverage an image processing webhook to reach simulated internal cloud metadata endpoints, acquire temporary IAM role credentials, and implement an egress filtering fix.'
        }
      }
    ],
    capstone: {
      title: 'Full-Scope Web Application Security Assessment',
      description: 'Perform a comprehensive vulnerability assessment on a multi-tiered banking and transfers portal. Identify 5 high-severity vulnerabilities spanning SQLi, BOLA, CSRF, and SSRF. Submit a formal findings report with CVSS 3.1 scores, reproduction steps, and tested code fixes.'
    }
  },

  'bug-bounty': {
    slug: 'bug-bounty',
    title: 'Bug Bounty Methodology',
    category: 'Offensive Security',
    level: 'Intermediate',
    duration: 'Self-paced',
    modulesCount: 4,
    labsCount: 3,
    summary: 'Master modern external attack surface management, automated reconnaissance pipelines, JavaScript reverse engineering, and professional vulnerability reporting.',
    heroSubtitle: 'Learn high-signal reconnaissance, asset discovery, and professional proof-of-concept documentation for top commercial bug bounty programs.',
    prerequisites: ['Web Application Security or practical understanding of web vulnerabilities', 'Basic scripting with Python or Bash'],
    tools: ['subfinder', 'httpx', 'amass', 'katana', 'ffuf', 'nuclei', 'Burp Suite Pro'],
    targetAudience: 'Independent security researchers, bug hunters, and external penetration testers.',
    overview: {
      philosophy: 'Success in modern bug bounty programs is not about running noisy scanners against standard targets. It is about wide, high-fidelity reconnaissance to discover forgotten assets, deep reverse engineering of complex client-side applications, and authoring clear, respectful reports that make triage effortless.',
      highlights: [
        'Mass reconnaissance: passive DNS, certificate transparency, ASN expansion, and live host filtering.',
        'JavaScript analysis: extracting hidden API routes and development credentials from minified bundles.',
        'High-speed content discovery: parameter fuzzing with ffuf and custom contextual wordlists.',
        'Vulnerability reporting: writing undeniable proof-of-concepts, CVSS calculation, and triager communication.'
      ]
    },
    modules: [
      {
        id: 'mod-1',
        number: '01',
        title: 'Attack Surface Mapping & High-Velocity Reconnaissance',
        duration: 'Self-paced (10 hrs)',
        summary: 'Discover subdomains, cloud buckets, and external network ranges before other researchers.',
        topics: [
          'Scope analysis: interpreting program guidelines, in-scope domains, and out-of-scope boundaries',
          'Passive DNS enumeration & Certificate Transparency logs (`crt.sh`, Censys, Shodan)',
          'Active subdomain discovery: permutations, DNS resolution with `puredns`, and ASN CIDR mapping',
          'Live host filtering and technology profiling using `httpx` and header fingerprinting'
        ],
        labExercise: {
          title: 'Automating an End-to-End Recon Pipeline',
          description: 'Construct a modular Bash/Python workflow chaining subfinder, amass, and httpx to discover 200+ live subdomains and output organized technical profiles.'
        }
      },
      {
        id: 'mod-2',
        number: '02',
        title: 'JavaScript Reverse Engineering & Hidden Endpoint Discovery',
        duration: 'Self-paced (12 hrs)',
        summary: 'Deconstruct modern single-page applications to uncover unauthenticated APIs and leaked secrets.',
        topics: [
          'Crawling modern web apps with `katana` and headless Chrome runners',
          'De-minifying and formatting Webpack bundles and source maps',
          'Automated regex extraction: finding API keys, OAuth client secrets, and staging URLs',
          'Analyzing client-side GraphQL schemas and Introspection queries'
        ],
        labExercise: {
          title: 'Extracting Undocumented Administrative Routes from Webpack Bundles',
          description: 'Reverse engineer a simulated production SPA bundle, reconstruct original TypeScript source maps, and locate an unauthenticated internal microservice endpoint.'
        }
      },
      {
        id: 'mod-3',
        number: '03',
        title: 'Targeted Content Discovery & Parameter Fuzzing',
        duration: 'Self-paced (10 hrs)',
        summary: 'Find hidden parameters, backup files, and administrative interfaces using surgical fuzzing.',
        topics: [
          'Mastering `ffuf`: directory recursion, virtual host fuzzing, and status filtering',
          'Parameter discovery: identifying unlinked GET/POST parameters using `arjun` and `ffuf`',
          'Curating contextual wordlists: harvesting target-specific terminology with `cewl`',
          'Historical asset discovery: mining Wayback Machine and Common Crawl archives'
        ],
        labExercise: {
          title: 'Precision Parameter Fuzzing on Internal Endpoints',
          description: 'Fuzz a hidden administrative handler to discover undocumented debugging parameters that disable authentication checks.'
        }
      },
      {
        id: 'mod-4',
        number: '04',
        title: 'Proof-of-Concept Quality, CVSS Scoring & Responsible Disclosure',
        duration: 'Self-paced (8 hrs)',
        summary: 'Draft professional bug reports that get accepted and rewarded at maximum bounty tiers.',
        topics: [
          'Safe testing rules: proving impact without accessing or altering third-party customer data',
          'Structuring the perfect vulnerability report: Summary, Steps to Reproduce, Impact, and Fix',
          'Accurately calculating CVSS v3.1 scores: Exploitability vs Impact metrics',
          'Handling duplicates, out-of-scope disputes, and constructive communication with program triage teams'
        ],
        labExercise: {
          title: 'Authoring a Comprehensive HackerOne Report',
          description: 'Given a complex vulnerability chain, draft a complete submission including curl commands, HTTP requests, a minimal non-destructive video script, and CVSS vector calculation.'
        }
      }
    ],
    capstone: {
      title: 'Full Bug Bounty Simulation on Staging Scope',
      description: 'Execute a full-scope methodology against an enterprise staging target. Perform passive and active recon, identify 3 valid vulnerabilities, and submit formal disclosure reports adhering to strict responsible disclosure standards.'
    }
  },

  'red-team': {
    slug: 'red-team',
    title: 'Red Teaming Fundamentals',
    category: 'Offensive Security',
    level: 'Advanced',
    duration: '8 weeks',
    modulesCount: 4,
    labsCount: 4,
    summary: 'Master adversary emulation, MITRE ATT&CK campaign planning, Command & Control (C2) architecture, Active Directory attacks, and detection deconfliction.',
    heroSubtitle: 'Simulate sophisticated real-world adversaries through disciplined objective-driven tradecraft, Active Directory lateral movement, and purple-team debriefs.',
    prerequisites: ['Networking & Linux for Security', 'Web Application Security', 'Strong familiarity with Windows Server concepts'],
    tools: ['BloodHound', 'Mimikatz', 'Sliver C2', 'Impacket', 'Sysmon', 'Wireshark', 'MITRE ATT&CK'],
    targetAudience: 'Senior penetration testers, red team operators, threat hunters, and purple team specialists.',
    overview: {
      philosophy: 'Red teaming is not an unfocused pentest. It is an objective-driven campaign designed to measure an organization’s detection, response, and resilience against real threat actors. We teach operational discipline: establishing written rules of engagement, maintaining opsec, and collaborating transparently with blue teams.',
      highlights: [
        'Adversary emulation: mapping threat intelligence (TTPs) using MITRE ATT&CK Navigator.',
        'Command & Control (C2): deploying redirectors, configuring malleable HTTP profiles, and managing egress.',
        'Active Directory exploitation: Kerberoasting, AS-REP roasting, BloodHound pathfinding, and DCSync.',
        'Purple Teaming: conducting transparent post-engagement debriefs that elevate the blue team’s telemetry.'
      ]
    },
    modules: [
      {
        id: 'mod-1',
        number: '01',
        title: 'Campaign Planning, Rules of Engagement & Threat Emulation',
        duration: '2 weeks',
        summary: 'Establish the operational, legal, and strategic foundations of an adversary simulation.',
        topics: [
          'Red Teaming vs Penetration Testing: understanding objective-driven engagements',
          'Authoring Rules of Engagement (RoE): scope boundaries, emergency stop procedures, and deconfliction protocols',
          'Threat Actor profiling: converting Cyber Threat Intelligence (CTI) reports into actionable ATT&CK matrices',
          'Operational Security (OPSEC): managing digital infrastructure, domain categorization, and attribution hygiene'
        ],
        labExercise: {
          title: 'Designing an Adversary Campaign Emulation Plan',
          description: 'Select an APT threat group, map their documented TTPs in MITRE ATT&CK Navigator, and author a comprehensive Rules of Engagement document including white cell communication channels.'
        }
      },
      {
        id: 'mod-2',
        number: '02',
        title: 'Command and Control (C2) Infrastructure & Staging',
        duration: '2 weeks',
        summary: 'Deploy resilient, stealthy operational infrastructure to coordinate remote adversary tradecraft.',
        topics: [
          'Modern C2 frameworks: Sliver, Mythic, and Havoc architecture and listener mechanics',
          'Multi-tier redirector architectures: Apache/Nginx reverse proxies, SSL certificates, and firewall egress',
          'Malleable C2 profiles: shaping HTTP traffic to blend into legitimate SaaS and CDN traffic',
          'Payload staging, delivery mechanisms, and handling endpoint telemetry artifacts'
        ],
        labExercise: {
          title: 'Deploying a Hardened C2 Infrastructure with Domain Fronting',
          description: 'Deploy a multi-tier C2 cluster with automated reverse proxy redirectors that filter security vendor sandbox probes and maintain resilient agent callbacks.'
        }
      },
      {
        id: 'mod-3',
        number: '03',
        title: 'Active Directory Exploitation & Lateral Movement',
        duration: '2 weeks',
        summary: 'Navigate and compromise enterprise Windows domain topologies using legitimate administrative protocols.',
        topics: [
          'Active Directory core primitives: Kerberos authentication, Domain Controllers, SPNs, and LDAP',
          'Domain reconnaissance with BloodHound & SharpHound: mapping shortest paths to Domain Admin',
          'Kerberos attacks: Kerberoasting service accounts, AS-REP roasting, and Golden/Silver ticket mechanics',
          'Lateral movement: WMI, WinRM, PsExec tradecraft, Pass-the-Hash (PtH), and token impersonation'
        ],
        labExercise: {
          title: 'BloodHound Graph Pathfinding & Kerberoasting in an Enterprise Domain',
          description: 'Ingest Active Directory telemetry into BloodHound, identify non-standard ACL permissions, extract vulnerable Kerberos service tickets with Impacket, and crack hashes offline.'
        }
      },
      {
        id: 'mod-4',
        number: '04',
        title: 'Defense Evasion & Purple Team Collaborative Debriefs',
        duration: '2 weeks',
        summary: 'Understand EDR telemetry generation and conduct constructive debriefs that empower defenders.',
        topics: [
          'Endpoint Detection & Response (EDR) mechanics: userland API hooking, kernel drivers, and Sysmon telemetry',
          'Living off the Land Binaries (LOLBAS): executing operational objectives with native Windows utilities',
          'Telemetry correlation: reviewing executed red team actions against SIEM logs and SOC alerts',
          'Purple Team workshops: authoring remediation engineering roadmaps that permanently elevate detection posture'
        ],
        labExercise: {
          title: 'Purple Team Telemetry Analysis & Detection Engineering',
          description: 'Execute a lateral movement sequence against a monitored host, compare the execution timestamp against Windows Event Logs and Sysmon, and engineer a Sigma detection rule.'
        }
      }
    ],
    capstone: {
      title: 'Full Adversary Emulation & Blue Team Debrief',
      description: 'Execute a multi-stage simulation against a simulated enterprise Active Directory domain. Obtain command execution, establish C2 persistence, navigate the domain graph to compromise a designated target asset, and conduct a detailed purple-team debrief identifying the exact detection signatures generated.'
    }
  },

  'ai-security': {
    slug: 'ai-security',
    title: 'AI for Cybersecurity',
    category: 'AI & Automation',
    level: 'Intermediate',
    duration: '5 weeks',
    modulesCount: 4,
    labsCount: 3,
    summary: 'Master the OWASP Top 10 for LLMs, prompt injection defenses, securing autonomous AI agents, automated vulnerability triage, and adversarial machine learning.',
    heroSubtitle: 'Explore the dual frontier of securing generative AI systems and leveraging responsible AI automation to supercharge security engineering workflows.',
    prerequisites: ['Python programming fundamentals', 'Basic application security concepts'],
    tools: ['LangChain', 'NeMo Guardrails', 'Semgrep', 'Garak LLM Scanner', 'OpenAI/Anthropic SDKs', 'ChromaDB'],
    targetAudience: 'Security engineers, AI/ML developers, DevSecOps teams, and technical architects building AI-powered platforms.',
    overview: {
      philosophy: 'AI is transforming cybersecurity in two complementary ways: it creates an entirely new attack surface requiring specialized defense, and it provides massive automation leverage for defensive workflows. This track covers both sides rigorously—teaching you how to audit AI agents for vulnerabilities and how to build reliable AI-driven security automation.',
      highlights: [
        'OWASP Top 10 for LLMs: Direct prompt injection, indirect prompt injection, and data poisoning.',
        'Securing autonomous AI agents: Tool sandboxing, privilege boundaries, and preventing rogue API execution.',
        'Automated security engineering: AI-assisted CVE triage, generating custom Semgrep rules, and code auditing.',
        'Guardrails & Defense: Implementing deterministic input/output filters with NeMo Guardrails and LangChain.'
      ]
    },
    modules: [
      {
        id: 'mod-1',
        number: '01',
        title: 'The AI Attack Surface: OWASP Top 10 for LLMs',
        duration: '1.5 weeks',
        summary: 'Deconstruct how attackers manipulate large language models and exploit untrusted prompt contexts.',
        topics: [
          'Anatomy of Prompt Injections: System prompts vs user inputs and delimiter escaping',
          'Indirect Prompt Injection: Poisoning web pages, PDFs, and emails to hijack autonomous agent context',
          'Data Poisoning and Model Inversion: Manipulating fine-tuning datasets and extracting training secrets',
          'Model Denial of Service (DoS): Resource exhaustion attacks via recursive reasoning or unbounded token generation'
        ],
        labExercise: {
          title: 'Exploiting Indirect Prompt Injection via Document Processing',
          description: 'Construct a malicious PDF containing invisible prompt injection instructions that hijack an automated customer support AI agent and exfiltrate internal system prompt data.'
        }
      },
      {
        id: 'mod-2',
        number: '02',
        title: 'Securing Autonomous Agents & Tool Interfaces',
        duration: '1 week',
        summary: 'Architect secure boundaries around AI models with external API keys and code execution tools.',
        topics: [
          'Agent architectures (ReAct, LangGraph) and the risks of uncontrolled tool invocation',
          'Preventing unauthorized function execution: strict parameter validation and human-in-the-loop gates',
          'Server-side credential hygiene: managing LLM API keys, rate limits, and egress network isolation',
          'Implementing deterministic JSON schema enforcement to block hallucinatory tool parameters'
        ],
        labExercise: {
          title: 'Securing an AI SQL Query Agent with Sandboxed Tool Access',
          description: 'Audit a vulnerable AI agent with direct database execution permissions, introduce strict read-only query parameterization, and enforce human confirmation gates for sensitive operations.'
        }
      },
      {
        id: 'mod-3',
        number: '03',
        title: 'AI-Assisted Security Operations & Vulnerability Triage',
        duration: '1.5 weeks',
        summary: 'Harness LLMs to accelerate vulnerability triage, write custom detection rules, and audit pull requests.',
        topics: [
          'Automating CVE analysis: ingesting vulnerability advisories and prioritizing exposure across software bills of materials (SBOMs)',
          'AI-assisted static code analysis: using LLMs to draft accurate Semgrep rules and reduce false positives',
          'Prompt engineering for threat modeling: generating automated STRIDE matrices from architecture specs',
          'Evaluating AI outputs: establishing regression tests and benchmarks to eliminate hallucinated findings'
        ],
        labExercise: {
          title: 'Building an Automated Pull-Request Security Reviewer',
          description: 'Develop a Python script leveraging local LLMs to inspect Git diffs, flag potential injection flaws, and automatically draft Semgrep test rules for continuous integration.'
        }
      },
      {
        id: 'mod-4',
        number: '04',
        title: 'Guardrail Engineering & Adversarial Machine Learning Defense',
        duration: '1 week',
        summary: 'Deploy deterministic, multi-layered defenses to safeguard production AI deployments.',
        topics: [
          'Guardrail architectures: NeMo Guardrails, Llama Guard, and custom regex/embedding classifiers',
          'Input sanitization, output masking, and differential privacy principles',
          'Continuous vulnerability assessment for AI: running automated fuzzers like Garak',
          'Compliance and governance: addressing EU AI Act security requirements and NIST AI RMF standards'
        ],
        labExercise: {
          title: 'Deploying Multi-Layered NeMo Guardrails on a Production LLM Gateway',
          description: 'Configure an AI gateway that intercepts incoming prompts, evaluates semantic intent against an adversarial classifier, and enforces strict output redacting for sensitive PII.'
        }
      }
    ],
    capstone: {
      title: 'Architecting an Enterprise AI Security Gateway & Benchmark',
      description: 'Design and deploy a production-grade AI security gateway. You will configure input classifiers to repel prompt injections, sandbox all downstream agent tool calls, enforce JSON schema validation, and benchmark the defense using the Garak vulnerability scanner to verify zero bypasses.'
    }
  }
};
