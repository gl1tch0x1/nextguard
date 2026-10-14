import React from 'react';
import { BrainCircuit, Check, ShieldCheck, ArrowUpRight, Send } from 'lucide-react';
import GlitchHover from '../common/GlitchHover.jsx';

export default function CopilotSection({ onOpenChat }) {
  return (
    <section className="copilot-section">
      <div className="container copilot-panel">
        <div className="copilot-grid-bg" />
        <div className="copilot-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" /> AI LEARNING PARTNER / 04
          </div>
          <div className="copilot-title-row">
            <div className="copilot-icon">
              <BrainCircuit size={27} />
            </div>
            <span className="pill">
              <span className="status-dot" /> HUMAN-GUIDED AI
            </span>
          </div>

          <h2>
            Curiosity, meet<br />
            <GlitchHover as="span"><span>your copilot.</span></GlitchHover>
          </h2>

          <p>
            Explore security concepts, understand code risks, and get unstuck in a lab. Designed to help you reason better—not to replace your judgment.
          </p>

          <ul className="copilot-benefits">
            <li>
              <Check size={15} /> Concept explanations at your level
            </li>
            <li>
              <Check size={15} /> Secure coding and remediation guidance
            </li>
            <li>
              <Check size={15} /> Hints for authorized learning labs
            </li>
          </ul>

          <button className="btn btn-primary" onClick={onOpenChat}>
            Try the learning assistant <ArrowUpRight size={16} />
          </button>
          <small className="copilot-note">
            Runs via protected server API. Educational and authorized scenarios only.
          </small>
        </div>

        <div className="copilot-preview">
          <div className="chat-preview-head">
            <div className="mini-avatar">
              <BrainCircuit size={18} />
            </div>
            <div>
              <b>Nexguard Copilot</b>
              <span>SECURITY LEARNING ASSISTANT</span>
            </div>
            <span className="chat-online">
              <i /> READY
            </span>
          </div>

          <div className="chat-preview-body">
            <span className="chat-date">SAMPLE CONVERSATION / 001</span>
            <div className="chat-bubble user-bubble">
              How should I start reviewing an API securely?
            </div>
            <div className="chat-bubble bot-bubble">
              <span className="bot-label">
                <ShieldCheck size={13} /> COPILOT
              </span>
              Start with the documented scope and intended behavior. Map authentication, authorization, input validation, sensitive data, and rate limits. Test only approved endpoints, record reproducible evidence, and prioritize fixes by impact.
            </div>
            <div className="chat-suggestions">
              <span>Explain an HTTP header</span>
              <span>Review secure code</span>
            </div>
            <button className="preview-input" onClick={onOpenChat}>
              <span>Ask a security question…</span>
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
