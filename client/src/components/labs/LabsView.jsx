import React from 'react';
import { FlaskConical } from 'lucide-react';

export default function LabsView({ labs = [], onStartLab }) {
  return (
    <>
      <p className="platform-muted">
        These are safe, guided scenarios. The production API does not execute submitted code, launch scanners, or connect to arbitrary targets.
      </p>

      <div className="platform-lab-grid">
        {labs.map((l) => (
          <article key={l.slug} className="platform-lab-card">
            <div className="platform-lab-top">
              <FlaskConical size={20} />
              <span>{l.level?.toUpperCase()}</span>
            </div>
            <h3>{l.title}</h3>
            <p>{l.objective}</p>
            <small>{l.estimatedMinutes} MIN · GUIDED EXERCISE</small>

            {l.session && (
              <span className={`platform-lab-state ${l.session.status}`}>
                {l.session.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
              </span>
            )}

            <button onClick={() => onStartLab(l)}>
              {l.session ? 'Continue session' : 'Start lab'} ↗
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
