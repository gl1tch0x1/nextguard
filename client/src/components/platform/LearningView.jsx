import React from 'react';
import { BookOpen } from 'lucide-react';

export default function LearningView({
  courses = [],
  enrollments = [],
  onEnroll,
  onOpenCourse
}) {
  return (
    <>
      <p className="platform-muted">
        Enroll in a published course. Lessons and quiz questions are served from the API; your progress is saved to your account.
      </p>

      <div className="platform-course-list">
        {courses.map((c) => {
          const enrollment = enrollments.find((x) => x.course?._id === c._id);

          return (
            <article className="platform-course-card" key={c._id || c.slug}>
              <div className="platform-card-icon">
                <BookOpen size={20} />
              </div>
              <div className="platform-card-content">
                <small>{c.category} · {c.level}</small>
                <h4>{c.title}</h4>
                <p>{c.summary}</p>
                <span>
                  {enrollment
                    ? `${enrollment.progress || 0}% complete · ${enrollment.completedLessons?.length || 0} lessons done`
                    : c.duration || 'Self-paced'}
                </span>
              </div>

              {enrollment ? (
                <button onClick={() => onOpenCourse(enrollment.course || c)}>
                  Continue ↗
                </button>
              ) : c._id ? (
                <button onClick={() => onEnroll(c)}>
                  Enroll +
                </button>
              ) : (
                <span className="platform-sample-tag">SAMPLE TRACK</span>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
