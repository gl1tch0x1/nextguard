import React, { useState } from 'react';
import { postJson } from '../../api/client.js';

export default function Quiz({ lesson, courseId, onQuizCompleted }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const formattedAnswers = lesson.quiz.map((_q, i) => Number(answers[i] ?? -1));
      const data = await postJson(`/lms/courses/${courseId}/lessons/${lesson._id}/quiz`, {
        answers: formattedAnswers
      });
      setResult(data);
      if (onQuizCompleted) {
        onQuizCompleted(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      setBusy(false);
    }
  };

  const allAnswered = Object.keys(answers).length === lesson.quiz.length;

  return (
    <div className="platform-quiz">
      <h4>Knowledge Check</h4>

      {error && <div className="platform-notice error">{error}</div>}

      {lesson.quiz.map((q, i) => (
        <fieldset key={q._id || i}>
          <legend>
            {i + 1}. {q.question}
          </legend>
          {q.options.map((option, j) => (
            <label key={j}>
              <input
                type="radio"
                name={`q-${lesson._id}-${i}`}
                checked={String(answers[i]) === String(j)}
                onChange={() => setAnswers({ ...answers, [i]: j })}
                disabled={busy}
              />
              {option}
            </label>
          ))}
          {result?.explanations && result.explanations[i]?.explanation && (
            <small style={{ display: 'block', marginTop: '6px', color: '#94a3b8' }}>
              💡 {result.explanations[i].explanation}
            </small>
          )}
        </fieldset>
      ))}

      <button onClick={submit} disabled={busy || !allAnswered}>
        {busy ? 'Evaluating…' : 'Submit Answers'}
      </button>

      {result && (
        <b style={{ marginLeft: '12px' }}>
          {result.passed ? '✅ Passed' : '🔄 Keep Practising'} · {result.score}/{result.total} ({result.percentage}%)
        </b>
      )}
    </div>
  );
}
