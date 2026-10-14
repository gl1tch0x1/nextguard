import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { postJson } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Quiz({ lesson, courseId, onQuizCompleted }) {
  const { showToast } = useToast();
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!lesson || !lesson.quiz || lesson.quiz.length === 0) return null;

  const handleSelect = (questionIndex, optionIndex) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedAnswers = lesson.quiz.map((_, i) => answers[i]);

    if (formattedAnswers.some((a) => a === undefined)) {
      showToast('Please answer all questions before submitting.', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const data = await postJson(`/lms/courses/${courseId}/lessons/${lesson._id}/quiz`, {
        answers: formattedAnswers
      });
      setResult(data);
      if (data.passed) {
        showToast(`Quiz Passed! Score: ${data.percentage}%`, 'success');
      } else {
        showToast(`Quiz completed. Score: ${data.percentage}%. Passing is 70%.`, 'info');
      }
      if (onQuizCompleted) onQuizCompleted();
    } catch (err) {
      showToast(err.message || 'Could not submit quiz.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="platform-quiz-box">
      <div className="quiz-header">
        <h4>Knowledge Check</h4>
        <span className="quiz-subtitle">{lesson.quiz.length} Questions · 70% to Pass</span>
      </div>

      <form onSubmit={handleSubmit}>
        {lesson.quiz.map((q, qIndex) => {
          const explanation = result?.explanations?.[qIndex];
          const isSubmitted = Boolean(result);

          return (
            <div key={q._id || qIndex} className="quiz-question-card">
              <p className="quiz-question-text">
                <span className="q-badge">Q{qIndex + 1}</span> {q.question}
              </p>

              <div className="quiz-options">
                {q.options.map((opt, oIndex) => {
                  const isSelected = answers[qIndex] === oIndex;
                  let optionClass = 'quiz-option';

                  if (isSubmitted) {
                    if (oIndex === explanation?.correctIndex) optionClass += ' correct';
                    else if (isSelected && !explanation?.isCorrect) optionClass += ' incorrect';
                  } else if (isSelected) {
                    optionClass += ' selected';
                  }

                  return (
                    <button
                      type="button"
                      key={oIndex}
                      className={optionClass}
                      onClick={() => handleSelect(qIndex, oIndex)}
                      disabled={isSubmitted || submitting}
                    >
                      <span className="opt-radio">{isSelected ? '●' : '○'}</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {explanation && (
                <div className={`quiz-explanation ${explanation.correctIndex === answers[qIndex] ? 'pass' : 'fail'}`}>
                  {explanation.correctIndex === answers[qIndex] ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{explanation.explanation}</span>
                </div>
              )}
            </div>
          );
        })}

        {!result ? (
          <button type="submit" className="btn-submit-quiz" disabled={submitting}>
            {submitting ? 'Evaluating Answers…' : 'Submit Knowledge Check'}
          </button>
        ) : (
          <div className="quiz-score-banner">
            <div>
              <strong>Final Score: {result.score} / {result.total} ({result.percentage}%)</strong>
              <span>{result.passed ? 'Demonstrated mastery!' : 'Review the explanations and retry.'}</span>
            </div>
            {!result.passed && (
              <button
                type="button"
                className="btn-retry-quiz"
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                }}
              >
                Retry Quiz <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
