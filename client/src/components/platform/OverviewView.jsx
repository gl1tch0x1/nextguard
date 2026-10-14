import React from 'react';
import { ShieldCheck, BookOpen, FlaskConical, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function OverviewView({
  enrollments = [],
  labs = [],
  overview = null,
  onOpenCourse,
  onSwitchTab
}) {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Member';

  const totalCompletedLessons = enrollments.reduce(
    (acc, e) => acc + (e.completedLessons?.length || 0),
    0
  );

  return (
    <>
      <div className="platform-welcome">
        <div>
          <span className="platform-kicker">GOOD TO HAVE YOU HERE</span>
          <h3>Keep moving forward, {firstName}.</h3>
          <p>Learn the fundamentals, practice safely, and turn findings into better security.</p>
        </div>
        <ShieldCheck size={40} />
      </div>

      <div className="platform-stat-grid">
        <div>
          <small>ENROLLED COURSES</small>
          <b>{enrollments.length}</b>
        </div>
        <div>
          <small>LESSONS COMPLETED</small>
          <b>{totalCompletedLessons}</b>
        </div>
        <div>
          <small>AVAILABLE LABS</small>
          <b>{labs.length}</b>
        </div>
        {user?.role === 'administrator' && (
          <div>
            <small>OPEN INQUIRIES</small>
            <b>{overview?.openInquiries ?? '—'}</b>
          </div>
        )}
      </div>

      <div className="platform-subhead">
        <h3>Continue learning</h3>
        <button onClick={() => onSwitchTab('learning')}>View all →</button>
      </div>

      {enrollments.length > 0 ? (
        <div className="platform-course-list">
          {enrollments.slice(0, 3).map((e) => (
            <article className="platform-course-card" key={e._id}>
              <div className="platform-card-icon">
                <BookOpen size={20} />
              </div>
              <div className="platform-card-content">
                <small>{e.course?.category || 'COURSE'}</small>
                <h4>{e.course?.title}</h4>
                <div className="platform-progress">
                  <i style={{ width: `${e.progress || 0}%` }} />
                </div>
                <span>{e.progress || 0}% complete</span>
              </div>
              <button onClick={() => e.course && onOpenCourse(e.course)}>
                Open <span>↗</span>
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="platform-empty">
          <BookOpen size={24} />
          <b>Your learning path starts here.</b>
          <span>Choose a course below to enroll and track your progress.</span>
          <button onClick={() => onSwitchTab('learning')}>Browse courses →</button>
        </div>
      )}

      <div className="platform-subhead" style={{ marginTop: '24px' }}>
        <h3>Safe practice labs</h3>
        <button onClick={() => onSwitchTab('labs')}>Explore labs →</button>
      </div>
      <p className="platform-muted">
        Guided, non-executing exercises designed for learning and remediation.
      </p>
    </>
  );
}
