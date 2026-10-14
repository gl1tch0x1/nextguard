import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Accordion } from '../ui/accordion.jsx';
import { Button } from '../ui/button.jsx';

const METHODOLOGY_STEPS = [
  {
    id: 'step-01',
    number: '01',
    title: 'Scope with intent',
    badge: 'STAGE 1',
    description: 'Define assets, authorization, objectives, and rules of engagement before testing begins.',
    bullets: [
      'Comprehensive perimeter & CIDR block boundary mapping',
      'Rules of engagement (ROE) formalization & deconfliction windows',
      'Zero-trust threat surface & ingress/egress validation'
    ]
  },
  {
    id: 'step-02',
    number: '02',
    title: 'Assess with evidence',
    badge: 'STAGE 2',
    description: 'Validate meaningful risks with reproducible findings and a business-aware perspective.',
    bullets: [
      'Manual exploitation verifying real business logic bypasses',
      'Cryptographic proof-of-concept (PoC) artifact captures',
      'False-positive elimination through deterministic testing'
    ]
  },
  {
    id: 'step-03',
    number: '03',
    title: 'Explain what matters',
    badge: 'STAGE 3',
    description: 'Prioritize by context and impact, not just a scanner score or alarming headline.',
    bullets: [
      'Executive risk summaries translated into financial impact',
      'Deterministic CVSS v3.1 & CWE vector alignment',
      'Engineering-ready pull request diff recommendations'
    ]
  },
  {
    id: 'step-04',
    number: '04',
    title: 'Improve and verify',
    badge: 'STAGE 4',
    description: 'Deliver clear remediation guidance and, where agreed, validate the fixes.',
    bullets: [
      'Interactive re-test verification validating applied patches',
      'Continuous security pipeline gate integration (CI/CD)',
      'Signed verification certificate for enterprise compliance'
    ]
  }
];

export default function ApproachSection() {
  return (
    <section className="approach section-pad" id="approach">
      <div className="container approach-layout">
        <div className="approach-intro">
          <div className="eyebrow">
            <span className="eyebrow-line" /> OUR APPROACH / 02
          </div>
          <h2>
            Technical depth.<br />
            <span>Human clarity.</span>
          </h2>
          <p>
            Security work should do more than find problems. It should give your team the context, evidence, and next steps to make measurable improvements.
          </p>
          <Button
            as="a"
            href="#contact"
            variant="outline"
            size="default"
            ripple
          >
            How can we help? <ArrowUpRight size={16} />
          </Button>
        </div>

        <div className="approach-accordion-wrap">
          <Accordion
            items={METHODOLOGY_STEPS}
            defaultValue="step-01"
            allowMultiple={false}
          />
        </div>
      </div>
    </section>
  );
}
