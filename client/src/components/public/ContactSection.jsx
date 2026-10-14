import React, { useState } from 'react';
import { LockKeyhole, Mail, ArrowUpRight, Github, Linkedin, Crosshair } from 'lucide-react';
import { postJson } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { AlertDialog } from '../ui/alert-dialog.jsx';
import { Button } from '../ui/button.jsx';

export default function ContactSection({ preselectedService }) {
  const { showToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    service: 'VAPT',
    message: '',
    authorized: false,
    website: ''
  });
  const [status, setStatus] = useState({ state: '', text: '' });

  React.useEffect(() => {
    if (preselectedService) {
      const lower = preselectedService.toLowerCase();
      let matched = 'Other';
      if (lower.includes('vulnerability') || lower.includes('pentesting') || lower.includes('vapt')) matched = 'VAPT';
      else if (lower.includes('audit') || lower.includes('appsec')) matched = 'Security Audit';
      else if (lower.includes('red team') || lower.includes('adversary')) matched = 'Red Teaming';
      else if (lower.includes('web') || lower.includes('api engineering')) matched = 'Web Development';
      else if (lower.includes('network') || lower.includes('cloud') || lower.includes('infrastructure')) matched = 'Networking & IT';
      else if (lower.includes('ai') || lower.includes('automation') || lower.includes('llm')) matched = 'AI Security';
      
      setForm((prev) => ({
        ...prev,
        service: matched,
        message: prev.message || `Inquiring about ${preselectedService} scoping, timeline, and deliverables.`
      }));
    }
  }, [preselectedService]);

  const submitInquiry = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading', text: 'Sending your inquiry…' });

    try {
      const data = await postJson('/inquiries', form);
      setStatus({ state: 'success', text: data.message || 'Thanks! Your inquiry has been received.' });
      showToast('Inquiry sent successfully.', 'success');
      setDialogOpen(true);
      setForm({
        name: '',
        email: '',
        company: '',
        service: 'VAPT',
        message: '',
        authorized: false,
        website: ''
      });
    } catch (err) {
      const msg = err.message || 'Could not connect to the API. Please try again later.';
      setStatus({ state: 'error', text: msg });
      showToast(msg, 'error');
    }
  };

  const isTestingService = ['VAPT', 'Security Audit', 'Red Teaming'].includes(form.service);

  return (
    <>
      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> YOUR NEXT STEP / 06
            </div>
            <h2>
              Have a system to secure<br />
              or a skill to build?
            </h2>
          </div>
          <a href="#contact" className="btn btn-primary">
            Start a conversation <ArrowUpRight size={16} />
          </a>
          <div className="cta-crosshair">
            <Crosshair size={120} strokeWidth={0.6} />
          </div>
        </div>
      </section>

      <section className="contact section-pad" id="contact">
        <div className="container contact-layout">
          <div className="contact-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> CONTACT / 07
            </div>
            <h2>
              Tell us what<br />
              <span>you’re working on.</span>
            </h2>
            <p>
              Share a little context and we’ll identify the most useful next step. For security assessments, please do not include passwords, private keys, or sensitive production data.
            </p>

            <div className="contact-detail">
              <span className="contact-detail-icon">
                <Mail size={17} />
              </span>
              <div>
                <small>GENERAL INQUIRIES</small>
                <b>Use the secure inquiry form</b>
                <span>Response within 1 business day.</span>
              </div>
            </div>

            <div className="contact-detail">
              <span className="contact-detail-icon">
                <LockKeyhole size={17} />
              </span>
              <div>
                <small>RESPONSIBLE TESTING</small>
                <b>Authorization comes first</b>
                <span>Testing scope and rules are agreed in advance.</span>
              </div>
            </div>

            <div className="contact-social">
              <a href="https://github.com/" target="_blank" rel="noreferrer">
                <Github size={17} /> GitHub <ArrowUpRight size={12} />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noreferrer">
                <Linkedin size={17} /> LinkedIn <ArrowUpRight size={12} />
              </a>
            </div>
          </div>

          <form className="contact-form" onSubmit={submitInquiry}>
            <div className="form-heading">
              <div>
                <span>PROJECT INTAKE</span>
                <h3>Let’s make it concrete.</h3>
              </div>
              <span className="form-lock">
                <LockKeyhole size={17} /> PRIVATE BY DESIGN
              </span>
            </div>

            <div className="form-row">
              <label>
                Full name
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
              </label>
              <label>
                Business email
                <input
                  type="email"
                  required
                  maxLength={254}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Company <span className="optional">OPTIONAL</span>
                <input
                  maxLength={120}
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Organization"
                />
              </label>
              <label>
                I'm interested in
                <select
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                >
                  <option>VAPT</option>
                  <option>Security Audit</option>
                  <option>Red Teaming</option>
                  <option>Web Development</option>
                  <option>Networking & IT</option>
                  <option>AI Security</option>
                  <option>Training</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            <label>
              What do you need help with?
              <textarea
                required
                minLength={10}
                maxLength={4000}
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Goals, context, timeline, and anything useful to know…"
              />
            </label>

            {/* Honeypot field */}
            <label className="honeypot" aria-hidden="true" style={{ display: 'none' }}>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </label>

            {isTestingService && (
              <label className="check-label">
                <input
                  type="checkbox"
                  required
                  checked={form.authorized}
                  onChange={(e) => setForm({ ...form, authorized: e.target.checked })}
                />
                <span>
                  I confirm that any requested security testing will be limited to assets I own or am authorized to assess.
                </span>
              </label>
            )}

            <div className="form-submit-row">
              <Button
                variant="primary"
                size="lg"
                sheen
                ripple
                type="submit"
                disabled={status.state === 'loading'}
              >
                {status.state === 'loading' ? 'Sending…' : 'Send inquiry'} <ArrowUpRight size={16} />
              </Button>
              <span>
                <LockKeyhole size={13} /> Don’t submit secrets or credentials.
              </span>
            </div>

            {status.text && (
              <div className={`form-status ${status.state}`} role="status">
                {status.text}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Animate UI & Shadcn AlertDialog Confirmation */}
      <AlertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variant="success"
        title="Inquiry Confirmed & Dispatched"
        description="Your technical project inquiry has been cryptographically signed and routed to the Nexguard Security Operations team. A senior security engineer will review your scope parameters within 24 hours."
        confirmLabel="Acknowledge Brief"
        cancelLabel="Dismiss"
      />
    </>
  );
}
