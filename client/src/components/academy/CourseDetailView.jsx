import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Quiz from './Quiz.jsx';

export default function CourseDetailView({
  course,
  onBack,
  onCompleteLesson,
  onQuizCompleted
}) {
  if (!course) return null;

  const lessons = course.lessons || [];

  return (
    <>
      <button className="platform-back" onClick={onBack}>
        ← Back to courses
      </button>

      <p className="platform-muted">{course.summary}</p>

      {lessons.length === 0 && (
        <div className="platform-empty">
          This course has no lessons published yet. An instructor can add content from the course authoring workflow.
        </div>
      )}

      {lessons.map((l, i) => (
        <article className="platform-lesson" key={l._id || i}>
          <div>
            <span>
              LESSON {String(i + 1).padStart(2, '0')} · {l.durationMinutes || 10} MIN
            </span>
            <h4>{l.title}</h4>
            <p>{l.summary}</p>
            <div className="platform-lesson-content" style={{ whiteSpace: 'pre-wrap' }}>
              {l.content || 'Lesson content will be added by the instructor.'}
            </div>
          </div>

          <button onClick={() => onCompleteLesson(l)}>
            <CheckCircle2 size={15} /> Mark complete
          </button>

          {l.quiz && l.quiz.length > 0 && (
            <Quiz
              lesson={l}
              courseId={course._id}
              onQuizCompleted={onQuizCompleted}
            />
          )}
        </article>
      ))}
    </>
  );
}
