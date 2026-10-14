import React, { useState } from 'react';
import { 
  Sliders, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  FileCode, 
  FileText,
  HelpCircle, 
  Sparkles, 
  AlertCircle, 
  Save, 
  X, 
  Layers, 
  GraduationCap, 
  Check, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  ImageIcon
} from 'lucide-react';
import { apiRequest, postJson, patchJson, deleteJson } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { ImageUploader, PocImageManager } from '../ui/index.js';

export default function InstructorStudioView({ instructorCourses = [], onRefresh }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'research' | 'guidelines'
  const [search, setSearch] = useState('');
  
  // Research whitepapers states
  const [researchList, setResearchList] = useState([]);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [researchForm, setResearchForm] = useState({
    title: '',
    slug: '',
    category: 'RED TEAM',
    summary: '',
    content: '',
    keyFindings: '',
    architecturePoC: '',
    threatModel: '',
    readTimeMinutes: 10,
    tags: '',
    url: '',
    bannerImage: '',
    pocImages: [],
    status: 'published'
  });

  const loadResearch = React.useCallback(async () => {
    try {
      const data = await apiRequest('/research?includeDrafts=true');
      if (data?.research) {
        setResearchList(data.research);
      }
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'research') {
      loadResearch();
    }
  }, [activeTab, loadResearch]);

  const handleCreateWhitepaper = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const tags = researchForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const keyFindings = researchForm.keyFindings.split('\n').map((k) => k.trim()).filter(Boolean);
      await postJson('/research', {
        ...researchForm,
        tags,
        keyFindings,
        bannerImage: researchForm.bannerImage,
        pocImages: researchForm.pocImages
      });
      showToast('Threat whitepaper published successfully.', 'success');
      setShowResearchModal(false);
      setResearchForm({
        title: '',
        slug: '',
        category: 'RED TEAM',
        summary: '',
        content: '',
        keyFindings: '',
        architecturePoC: '',
        threatModel: '',
        readTimeMinutes: 10,
        tags: '',
        url: '',
        bannerImage: '',
        pocImages: [],
        status: 'published'
      });
      loadResearch();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to publish research.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleResearchStatus = async (item) => {
    try {
      const nextStatus = item.status === 'published' ? 'draft' : 'published';
      await patchJson(`/research/${item._id}`, { status: nextStatus });
      showToast(`Article status updated to ${nextStatus}.`, 'success');
      loadResearch();
    } catch (err) {
      showToast(err.message || 'Failed to update article status.', 'error');
    }
  };

  const handleToggleCoursePublish = async (course) => {
    try {
      const nextPublished = !course.published;
      await patchJson(`/instructor/courses/${course._id}/publish`, { published: nextPublished });
      showToast(`Course track ${nextPublished ? 'published live' : 'hidden as draft'}.`, 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update course publication status.', 'error');
    }
  };

  const handleDeleteWhitepaper = async (id) => {
    if (!window.confirm('Are you sure you want to delete this research paper?')) return;
    try {
      await deleteJson(`/research/${id}`);
      showToast('Research paper deleted.', 'success');
      loadResearch();
    } catch (err) {
      showToast(err.message || 'Failed to delete research paper.', 'error');
    }
  };
  
  // Editor states
  const [editingCourse, setEditingCourse] = useState(null);
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' | 'json'
  const [lessonsList, setLessonsList] = useState([]);
  const [jsonText, setJsonText] = useState('[]');
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  // Filter courses
  const filteredCourses = instructorCourses.filter((c) =>
    (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(search.toLowerCase())
  );

  // Start editing a course
  const startEditing = (course) => {
    setEditingCourse(course);
    const existingLessons = Array.isArray(course.lessons) && course.lessons.length > 0 
      ? JSON.parse(JSON.stringify(course.lessons)) 
      : [{
          title: 'Lesson 01: Foundations & Security Concept',
          summary: 'Introduction to core principles and threat vectors.',
          content: 'Detailed instruction and analysis guide...',
          durationMinutes: 20,
          quiz: [
            {
              question: 'What is the primary objective of defense-in-depth?',
              options: [
                'Rely solely on perimeter firewalls',
                'Implement layered controls so failure of one does not compromise the asset',
                'Disable all logging'
              ],
              correctIndex: 1,
              explanation: 'Layered security controls ensure resilience against single-point failures.'
            }
          ]
        }];

    setLessonsList(existingLessons);
    setJsonText(JSON.stringify(existingLessons, null, 2));
    setSelectedLessonIndex(0);
    setEditorMode('visual');
  };

  // Sync Visual to JSON
  const handleSwitchToJson = () => {
    setJsonText(JSON.stringify(lessonsList, null, 2));
    setEditorMode('json');
  };

  // Sync JSON to Visual
  const handleSwitchToVisual = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error('Lessons must be an array.');
      setLessonsList(parsed);
      setSelectedLessonIndex(0);
      setEditorMode('visual');
    } catch (err) {
      showToast(err.message || 'Invalid JSON syntax. Fix syntax before switching.', 'error');
    }
  };

  // Visual lesson actions
  const addLesson = () => {
    const newLesson = {
      title: `Lesson ${String(lessonsList.length + 1).padStart(2, '0')}: New Module Topic`,
      summary: 'Summary of the learning objectives and target outcomes.',
      content: 'Instructional content markdown goes here...',
      durationMinutes: 20,
      quiz: []
    };
    const updated = [...lessonsList, newLesson];
    setLessonsList(updated);
    setSelectedLessonIndex(updated.length - 1);
  };

  const removeLesson = (index) => {
    if (lessonsList.length <= 1) {
      showToast('A course must contain at least one lesson.', 'info');
      return;
    }
    const updated = lessonsList.filter((_, i) => i !== index);
    setLessonsList(updated);
    setSelectedLessonIndex(Math.max(0, index - 1));
  };

  const updateCurrentLessonField = (field, value) => {
    const updated = [...lessonsList];
    updated[selectedLessonIndex] = {
      ...updated[selectedLessonIndex],
      [field]: value
    };
    setLessonsList(updated);
  };

  // Visual quiz actions for currently selected lesson
  const addQuizQuestion = () => {
    const currentLesson = lessonsList[selectedLessonIndex];
    const newQ = {
      question: 'New concept verification question?',
      options: ['Option A', 'Option B', 'Option C'],
      correctIndex: 0,
      explanation: 'Explanation of why this choice is correct.'
    };
    const updatedQuiz = [...(currentLesson.quiz || []), newQ];
    updateCurrentLessonField('quiz', updatedQuiz);
  };

  const removeQuizQuestion = (qIndex) => {
    const currentLesson = lessonsList[selectedLessonIndex];
    const updatedQuiz = (currentLesson.quiz || []).filter((_, i) => i !== qIndex);
    updateCurrentLessonField('quiz', updatedQuiz);
  };

  const updateQuizField = (qIndex, field, value) => {
    const currentLesson = lessonsList[selectedLessonIndex];
    const updatedQuiz = [...(currentLesson.quiz || [])];
    updatedQuiz[qIndex] = {
      ...updatedQuiz[qIndex],
      [field]: value
    };
    updateCurrentLessonField('quiz', updatedQuiz);
  };

  const updateQuizOption = (qIndex, oIndex, value) => {
    const currentLesson = lessonsList[selectedLessonIndex];
    const updatedQuiz = [...(currentLesson.quiz || [])];
    const options = [...(updatedQuiz[qIndex].options || [])];
    options[oIndex] = value;
    updatedQuiz[qIndex] = {
      ...updatedQuiz[qIndex],
      options
    };
    updateCurrentLessonField('quiz', updatedQuiz);
  };

  const addQuizOption = (qIndex) => {
    const currentLesson = lessonsList[selectedLessonIndex];
    const updatedQuiz = [...(currentLesson.quiz || [])];
    const options = [...(updatedQuiz[qIndex].options || []), `Option ${String.fromCharCode(65 + (updatedQuiz[qIndex].options || []).length)}`];
    updatedQuiz[qIndex] = { ...updatedQuiz[qIndex], options };
    updateCurrentLessonField('quiz', updatedQuiz);
  };

  const removeQuizOption = (qIndex, oIndex) => {
    const currentLesson = lessonsList[selectedLessonIndex];
    const updatedQuiz = [...(currentLesson.quiz || [])];
    const options = (updatedQuiz[qIndex].options || []).filter((_, i) => i !== oIndex);
    if (options.length < 2) {
      showToast('Each question needs at least 2 options.', 'info');
      return;
    }
    let correctIndex = updatedQuiz[qIndex].correctIndex || 0;
    if (correctIndex >= options.length) correctIndex = options.length - 1;
    updatedQuiz[qIndex] = { ...updatedQuiz[qIndex], options, correctIndex };
    updateCurrentLessonField('quiz', updatedQuiz);
  };

  // Save to API
  const saveLessons = async () => {
    setBusy(true);
    try {
      let payload;
      if (editorMode === 'json') {
        try {
          payload = JSON.parse(jsonText);
        } catch {
          throw new Error('Invalid JSON format. Check syntax, commas, and quotes.');
        }
      } else {
        payload = lessonsList;
      }

      if (!Array.isArray(payload) || payload.length === 0) {
        throw new Error('Course must have at least one lesson.');
      }

      // Validate title presence
      if (payload.some((l) => !l.title || String(l.title).trim().length < 2)) {
        throw new Error('Every lesson must have a valid title.');
      }

      await patchJson(`/instructor/courses/${editingCourse._id}/lessons`, {
        lessons: payload
      });

      showToast(`Successfully saved ${payload.length} lessons for ${editingCourse.title}!`, 'success');
      setEditingCourse(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to save lessons.', 'error');
    } finally {
      setBusy(false);
    }
  };

  // Metrics
  const totalLessons = instructorCourses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
  const totalQuizzes = instructorCourses.reduce(
    (sum, c) => sum + (c.lessons || []).reduce((qSum, l) => qSum + (l.quiz?.length || 0), 0),
    0
  );

  return (
    <div className="instructor-studio-container">
      {/* Studio Header Banner */}
      <div className="instructor-studio-header">
        <div>
          <span className="platform-kicker">
            <Sliders size={14} /> INSTRUCTOR COMMAND & STUDIO
          </span>
          <h2>Cybersecurity Course Authoring Studio</h2>
          <p className="platform-muted" style={{ margin: '6px 0 0' }}>
            Design learning tracks, author lesson outlines, and build interactive knowledge checks for assigned courses.
          </p>
        </div>

        <div className="instructor-header-stats">
          <div className="studio-stat-box">
            <small>ASSIGNED COURSES</small>
            <b>{instructorCourses.length}</b>
          </div>
          <div className="studio-stat-box">
            <small>TOTAL LESSONS</small>
            <b>{totalLessons}</b>
          </div>
          <div className="studio-stat-box">
            <small>KNOWLEDGE CHECKS</small>
            <b>{totalQuizzes}</b>
          </div>
        </div>
      </div>

      {/* Main Studio View */}
      {editingCourse ? (
        /* Course Lesson Editor */
        <div className="instructor-editor-shell">
          <div className="editor-top-bar">
            <div className="editor-title-group">
              <button className="btn-back-link" onClick={() => setEditingCourse(null)} disabled={busy}>
                ← Back to Courses
              </button>
              <div>
                <h3>{editingCourse.title}</h3>
                <span className="editor-subbadge">
                  {editingCourse.category} · {editingCourse.level} · {lessonsList.length} Lessons
                </span>
              </div>
            </div>

            <div className="editor-actions-group">
              <div className="editor-mode-toggle">
                <button
                  className={`btn-mode ${editorMode === 'visual' ? 'active' : ''}`}
                  onClick={handleSwitchToVisual}
                  disabled={busy}
                >
                  <Edit3 size={13} /> Visual Editor
                </button>
                <button
                  className={`btn-mode ${editorMode === 'json' ? 'active' : ''}`}
                  onClick={handleSwitchToJson}
                  disabled={busy}
                >
                  <FileCode size={13} /> Raw JSON
                </button>
              </div>

              <button className="btn-save-lessons" onClick={saveLessons} disabled={busy}>
                <Save size={15} /> {busy ? 'Saving...' : 'Save Curriculum'}
              </button>
            </div>
          </div>

          {editorMode === 'json' ? (
            /* JSON Mode */
            <div className="json-editor-pane">
              <div className="json-editor-note">
                <FileCode size={16} />
                <span>
                  Direct JSON authoring mode. Supports: <code>title</code>, <code>summary</code>, <code>content</code>, <code>durationMinutes</code>, and <code>quiz</code> array.
                </span>
              </div>
              <textarea
                rows={22}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                spellCheck="false"
                className="json-textarea"
                disabled={busy}
              />
            </div>
          ) : (
            /* Visual Master-Detail Editor */
            <div className="visual-editor-grid">
              {/* Left Column: Lesson Tree */}
              <div className="lesson-tree-sidebar">
                <div className="lesson-tree-head">
                  <span>LESSONS OUTLINE ({lessonsList.length})</span>
                  <button className="btn-add-lesson" onClick={addLesson} title="Add lesson module">
                    <Plus size={14} /> Add
                  </button>
                </div>

                <div className="lesson-tree-list">
                  {lessonsList.map((lesson, idx) => (
                    <div
                      key={idx}
                      className={`lesson-tree-item ${selectedLessonIndex === idx ? 'active' : ''}`}
                      onClick={() => setSelectedLessonIndex(idx)}
                    >
                      <div className="tree-num">{String(idx + 1).padStart(2, '0')}</div>
                      <div className="tree-info">
                        <b>{lesson.title || 'Untitled Lesson'}</b>
                        <small>{lesson.durationMinutes || 15}m · {(lesson.quiz || []).length} quizzes</small>
                      </div>
                      {lessonsList.length > 1 && (
                        <button
                          className="btn-del-lesson"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLesson(idx);
                          }}
                          title="Delete lesson"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Selected Lesson Editor */}
              {lessonsList[selectedLessonIndex] && (
                <div className="lesson-form-pane">
                  <div className="lesson-form-header">
                    <h4>Editing Lesson {selectedLessonIndex + 1} of {lessonsList.length}</h4>
                  </div>

                  <div className="form-row">
                    <label className="platform-field">
                      Lesson Title
                      <input
                        type="text"
                        value={lessonsList[selectedLessonIndex].title || ''}
                        onChange={(e) => updateCurrentLessonField('title', e.target.value)}
                        placeholder="e.g. Identity, Authentication, and Access Boundaries"
                        disabled={busy}
                      />
                    </label>

                    <label className="platform-field" style={{ width: '160px', flexShrink: 0 }}>
                      Duration (Mins)
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={lessonsList[selectedLessonIndex].durationMinutes || 20}
                        onChange={(e) => updateCurrentLessonField('durationMinutes', Number(e.target.value) || 15)}
                        disabled={busy}
                      />
                    </label>
                  </div>

                  <label className="platform-field">
                    Lesson Summary & Learning Outcomes
                    <input
                      type="text"
                      value={lessonsList[selectedLessonIndex].summary || ''}
                      onChange={(e) => updateCurrentLessonField('summary', e.target.value)}
                      placeholder="Brief overview of key takeaways"
                      disabled={busy}
                    />
                  </label>

                  <label className="platform-field">
                    Instructional Content (Markdown / Detailed Theory)
                    <textarea
                      rows={9}
                      value={lessonsList[selectedLessonIndex].content || ''}
                      onChange={(e) => updateCurrentLessonField('content', e.target.value)}
                      placeholder="Explain the security concept, failure modes, code examples, and mitigation strategies..."
                      disabled={busy}
                    />
                  </label>

                  {/* Knowledge Check / Quiz Builder */}
                  <div className="lesson-quiz-builder">
                    <div className="quiz-builder-top">
                      <div>
                        <h5>Interactive Knowledge Checks</h5>
                        <small>Test student comprehension with scenario-based quiz questions.</small>
                      </div>
                      <button className="btn-add-quiz" onClick={addQuizQuestion}>
                        <Plus size={14} /> Add Question
                      </button>
                    </div>

                    <div className="quiz-questions-list">
                      {(lessonsList[selectedLessonIndex].quiz || []).map((q, qIdx) => (
                        <div key={qIdx} className="quiz-edit-card">
                          <div className="quiz-card-head">
                            <span className="q-badge">Question {qIdx + 1}</span>
                            <button
                              className="btn-del-quiz"
                              onClick={() => removeQuizQuestion(qIdx)}
                              title="Delete question"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <label className="platform-field">
                            Question Prompt
                            <input
                              type="text"
                              value={q.question || ''}
                              onChange={(e) => updateQuizField(qIdx, 'question', e.target.value)}
                              placeholder="e.g. Why should access-control decisions be enforced server-side?"
                              disabled={busy}
                            />
                          </label>

                          <div className="quiz-options-edit">
                            <label className="field-label-sm">Options & Correct Answer</label>
                            {(q.options || []).map((opt, oIdx) => (
                              <div key={oIdx} className="quiz-opt-row">
                                <input
                                  type="radio"
                                  name={`correct-${selectedLessonIndex}-${qIdx}`}
                                  checked={q.correctIndex === oIdx}
                                  onChange={() => updateQuizField(qIdx, 'correctIndex', oIdx)}
                                  title="Mark as correct option"
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => updateQuizOption(qIdx, oIdx, e.target.value)}
                                  placeholder={`Option ${oIdx + 1}`}
                                  disabled={busy}
                                  className={q.correctIndex === oIdx ? 'correct-opt-input' : ''}
                                />
                                {(q.options || []).length > 2 && (
                                  <button
                                    className="btn-del-opt"
                                    onClick={() => removeQuizOption(qIdx, oIdx)}
                                    title="Remove option"
                                  >
                                    <X size={13} />
                                  </button>
                                )}
                              </div>
                            ))}
                            {(q.options || []).length < 6 && (
                              <button className="btn-add-opt" onClick={() => addQuizOption(qIdx)}>
                                + Add option choice
                              </button>
                            )}
                          </div>

                          <label className="platform-field" style={{ marginTop: '10px' }}>
                            Answer Explanation (Shown to students after submission)
                            <input
                              type="text"
                              value={q.explanation || ''}
                              onChange={(e) => updateQuizField(qIdx, 'explanation', e.target.value)}
                              placeholder="Explain why the chosen option is correct and reinforce the principle."
                              disabled={busy}
                            />
                          </label>
                        </div>
                      ))}

                      {(lessonsList[selectedLessonIndex].quiz || []).length === 0 && (
                        <div className="quiz-empty-prompt">
                          <HelpCircle size={18} />
                          <span>No quiz questions in this lesson yet. Click "+ Add Question" to reinforce learning.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Course Grid & Overview */
        <>
          <div className="studio-tabs-bar">
            <button
              className={`studio-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <BookOpen size={15} /> Assigned Courses ({instructorCourses.length})
            </button>
            <button
              className={`studio-tab-btn ${activeTab === 'research' ? 'active' : ''}`}
              onClick={() => setActiveTab('research')}
            >
              <FileText size={15} /> Threat Research & Publications ({researchList.length})
            </button>
            <button
              className={`studio-tab-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
              onClick={() => setActiveTab('guidelines')}
            >
              <ShieldCheck size={15} /> Instructional Guidelines
            </button>
          </div>

          {activeTab === 'courses' ? (
            <div className="studio-courses-view">
              <div className="studio-filter-row">
                <input
                  type="text"
                  placeholder="Filter courses by title or domain..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="studio-search-input"
                />
              </div>

              <div className="studio-course-cards-grid">
                {filteredCourses.map((c) => (
                  <article key={c._id || c.slug} className="studio-course-card">
                    <div className="studio-card-head">
                      <span className="category-pill">{c.category?.toUpperCase() || 'SECURITY'}</span>
                      <div className="table-status-cell">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={Boolean(c.published)}
                          onClick={() => handleToggleCoursePublish(c)}
                          className={`admin-toggle-btn ${c.published ? 'is-active' : 'is-inactive'}`}
                          title={`Status: ${c.published ? 'Published' : 'Draft'}. Click to toggle.`}
                        >
                          <span className="toggle-thumb" />
                        </button>
                        <span className={`status-label-pill ${c.published ? 'live' : 'draft'}`}>
                          {c.published ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    <h3>{c.title}</h3>
                    <p>{c.summary}</p>

                    <div className="studio-card-meta">
                      <span><Clock size={13} /> {c.duration || '4 weeks'}</span>
                      <span><GraduationCap size={13} /> {c.level}</span>
                      <span><Layers size={13} /> {c.lessons?.length || 0} Lessons</span>
                    </div>

                    <div className="studio-card-actions">
                      <button className="btn-edit-course" onClick={() => startEditing(c)}>
                        <Edit3 size={14} /> Author Lessons & Quizzes
                      </button>
                    </div>
                  </article>
                ))}

                {filteredCourses.length === 0 && (
                  <div className="platform-empty" style={{ gridColumn: '1 / -1' }}>
                    {search ? 'No courses match your search criteria.' : 'No courses are assigned to this instructor account yet.'}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'research' ? (
            /* Research Whitepapers Tab for Instructors & Verified Writers */
            <div className="studio-courses-view">
              <div className="studio-filter-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search research publications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="studio-search-input"
                  style={{ maxWidth: '380px' }}
                />
                <button
                  type="button"
                  className="btn-add-quiz"
                  onClick={() => setShowResearchModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} /> Author Whitepaper
                </button>
              </div>

              <div className="studio-course-cards-grid">
                {researchList
                  .filter((r) => (r.title || '').toLowerCase().includes(search.toLowerCase()) || (r.summary || '').toLowerCase().includes(search.toLowerCase()))
                  .map((r) => (
                    <article key={r._id || r.slug} className="studio-course-card">
                      <div className="studio-card-head">
                        <span className="category-pill">{r.category?.toUpperCase() || 'CYBER RESEARCH'}</span>
                        <div className="table-status-cell">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={r.status === 'published'}
                            onClick={() => handleToggleResearchStatus(r)}
                            className={`admin-toggle-btn ${r.status === 'published' ? 'is-active' : 'is-inactive'}`}
                            title={`Status: ${r.status === 'published' ? 'Published' : 'Draft'}. Click to toggle.`}
                          >
                            <span className="toggle-thumb" />
                          </button>
                          <span className={`status-label-pill ${r.status === 'published' ? 'live' : 'draft'}`}>
                            {r.status === 'published' ? 'Live' : 'Draft'}
                          </span>
                        </div>
                      </div>

                      {r.bannerImage && (
                        <div style={{ position: 'relative', width: '100%', height: '130px', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                          <img src={r.bannerImage} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                          <span style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(2, 6, 23, 0.85)', color: '#38bdf8', fontSize: '10px', fontFamily: 'monospace', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                            .WEBP
                          </span>
                        </div>
                      )}

                      <h3>{r.title}</h3>
                      <p>{r.summary}</p>

                      <div className="studio-card-meta">
                        <span><Clock size={13} /> {r.readTimeMinutes || 8} min read</span>
                        <span><ShieldCheck size={13} /> {r.authorName || 'Instructor'}</span>
                        {r.pocImages && r.pocImages.length > 0 && (
                          <span style={{ color: '#a6ff70' }}><ImageIcon size={13} /> {r.pocImages.length} PoC Visuals</span>
                        )}
                      </div>

                      <div className="studio-card-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                        <a
                          href={`#research/${r.slug}`}
                          onClick={(e) => {
                            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                              e.preventDefault();
                              window.location.hash = `#research/${r.slug}`;
                              window.dispatchEvent(new HashChangeEvent('hashchange'));
                            }
                          }}
                          className="link-action"
                          style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#a6ff70' }}
                        >
                          View Paper <ExternalLink size={12} />
                        </a>
                        <button
                          type="button"
                          className="btn-del-opt"
                          onClick={() => handleDeleteWhitepaper(r._id)}
                          title="Delete article"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))}

                {researchList.length === 0 && (
                  <div className="platform-empty" style={{ gridColumn: '1 / -1' }}>
                    No research publications found. Click "+ Author Whitepaper" to publish your first technical paper.
                  </div>
                )}
              </div>

              {/* Research Whitepaper Authoring Modal */}
              {showResearchModal && (
                <div className="admin-modal-backdrop" onClick={() => setShowResearchModal(false)}>
                  <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
                    <div className="admin-modal-head">
                      <h3>Author Technical Research Whitepaper</h3>
                      <button className="btn-close-modal" onClick={() => setShowResearchModal(false)}>✕</button>
                    </div>
                    <form onSubmit={handleCreateWhitepaper}>
                      <label className="admin-field">
                        Paper Title
                        <input
                          value={researchForm.title}
                          onChange={(e) => setResearchForm({ ...researchForm, title: e.target.value })}
                          required
                          minLength={3}
                          placeholder="e.g. Exploiting & Mitigating Indirect Prompt Injection in Autonomous SecOps"
                        />
                      </label>
                      <div className="admin-field-row">
                        <label className="admin-field">
                          Category
                          <input
                            value={researchForm.category}
                            onChange={(e) => setResearchForm({ ...researchForm, category: e.target.value })}
                            placeholder="e.g. AI SECURITY, RED TEAM, ARCHITECTURE"
                          />
                        </label>
                        <label className="admin-field">
                          Slug (optional)
                          <input
                            value={researchForm.slug}
                            onChange={(e) => setResearchForm({ ...researchForm, slug: e.target.value })}
                            placeholder="e.g. prompt-injection-secops"
                          />
                        </label>
                        <label className="admin-field">
                          Read Time (Mins)
                          <input
                            type="number"
                            min={1}
                            max={120}
                            value={researchForm.readTimeMinutes}
                            onChange={(e) => setResearchForm({ ...researchForm, readTimeMinutes: Number(e.target.value) || 8 })}
                          />
                        </label>
                      </div>
                      <label className="admin-field">
                        Summary / Executive Abstract
                        <textarea
                          rows={3}
                          value={researchForm.summary}
                          onChange={(e) => setResearchForm({ ...researchForm, summary: e.target.value })}
                          required
                          minLength={10}
                          placeholder="Brief technical summary of attack surfaces, vulnerabilities, and defensive findings..."
                        />
                      </label>
                      <label className="admin-field">
                        Key Discoveries / Bullet Takeaways (one per line)
                        <textarea
                          rows={3}
                          value={researchForm.keyFindings}
                          onChange={(e) => setResearchForm({ ...researchForm, keyFindings: e.target.value })}
                          placeholder="Key finding 1: Attack vectors bypass system prompt gates...&#10;Key finding 2: Tool execution sandboxing..."
                        />
                      </label>
                      <label className="admin-field">
                        Full Technical Content
                        <textarea
                          rows={5}
                          value={researchForm.content}
                          onChange={(e) => setResearchForm({ ...researchForm, content: e.target.value })}
                          placeholder="Detailed architectural breakdown, failure analysis, and remediation steps..."
                        />
                      </label>
                      <label className="admin-field">
                        Proof-of-Concept Code / Detection Rule / Payload
                        <textarea
                          rows={4}
                          value={researchForm.architecturePoC}
                          onChange={(e) => setResearchForm({ ...researchForm, architecturePoC: e.target.value })}
                          placeholder="Sigma rule, interceptor script, or PoC implementation..."
                        />
                      </label>
                      <div className="admin-field-row">
                        <label className="admin-field">
                          Threat Model / MITRE ATT&CK Mapping
                          <input
                            value={researchForm.threatModel}
                            onChange={(e) => setResearchForm({ ...researchForm, threatModel: e.target.value })}
                            placeholder="e.g. MITRE ATT&CK T1059.001 · OWASP LLM01"
                          />
                        </label>
                        <label className="admin-field">
                          Tags (comma-separated)
                          <input
                            value={researchForm.tags}
                            onChange={(e) => setResearchForm({ ...researchForm, tags: e.target.value })}
                            placeholder="AI Security, LLM, AppSec, Red Team"
                          />
                        </label>
                      </div>

                      {/* WebP Banner Image Uploader */}
                      <div style={{ marginTop: '14px', marginBottom: '14px' }}>
                        <ImageUploader
                          value={researchForm.bannerImage}
                          onChange={(url) => setResearchForm({ ...researchForm, bannerImage: url })}
                          label="Article Hero Banner (Local File or Google Drive)"
                          description="Automatically converted to compressed .webp format for high-speed rendering."
                        />
                      </div>

                      {/* Multiple PoC Evidence Images */}
                      <div style={{ marginTop: '14px', marginBottom: '14px' }}>
                        <PocImageManager
                          images={researchForm.pocImages || []}
                          onChange={(pocImages) => setResearchForm({ ...researchForm, pocImages })}
                          label="Proof-of-Concept (PoC) Visual Evidence & Screenshots"
                          description="Upload multiple verification screenshots, payload execution proofs, or architecture diagrams. Auto-converted to .webp."
                        />
                      </div>
                      <div
                        className="admin-modal-toggle-row"
                        onClick={() =>
                          setResearchForm({
                            ...researchForm,
                            status: researchForm.status === 'published' ? 'draft' : 'published'
                          })
                        }
                      >
                        <button
                          type="button"
                          role="switch"
                          aria-checked={researchForm.status === 'published'}
                          className={`admin-toggle-btn ${researchForm.status === 'published' ? 'is-active' : 'is-inactive'}`}
                        >
                          <span className="toggle-thumb" />
                        </button>
                        <span className="admin-modal-toggle-label">
                          {researchForm.status === 'published'
                            ? 'Publish whitepaper immediately to research feed (Live)'
                            : 'Save as internal draft only (Hidden)'}
                        </span>
                      </div>
                      <div className="admin-modal-actions">
                        <button type="button" className="btn-action-ghost" onClick={() => setShowResearchModal(false)}>Cancel</button>
                        <button type="submit" className="btn-action-primary" disabled={busy}>
                          {busy ? 'Publishing…' : 'Publish Whitepaper'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guidelines Tab */
            <div className="studio-guidelines-pane">
              <h3>Security Education Pedagogy & Authoring Guidelines</h3>
              <div className="guidelines-card-grid">
                <div className="guideline-card">
                  <span className="guideline-num">01</span>
                  <h4>Safe, Responsible Scenarios</h4>
                  <p>All laboratory exercises and lesson code samples must be self-contained and instructional. Never require students to scan, probe, or run attacks against third-party production infrastructure.</p>
                </div>
                <div className="guideline-card">
                  <span className="guideline-num">02</span>
                  <h4>Defensive Countermeasures First</h4>
                  <p>Every offensive vulnerability demonstration must be immediately paired with the corresponding defensive countermeasure, parameterized queries, least privilege principles, or architectural mitigation.</p>
                </div>
                <div className="guideline-card">
                  <span className="guideline-num">03</span>
                  <h4>Constructive Feedback</h4>
                  <p>Knowledge check questions should validate real mental models rather than trivia. Provide substantive, educational explanations for each question so students learn even when answering incorrectly.</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
