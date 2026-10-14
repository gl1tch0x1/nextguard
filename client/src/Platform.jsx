import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ShieldCheck,
  LogOut,
  BookOpen,
  FlaskConical,
  LayoutDashboard,
  Users,
  ClipboardList,
  Layers3,
  FileText,
  RefreshCw,
  Sliders,
  GraduationCap,
  Sparkles,
  Command,
  ChevronRight,
  Maximize2,
  Minimize2,
  Activity,
  Radio,
  Clock,
  LockKeyhole
} from 'lucide-react';
import { apiRequest, postJson, patchJson } from './api/client.js';
import { useAuth } from './context/AuthContext.jsx';
import { useToast } from './context/ToastContext.jsx';

// Modular Platform Views
import AuthView from './components/platform/AuthView.jsx';
import OverviewView from './components/platform/OverviewView.jsx';
import LearningView from './components/academy/LearningView.jsx';
import CourseDetailView from './components/academy/CourseDetailView.jsx';
import LabsView from './components/labs/LabsView.jsx';
import LabDetailView from './components/labs/LabDetailView.jsx';
import InstructorStudioView from './components/admin/InstructorStudioView.jsx';
import AdminView from './components/admin/AdminView.jsx';

export default function Platform({ onClose, initialCourse = null }) {
  const { user, logout, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  // If user is administrator, default tab to 'admin', instructor to 'instructor', else 'overview'
  const [tab, setTab] = useState(() => (
    user?.role === 'administrator' ? 'admin' :
      user?.role === 'instructor' ? 'instructor' : 'overview'
  ));
  const [menuLayout, setMenuLayout] = useState('focused'); // 'focused' | 'all'
  const [loadingData, setLoadingData] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));



  // Monitor Native Fullscreen State
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => { });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
    }
  };

  // Sync default tab if user role changes after initial render
  useEffect(() => {
    if (user?.role === 'administrator' && tab === 'overview') {
      setTab('admin');
    }
  }, [user?.role]);

  // Platform Data
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [overview, setOverview] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [adminCourses, setAdminCourses] = useState([]);
  const [adminLabs, setAdminLabs] = useState([]);
  const [services, setServices] = useState([]);
  const [research, setResearch] = useState([]);
  const [users, setUsers] = useState([]);

  // Active items
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLab, setActiveLab] = useState(null);

  // Fetch relevant workspace data
  const refresh = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);

    try {
      const promises = [
        apiRequest('/courses').then((d) => setCourses(d.courses || [])),
        apiRequest('/lms/my-courses').then((d) => setEnrollments(d.enrollments || [])),
        apiRequest('/labs').then((d) => setLabs(d.labs || []))
      ];

      if (['instructor', 'administrator'].includes(user.role)) {
        promises.push(
          apiRequest('/instructor/courses').then((d) => setInstructorCourses(d.courses || []))
        );
      }

      if (user.role === 'administrator') {
        promises.push(
          apiRequest('/admin/overview').then((d) => setOverview(d || null)),
          apiRequest('/admin/inquiries').then((d) => setInquiries(d.inquiries || [])),
          apiRequest('/admin/users').then((d) => setUsers(d.users || [])),
          apiRequest('/courses?includeDrafts=true').then((d) => setAdminCourses(d.courses || [])),
          apiRequest('/labs?includeDrafts=true').then((d) => setAdminLabs(d.labs || [])),
          apiRequest('/services').then((d) => setServices(d.services || [])),
          apiRequest('/research?includeDrafts=true').then((d) => setResearch(d.research || []))
        );
      }

      await Promise.allSettled(promises);
    } catch (err) {
      showToast(err.message || 'Failed to sync platform records.', 'error');
    } finally {
      setLoadingData(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user, refresh]);

  // Open initial course if requested from landing page
  useEffect(() => {
    if (initialCourse && user) {
      openCourse(initialCourse);
    }
  }, [initialCourse, user]);

  // LMS actions
  const enroll = async (course) => {
    try {
      await postJson(`/lms/enroll/${course._id}`, {});
      showToast(`Enrolled in ${course.title}.`, 'success');
      await refresh();
      await openCourse(course);
    } catch (err) {
      showToast(err.message || 'Failed to enroll.', 'error');
    }
  };

  const openCourse = async (course) => {
    try {
      const data = await apiRequest(`/lms/courses/${course._id}`);
      setActiveCourse(data.course);
      setTab('course');
    } catch (err) {
      showToast(err.message || 'Unable to open course syllabus.', 'error');
    }
  };

  const completeLesson = async (lesson) => {
    if (!activeCourse) return;
    try {
      await postJson(`/lms/courses/${activeCourse._id}/lessons/${lesson._id}/complete`, {});
      showToast('Lesson marked complete.', 'success');
      await refresh();
      const updated = await apiRequest(`/lms/courses/${activeCourse._id}`);
      setActiveCourse(updated.course);
    } catch (err) {
      showToast(err.message || 'Could not update lesson progress.', 'error');
    }
  };

  // Lab actions
  const startLab = async (lab) => {
    try {
      const data = await postJson(`/labs/${lab.slug}/start`, {});
      setActiveLab({ ...lab, session: data.session });
      setTab('lab');
    } catch (err) {
      showToast(err.message || 'Could not start lab session.', 'error');
    }
  };

  const saveLabNotes = async (notes, status) => {
    if (!activeLab?.session?._id) return;
    try {
      const data = await patchJson(`/labs/${activeLab.session._id}`, { notes, status });
      setActiveLab({ ...activeLab, session: data.session });
      showToast(status === 'completed' ? 'Lab marked complete!' : 'Notes saved.', 'success');
      await refresh();
    } catch (err) {
      showToast(err.message || 'Could not save lab progress.', 'error');
    }
  };

  const isAdmin = user?.role === 'administrator';
  const isInstructor = user?.role === 'instructor' || isAdmin;
  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;

  const currentMode =
    (tab === 'admin' || tab.startsWith('admin-')) ? 'admin' :
      (tab === 'instructor' || tab.startsWith('instructor-')) ? 'instructor' : 'student';

  return (
    <div className="platform-backdrop" role="dialog" aria-modal="true" aria-label="Nexguard platform">
      <section className="platform-shell">
        {/* Top Header Bar */}
        <header className="platform-header">
          <div className="platform-brand">
            <span className="brand-shield-glow">
              <ShieldCheck size={22} />
            </span>
            <div>
              <div className="brand-title-wrap">
                <b>NEXGUARD COMMAND</b>
                <span className="version-pill">v2.0 PRO</span>
              </div>
              <small>ENTERPRISE CYBERSECURITY PLATFORM</small>
            </div>
          </div>

          <div className="platform-header-center">
            {(isAdmin || isInstructor) && (
              <div className="admin-view-toggle">
                {isAdmin && (
                  <button
                    className={`toggle-tab ${currentMode === 'admin' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('admin');
                      setActiveCourse(null);
                      setActiveLab(null);
                    }}
                    title="Operations Command"
                  >
                    <Command size={14} /> Operations Command
                  </button>
                )}

                <button
                  className={`toggle-tab ${currentMode === 'instructor' ? 'active' : ''}`}
                  onClick={() => {
                    setTab('instructor');
                    setActiveCourse(null);
                    setActiveLab(null);
                  }}
                  title="Instructor View"
                >
                  <Sliders size={14} /> Instructor View
                </button>

                <button
                  className={`toggle-tab ${currentMode === 'student' ? 'active' : ''}`}
                  onClick={() => {
                    setTab('overview');
                    setActiveCourse(null);
                    setActiveLab(null);
                  }}
                  title="Student View"
                >
                  <GraduationCap size={14} /> Student View
                </button>
              </div>
            )}
          </div>
          <div className="platform-header-actions">
            {user && (
              <div className="platform-user-pill">
                <div className="user-avatar-circle">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="user-meta">
                  <b>{user.name}</b>
                  <span className={`user-role-badge badge-${user.role}`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <button className="btn-icon-signout" onClick={logout} title="Sign out of platform">
                  <LogOut size={15} />
                </button>
              </div>
            )}

            <button
              className="platform-icon-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen (F11 / Esc)' : 'Enter Fullscreen (F11)'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>

            <button
              className="platform-exit-btn"
              onClick={onClose}
              title="Close and return to public website"
              aria-label="Exit Console"
            >
              <X size={17} />
              <span className="exit-btn-label">Exit</span>
            </button>
          </div>
        </header>

        {authLoading ? (
          <div className="platform-empty">
            <div className="loading-spinner" />
            <span>Validating enterprise session…</span>
          </div>
        ) : !user ? (
          <AuthView onSuccess={refresh} />
        ) : (
          <div className="platform-content">
            {/* Left Sidebar Navigation */}
            <aside className="platform-sidebar">
              {/* Sidebar Header & Layout Toggle */}
              {(isAdmin || isInstructor) && (
                <div className="platform-side-header">
                  <span className="platform-side-caption">
                    {menuLayout === 'all'
                      ? 'ALL WORKSPACES'
                      : currentMode === 'admin'
                        ? 'ADMINISTRATION & OPS'
                        : currentMode === 'instructor'
                          ? 'INSTRUCTOR STUDIO'
                          : 'STUDENT WORKSPACE'}
                  </span>
                  <button
                    className="btn-menu-layout-toggle"
                    onClick={() => setMenuLayout((m) => (m === 'focused' ? 'all' : 'focused'))}
                    title={menuLayout === 'focused' ? 'Show all sections in menu' : 'Focus menu to active mode'}
                  >
                    {menuLayout === 'focused' ? 'Expand All' : 'Focus View'}
                  </button>
                </div>
              )}

              {/* 1. ADMINISTRATION & OPS (Shown when in Admin mode, or when 'all' is selected) */}
              {isAdmin && (menuLayout === 'all' || currentMode === 'admin') && (
                <>
                  {menuLayout === 'all' && (
                    <div className="platform-side-caption">ADMINISTRATION & OPS</div>
                  )}
                  <button
                    className={`platform-nav-item ${tab === 'admin' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('admin');
                      setActiveCourse(null);
                      setActiveLab(null);
                    }}
                  >
                    <Command size={16} />
                    <span>Command Center</span>
                  </button>

                  <button
                    className={`platform-nav-item ${tab === 'admin-courses' ? 'active' : ''}`}
                    onClick={() => setTab('admin-courses')}
                  >
                    <BookOpen size={16} />
                    <span>Course Catalog</span>
                    {adminCourses.length > 0 && (
                      <span className="nav-counter">{adminCourses.length}</span>
                    )}
                  </button>

                  <button
                    className={`platform-nav-item ${tab === 'admin-labs' ? 'active' : ''}`}
                    onClick={() => setTab('admin-labs')}
                  >
                    <FlaskConical size={16} />
                    <span>Lab Scenarios</span>
                    {adminLabs.length > 0 && (
                      <span className="nav-counter">{adminLabs.length}</span>
                    )}
                  </button>

                  <button
                    className={`platform-nav-item ${tab === 'admin-inquiries' ? 'active' : ''}`}
                    onClick={() => setTab('admin-inquiries')}
                  >
                    <ClipboardList size={16} />
                    <span>Inquiries Desk</span>
                    {newInquiriesCount > 0 && (
                      <span className="nav-counter urgent">{newInquiriesCount}</span>
                    )}
                  </button>

                  <button
                    className={`platform-nav-item ${tab === 'admin-services' ? 'active' : ''}`}
                    onClick={() => setTab('admin-services')}
                  >
                    <Layers3 size={16} />
                    <span>Services</span>
                  </button>

                  <button
                    className={`platform-nav-item ${tab === 'admin-research' ? 'active' : ''}`}
                    onClick={() => setTab('admin-research')}
                  >
                    <FileText size={16} />
                    <span>Research Papers</span>
                  </button>

                  <button
                    className={`platform-nav-item ${tab === 'admin-users' ? 'active' : ''}`}
                    onClick={() => setTab('admin-users')}
                  >
                    <Users size={16} />
                    <span>Users & RBAC</span>
                  </button>

                  <button
                    className={`platform-nav-item ${tab === 'admin-security' ? 'active' : ''}`}
                    onClick={() => setTab('admin-security')}
                  >
                    <LockKeyhole size={16} />
                    <span>Security & Password</span>
                  </button>
                </>
              )}

              {/* 2. INSTRUCTOR STUDIO (Separated into its own first-class workspace) */}
              {isInstructor && (menuLayout === 'all' || currentMode === 'instructor') && (
                <>
                  <div className={`platform-side-caption ${menuLayout === 'all' ? 'platform-side-gap' : ''}`}>
                    INSTRUCTOR STUDIO
                  </div>
                  <button
                    className={`platform-nav-item ${tab === 'instructor' || tab.startsWith('instructor-') ? 'active' : ''}`}
                    onClick={() => {
                      setTab('instructor');
                      setActiveCourse(null);
                      setActiveLab(null);
                    }}
                  >
                    <Sliders size={16} />
                    <span>Instructor Studio</span>
                    {instructorCourses.length > 0 && (
                      <span className="nav-counter">{instructorCourses.length}</span>
                    )}
                  </button>
                </>
              )}

              {/* 3. STUDENT & ACADEMIC LEARNING */}
              {(menuLayout === 'all' || currentMode === 'student') && (
                <>
                  <div className={`platform-side-caption ${menuLayout === 'all' ? 'platform-side-gap' : ''}`}>
                    {isAdmin ? 'ACADEMIC & LEARNING' : 'STUDENT WORKSPACE'}
                  </div>

                  <button
                    className={`platform-nav-item ${tab === 'overview' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('overview');
                      setActiveCourse(null);
                      setActiveLab(null);
                    }}
                  >
                    <LayoutDashboard size={16} />
                    <span>My Progress</span>
                  </button>

                  <button
                    className={`platform-nav-item ${tab === 'learning' || tab === 'course' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('learning');
                      setActiveCourse(null);
                    }}
                  >
                    <GraduationCap size={16} />
                    <span>Enrolled LMS</span>
                  </button>

                  <button
                    className={`platform-nav-item ${tab === 'labs' || tab === 'lab' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('labs');
                      setActiveLab(null);
                    }}
                  >
                    <FlaskConical size={16} />
                    <span>Practice Labs</span>
                  </button>
                </>
              )}

              {/* Quick Jump Bar for Focused Mode */}
              {menuLayout === 'focused' && (isAdmin || isInstructor) && (
                <div className="platform-quick-switch-box">
                  {currentMode !== 'admin' && isAdmin && (
                    <button
                      className="btn-quick-switch"
                      onClick={() => setTab('admin')}
                    >
                      <Command size={13} /> Operations Command
                    </button>
                  )}
                  {currentMode !== 'instructor' && isInstructor && (
                    <button
                      className="btn-quick-switch"
                      onClick={() => setTab('instructor')}
                    >
                      <Sliders size={13} /> Instructor View
                    </button>
                  )}
                  {currentMode !== 'student' && (
                    <button
                      className="btn-quick-switch"
                      onClick={() => setTab('overview')}
                    >
                      <GraduationCap size={13} /> Student View
                    </button>
                  )}
                </div>
              )}

              <div className="platform-sidebar-note">
                <ShieldCheck size={16} />
                <div>
                  <b>ENTERPRISE PORTAL</b>
                  <small>Role-based access control active.</small>
                </div>
              </div>
            </aside>

            {/* Main Content View Area */}
            <main className="platform-main">
              {/* Dynamic Views */}
              {tab === 'overview' && (
                <OverviewView
                  enrollments={enrollments}
                  labs={labs}
                  overview={overview}
                  onOpenCourse={openCourse}
                  onSwitchTab={setTab}
                />
              )}

              {tab === 'learning' && (
                <LearningView
                  courses={courses}
                  enrollments={enrollments}
                  onEnroll={enroll}
                  onOpenCourse={openCourse}
                />
              )}

              {tab === 'course' && activeCourse && (
                <CourseDetailView
                  course={activeCourse}
                  onBack={() => setTab('learning')}
                  onCompleteLesson={completeLesson}
                  onQuizCompleted={refresh}
                />
              )}

              {tab === 'labs' && <LabsView labs={labs} onStartLab={startLab} />}

              {tab === 'lab' && activeLab && (
                <LabDetailView
                  lab={activeLab}
                  onBack={() => setTab('labs')}
                  onSaveLab={saveLabNotes}
                />
              )}

              {tab === 'instructor' && (
                <InstructorStudioView
                  instructorCourses={instructorCourses}
                  onRefresh={refresh}
                />
              )}

              {(tab === 'admin' || tab.startsWith('admin-')) && (
                <AdminView
                  tab={tab}
                  overview={overview}
                  adminCourses={adminCourses}
                  adminLabs={adminLabs}
                  inquiries={inquiries}
                  services={services}
                  research={research}
                  users={users}
                  onRefresh={refresh}
                  onSwitchTab={setTab}
                />
              )}
            </main>
          </div>
        )}
      </section>
    </div>
  );
}
