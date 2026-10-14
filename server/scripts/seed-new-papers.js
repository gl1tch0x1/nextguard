import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Research from '../models/Research.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexguard');
  console.log('Connected to MongoDB');

  const papers = [
    {
      slug: 'continuous-purple-teaming-telemetry',
      category: 'RED TEAM',
      title: 'Continuous Purple Teaming: Translating Adversary Emulation into High-Fidelity Detections',
      summary: 'Closing the feedback loop between red-team simulation findings and SIEM/EDR detection engineering using automated validation pipelines.',
      readTimeMinutes: 12,
      authorName: 'Alex Mercer, CISSP & NexGuard Red Operations',
      authorRole: 'Head of Offensive Emulation & Detection Engineering',
      tags: ['Red Team', 'Blue Team', 'Detection Engineering', 'MITRE ATT&CK', 'Sigma', 'SIEM'],
      bannerImage: '/uploads/purple_team_banner.webp',
      pocImages: [
        {
          url: '/uploads/purple_team_banner.webp',
          title: 'Figure 01: Purple Team Operations Center Telemetry Flow',
          caption: 'Atomic adversary emulation translating into Sysmon event stream and automated Sigma SIEM rules.'
        },
        {
          url: '/uploads/poc_memory_leak.webp',
          title: 'Figure 02: LSASS Memory Access Telemetry Trace',
          caption: 'Sysmon Event ID 10 capturing unauthorized handle acquisition to lsass.exe.'
        }
      ],
      status: 'published'
    },
    {
      slug: 'indirect-prompt-injection-mitigation',
      category: 'AI SECURITY',
      title: 'Mitigating Indirect Prompt Injection in Autonomous Security Assistants',
      summary: 'Evaluating threat vectors when LLMs consume untrusted user inquiry feeds and database payloads, and formalizing semantic isolation guardrails.',
      readTimeMinutes: 14,
      authorName: 'Dr. Elena Rostova & NexGuard AI Red Team',
      authorRole: 'Lead AI Security Researcher & LLM Robustness Engineer',
      tags: ['AI Security', 'LLM Guardrails', 'Offensive AI', 'Prompt Injection', 'OWASP LLM01', 'SecOps'],
      bannerImage: '/uploads/prompt_guard_banner.webp',
      pocImages: [
        {
          url: '/uploads/prompt_guard_banner.webp',
          title: 'Figure 01: Dual-LLM Semantic Isolation Architecture',
          caption: 'Untrusted user inputs filtered by neural attention shield before entering safe execution environment.'
        },
        {
          url: '/uploads/cloud_oidc_banner.webp',
          title: 'Figure 02: Prompt Injection Vector Inspection',
          caption: 'Analyst telemetry audit exposing indirect injection payload in parsed ticket description.'
        }
      ],
      status: 'published'
    },
    {
      slug: 'zero-trust-spa-session-boundaries',
      category: 'ARCHITECTURE',
      title: 'Zero-Trust Architecture: Practical Token & Cookie Boundaries in SPAs',
      summary: 'An architectural review of session storage trade-offs in modern React applications, demonstrating defense-in-depth against credential extraction and cross-site request forgery.',
      readTimeMinutes: 11,
      authorName: 'Marcus Vance & NexGuard Architecture Group',
      authorRole: 'Principal Web Application Architect & AppSec Engineer',
      tags: ['Architecture', 'AppSec', 'Zero-Trust', 'JWT', 'Cookies', 'Session Security'],
      bannerImage: '/uploads/zero_trust_banner.webp',
      pocImages: [
        {
          url: '/uploads/zero_trust_banner.webp',
          title: 'Figure 01: Zero-Trust SPA & BFF Session Token Isolation',
          caption: 'Encrypted HttpOnly cookie enclave with strict same-site boundary preventing client script access.'
        },
        {
          url: '/uploads/poc_volatility_forensics.webp',
          title: 'Figure 02: DOM Memory Inspection Trace',
          caption: 'Memory scan verifying zero exposure of Bearer JWT credentials in browser heap.'
        }
      ],
      status: 'published'
    },
    {
      slug: 'ebpf-rootkit-evasion-memory-forensics',
      category: 'KERNEL SECURITY',
      title: 'Advanced eBPF Rootkits: Stealth Execution, Hook Trampoline Evasion & Memory Forensics',
      summary: 'A deep-dive analysis of modern Linux kernel rootkits operating via extended Berkeley Packet Filters (eBPF). Demonstrates how adversaries manipulate kernel probes and fexit trampolines without loading kernel modules, paired with Volatility memory forensics and verification countermeasures.',
      readTimeMinutes: 16,
      authorName: 'Dr. Nikolai Chen & NexGuard Kernel Security Lab',
      authorRole: 'Principal Kernel Exploit Researcher & Low-Level Security Architect',
      tags: ['eBPF', 'Kernel Security', 'Linux', 'Rootkits', 'Memory Forensics', 'Ring-0', 'EDR Evasion'],
      bannerImage: '/uploads/ebpf_rootkit_banner.webp',
      pocImages: [
        {
          url: '/uploads/ebpf_rootkit_banner.webp',
          title: 'Figure 01: In-Kernel BPF Bytecode Hooking Trampoline',
          caption: 'Kernel space memory trace showing bpf_probe_write_user overriding getdents64 directory listings.'
        },
        {
          url: '/uploads/poc_volatility_forensics.webp',
          title: 'Figure 02: Volatility 3 Memory Forensic Detection',
          caption: 'Kernel map scanner exposing orphaned BPF programs detached from userspace file descriptors.'
        }
      ],
      status: 'published'
    },
    {
      slug: 'cloud-identity-oidc-supply-chain-poisoning',
      category: 'CLOUD SECURITY',
      title: 'Cloud Identity Poisoning: Exploiting GitHub Actions OIDC Federation & IAM Role Chaining',
      summary: 'Comprehensive vulnerability research examining OpenID Connect (OIDC) federation between CI/CD runners and cloud providers. Demonstrates how permissive subject claim regexes and forked workflow triggers permit arbitrary infrastructure takeovers, coupled with zero-trust mitigation policies.',
      readTimeMinutes: 13,
      authorName: 'Devon Sterling & NexGuard Cloud Security Guild',
      authorRole: 'Head of Cloud Architecture & Infrastructure Defense',
      tags: ['Cloud Security', 'AWS IAM', 'OIDC', 'Supply Chain', 'GitHub Actions', 'GCP', 'Privilege Escalation'],
      bannerImage: '/uploads/cloud_oidc_banner.webp',
      pocImages: [
        {
          url: '/uploads/cloud_oidc_banner.webp',
          title: 'Figure 01: OIDC Identity Token Exchange Flow',
          caption: 'JWT claims decoding revealing wildcard sub claim repo:org/* matching attacker-controlled forks.'
        },
        {
          url: '/uploads/purple_team_banner.webp',
          title: 'Figure 02: Automated STS Role Chaining Telemetry',
          caption: 'AWS CloudTrail Event showing AssumeRoleWithWebIdentity pivot into production Terraform admin privileges.'
        }
      ],
      status: 'published'
    },
    {
      slug: 'zero-day-hypervisor-corruption',
      category: 'OFFENSIVE SECURITY',
      title: 'Zero-Day Kernel Memory Corruption in Virtualized Hypervisors',
      summary: 'Deep-dive exploit analysis examining ring-0 virtualization traps, virtio-net ring buffer memory corruption, and guest-to-host privilege escalation.',
      readTimeMinutes: 18,
      authorName: 'Dr. Nikolai Chen & NexGuard Virtualization Research',
      authorRole: 'Principal Hypervisor Exploit Researcher & Low-Level Security Architect',
      tags: ['Hypervisor', 'KVM', 'Xen', 'Ring-0 Escape', 'DMA Corruption', 'Type Confusion', 'VirtIO'],
      bannerImage: '/uploads/hypervisor_banner.webp',
      pocImages: [
        {
          url: '/uploads/hypervisor_banner.webp',
          title: 'Figure 01: Bare-Metal Hypervisor & VirtIO Memory Ring Escape',
          caption: 'Ring-0 virtualization trap and unmapped DMA memory access architecture diagram.'
        },
        {
          url: '/uploads/poc_memory_leak.webp',
          title: 'Figure 02: Phase 1: Memory Leak (ASLR Bypass)',
          caption: 'ASLR bypass via uninitialized ring buffer read and leaked host MMU kernel pointers.'
        }
      ],
      status: 'published'
    },
    {
      slug: 'instructor-field-report-kerberos-delegation',
      category: 'ACTIVE DIRECTORY',
      title: 'Instructor Field Report: Lateral Movement via Kerberos Unconstrained Delegation',
      summary: 'Field engagement post-mortem detailing how unconstrained delegation on legacy service accounts enables instantaneous Domain Controller impersonation and DCSync exploitation.',
      readTimeMinutes: 14,
      authorName: 'Marcus Vance & NexGuard Academy Red Division',
      authorRole: 'Senior Offensive Security Instructor & Red Team Operations Lead',
      tags: ['Active Directory', 'Kerberos', 'Unconstrained Delegation', 'TGT Harvesting', 'Mimikatz', 'DCSync'],
      bannerImage: '/uploads/kerberos_banner.webp',
      pocImages: [
        {
          url: '/uploads/kerberos_banner.webp',
          title: 'Figure 01: Kerberos Unconstrained Delegation Attack Diagram',
          caption: 'LSASS memory cache harvesting enabling KRBTGT Golden Ticket generation and DCSync replication.'
        },
        {
          url: '/uploads/poc_volatility_forensics.webp',
          title: 'Figure 02: LSASS Memory Dump Forensics',
          caption: 'Mimikatz memory dump showing DC01$ forwardable TGT captured on compromised application server.'
        }
      ],
      status: 'published'
    }
  ];

  for (const p of papers) {
    const updateObj = { ...p };
    const doc = await Research.findOneAndUpdate(
      { slug: p.slug },
      { $set: updateObj },
      { upsert: true, new: true }
    );
    console.log('Upserted paper:', doc.slug, 'ID:', doc._id, 'Banner:', doc.bannerImage);
  }

  const count = await Research.countDocuments({ status: 'published' });
  console.log('Total published research papers in MongoDB:', count);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
