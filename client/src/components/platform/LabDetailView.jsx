import React, { useState } from 'react';
import { LockKeyhole, CheckCircle2 } from 'lucide-react';

export default function LabDetailView({ lab, onBack, onSaveLab }) {
  const [notes, setNotes] = useState(lab?.session?.notes || '');
  const [busy, setBusy] = useState(false);

  if (!lab) return null;

  const handleSave = async (status) => {
    setBusy(true);
    try {
      await onSaveLab(notes, status);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button className="platform-back" onClick={onBack}>
        ← Back to labs
      </button>

      <div className="platform-lab-detail">
        <span className="platform-kicker">
          {lab.level} / {lab.estimatedMinutes} MIN
        </span>
        <h3>{lab.title}</h3>
        <p>{lab.objective}</p>

        <div className="platform-safety-note">
          <LockKeyhole size={17} />
          {lab.safety}
        </div>

        <h4>Exercise steps</h4>
        <ol>
          {(lab.steps || []).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>

        <h4>Challenge</h4>
        <p>{lab.challenge}</p>

        {lab.hints && lab.hints.length > 0 && (
          <details>
            <summary>Hint</summary>
            <p>{lab.hints.join(' ')}</p>
          </details>
        )}

        <label className="platform-field" style={{ marginTop: '16px' }}>
          Your notes / remediation plan
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Record your reasoning and proposed fixes…"
            disabled={busy}
          />
        </label>

        <div className="platform-lab-actions">
          <button onClick={() => handleSave('started')} disabled={busy}>
            {busy ? 'Saving…' : 'Save notes'}
          </button>
          <button className="platform-submit" onClick={() => handleSave('completed')} disabled={busy}>
            Complete exercise <CheckCircle2 size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
