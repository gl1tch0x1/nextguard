import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand" href="#home" aria-label="Nexguard home">
              <span className="brand-mark">
                <ShieldCheck size={22} />
              </span>
              <span>
                NEXGUARD<span className="brand-dot">.</span>
                <small>SECURITY / ENGINEERING</small>
              </span>
            </a>
            <p>
              Offensive security, intelligent engineering, and practical education for a more resilient digital world.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <b>EXPLORE</b>
              <a href="#services">Services</a>
              <a href="#academy">Academy</a>
              <a href="#research">Research & Labs</a>
            </div>
            <div>
              <b>CONNECT</b>
              <a href="#contact">Project inquiries</a>
              <a href="#approach">Our approach</a>
              <a href="#home">Back to top ↑</a>
            </div>
          </div>

          <div className="footer-stamp">
            <ShieldCheck size={24} />
            <span>SECURITY IS A PRACTICE.</span>
            <small>ETHICAL BY DESIGN / V2.0 ENHANCED</small>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} NEXGUARD. ALL RIGHTS RESERVED.</span>
          <span>DESIGNED FOR CLARITY. BUILT FOR TRUST.</span>
          <a href="#contact">Privacy & terms</a>
        </div>
      </div>
    </footer>
  );
}
