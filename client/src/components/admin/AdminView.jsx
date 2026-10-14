import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  BookOpen,
  FlaskConical,
  Users,
  ClipboardList,
  Layers3,
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Trash2,
  ExternalLink,
  LockKeyhole,
  Check,
  ChevronRight,
  Activity,
  Sliders,
  Download,
  RefreshCw,
  Database,
  Terminal,
  AlertTriangle,
  Globe,
  Mail,
  Edit3,
  X,
  Eye,
  KeyRound,
  Sparkles,
  Server,
  Cpu
} from 'lucide-react';
import { apiRequest, postJson, patchJson, deleteJson } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ImageUploader, PocImageManager } from '../ui/index.js';

export default function AdminView({
  tab = 'admin',
  overview,
  adminCourses = [],
  adminLabs = [],
  inquiries = [],
  services = [],
  research = [],
  users = [],
  onRefresh,
  onSwitchTab
}) {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  // Overview internal subview: 'overview' | 'inquiries'
  const [subTab, setSubTab] = useState('overview');

  // Search & Filter States
  const [inquiryFilter, setInquiryFilter] = useState('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [labSearch, setLabSearch] = useState('');
  const [labLevelFilter, setLabLevelFilter] = useState('all');
  const [labPublishFilter, setLabPublishFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Creation Modal States
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);

  // EDIT MODAL STATES
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingLab, setEditingLab] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editingResearch, setEditingResearch] = useState(null);
  const [viewingInquiry, setViewingInquiry] = useState(null);

  // Lesson sub-editor inside Course Edit Modal
  const [newLesson, setNewLesson] = useState({
    title: '',
    durationMinutes: 15,
    summary: '',
    content: ''
  });
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);

  const [busy, setBusy] = useState(false);

  // Forms for creation
  const [courseForm, setCourseForm] = useState({
    title: '',
    category: 'Application Security',
    level: 'Beginner',
    duration: 'Self-paced',
    summary: '',
    thumbnail: '',
    bannerImage: '',
    published: true
  });

  const [labForm, setLabForm] = useState({
    title: '',
    slug: '',
    level: 'Beginner',
    estimatedMinutes: 25,
    objective: '',
    safety: 'Authorized sandbox environment only.',
    steps: '',
    challenge: '',
    hints: '',
    published: true
  });

  const [serviceForm, setServiceForm] = useState({
    title: '',
    slug: '',
    category: 'Offensive Security',
    summary: '',
    bullets: '',
    published: true
  });

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

  // Admin Password Management State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Enter current password.', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }
    setPwdLoading(true);
    try {
      await postJson('/auth/change-password', { currentPassword, newPassword });
      showToast('Admin password successfully updated in database.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to update administrator password.', 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  // ==========================================
  // 1. COURSE CRUD HANDLERS
  // ==========================================
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await postJson('/admin/courses', courseForm);
      showToast('Course track created in catalog.', 'success');
      setCourseForm({
        title: '',
        category: 'Application Security',
        level: 'Beginner',
        duration: 'Self-paced',
        summary: '',
        thumbnail: '',
        bannerImage: '',
        published: true
      });
      setShowCourseModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to create course.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse({
      _id: course._id,
      title: course.title || '',
      slug: course.slug || '',
      category: course.category || '',
      level: course.level || 'Beginner',
      duration: course.duration || 'Self-paced',
      summary: course.summary || '',
      thumbnail: course.thumbnail || '',
      bannerImage: course.bannerImage || '',
      published: Boolean(course.published),
      lessons: Array.isArray(course.lessons) ? [...course.lessons] : []
    });
    setShowAddLessonForm(false);
    setNewLesson({ title: '', durationMinutes: 15, summary: '', content: '' });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    setBusy(true);
    try {
      await patchJson(`/admin/courses/${editingCourse._id}`, {
        title: editingCourse.title,
        slug: editingCourse.slug,
        category: editingCourse.category,
        level: editingCourse.level,
        duration: editingCourse.duration,
        summary: editingCourse.summary,
        thumbnail: editingCourse.thumbnail,
        bannerImage: editingCourse.bannerImage,
        published: editingCourse.published,
        lessons: editingCourse.lessons
      });
      showToast('Course track & syllabus updated successfully.', 'success');
      setEditingCourse(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update course.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleAddLessonToEditingCourse = (e) => {
    e.preventDefault();
    if (!newLesson.title.trim()) {
      showToast('Lesson title is required.', 'error');
      return;
    }
    const updatedLessons = [
      ...(editingCourse.lessons || []),
      {
        title: newLesson.title.trim(),
        durationMinutes: Number(newLesson.durationMinutes) || 15,
        summary: newLesson.summary.trim(),
        content: newLesson.content.trim(),
        order: (editingCourse.lessons || []).length + 1
      }
    ];
    setEditingCourse({ ...editingCourse, lessons: updatedLessons });
    setNewLesson({ title: '', durationMinutes: 15, summary: '', content: '' });
    setShowAddLessonForm(false);
    showToast('Lesson added to draft. Click Save Changes to commit to database.', 'info');
  };

  const handleRemoveLesson = (index) => {
    const updatedLessons = editingCourse.lessons.filter((_, i) => i !== index);
    setEditingCourse({ ...editingCourse, lessons: updatedLessons });
  };

  const handleToggleCoursePublish = async (course) => {
    try {
      await patchJson(`/admin/courses/${course._id}`, { published: !course.published });
      showToast(`Course ${!course.published ? 'published live' : 'hidden as draft'}.`, 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update course publication.', 'error');
    }
  };

  const handleAssignInstructor = async (courseId, instructorId) => {
    try {
      await patchJson(`/admin/courses/${courseId}`, {
        instructor: instructorId || null
      });
      showToast('Instructor assignment saved.', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to assign instructor.', 'error');
    }
  };

  // ==========================================
  // 2. LAB CRUD HANDLERS
  // ==========================================
  const handleCreateLab = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const stepsArray = labForm.steps
        ? labForm.steps.split('\n').map((s) => s.trim()).filter(Boolean)
        : [];
      const hintsArray = labForm.hints
        ? labForm.hints.split('\n').map((h) => h.trim()).filter(Boolean)
        : [];
      await postJson('/admin/labs', {
        ...labForm,
        steps: stepsArray,
        hints: hintsArray
      });
      showToast('Lab scenario registered in database.', 'success');
      setLabForm({
        title: '',
        slug: '',
        level: 'Beginner',
        estimatedMinutes: 25,
        objective: '',
        safety: 'Authorized sandbox environment only.',
        steps: '',
        challenge: '',
        hints: '',
        published: true
      });
      setShowLabModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to create lab scenario.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleOpenEditLab = (lab) => {
    setEditingLab({
      _id: lab._id,
      title: lab.title || '',
      slug: lab.slug || '',
      level: lab.level || 'Beginner',
      estimatedMinutes: lab.estimatedMinutes || 25,
      objective: lab.objective || '',
      safety: lab.safety || '',
      steps: Array.isArray(lab.steps) ? lab.steps.join('\n') : '',
      challenge: typeof lab.challenge === 'object' ? (lab.challenge?.prompt || '') : (lab.challenge || ''),
      hints: Array.isArray(lab.hints) ? lab.hints.join('\n') : '',
      published: Boolean(lab.published)
    });
  };

  const handleUpdateLab = async (e) => {
    e.preventDefault();
    if (!editingLab) return;
    setBusy(true);
    try {
      const stepsArray = editingLab.steps
        ? editingLab.steps.split('\n').map((s) => s.trim()).filter(Boolean)
        : [];
      const hintsArray = editingLab.hints
        ? editingLab.hints.split('\n').map((h) => h.trim()).filter(Boolean)
        : [];
      await patchJson(`/admin/labs/${editingLab._id}`, {
        title: editingLab.title,
        slug: editingLab.slug,
        level: editingLab.level,
        estimatedMinutes: Number(editingLab.estimatedMinutes) || 25,
        objective: editingLab.objective,
        safety: editingLab.safety,
        steps: stepsArray,
        challenge: editingLab.challenge,
        hints: hintsArray,
        published: editingLab.published
      });
      showToast('Lab scenario updated successfully.', 'success');
      setEditingLab(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update lab scenario.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleLabPublish = async (lab) => {
    try {
      await patchJson(`/admin/labs/${lab._id}`, { published: !lab.published });
      showToast(`Lab scenario ${!lab.published ? 'activated' : 'deactivated'}.`, 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to toggle lab publication.', 'error');
    }
  };

  // ==========================================
  // 3. SERVICE CRUD HANDLERS
  // ==========================================
  const handleCreateService = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const bullets = serviceForm.bullets
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean);
      await postJson('/admin/services', { ...serviceForm, bullets });
      showToast('Service capability created.', 'success');
      setServiceForm({
        title: '',
        slug: '',
        category: 'Offensive Security',
        summary: '',
        bullets: '',
        published: true
      });
      setShowServiceModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to create service.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleOpenEditService = (service) => {
    setEditingService({
      _id: service._id,
      title: service.title || '',
      slug: service.slug || '',
      category: service.category || '',
      summary: service.summary || '',
      bullets: Array.isArray(service.bullets) ? service.bullets.join('\n') : '',
      published: Boolean(service.published)
    });
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    if (!editingService) return;
    setBusy(true);
    try {
      const bullets = editingService.bullets
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean);
      await patchJson(`/admin/services/${editingService._id}`, {
        title: editingService.title,
        slug: editingService.slug,
        category: editingService.category,
        summary: editingService.summary,
        bullets,
        published: editingService.published
      });
      showToast('Service capability updated successfully.', 'success');
      setEditingService(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update service.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleService = async (service) => {
    try {
      await patchJson(`/admin/services/${service._id}`, { published: !service.published });
      showToast(`Service ${!service.published ? 'is now live' : 'is now hidden'}.`, 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update service.', 'error');
    }
  };

  // ==========================================
  // 4. RESEARCH CRUD HANDLERS
  // ==========================================
  const handleCreateResearch = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const tags = researchForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const keyFindings = researchForm.keyFindings
        .split('\n')
        .map((k) => k.trim())
        .filter(Boolean);
      await postJson('/admin/research', {
        ...researchForm,
        tags,
        keyFindings,
        bannerImage: researchForm.bannerImage,
        pocImages: researchForm.pocImages
      });
      showToast('Research whitepaper published dynamically.', 'success');
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
      setShowResearchModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to create research item.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleOpenEditResearch = (item) => {
    setEditingResearch({
      _id: item._id,
      title: item.title || '',
      slug: item.slug || '',
      category: item.category || 'CYBER RESEARCH',
      readTimeMinutes: item.readTimeMinutes || 8,
      summary: item.summary || '',
      keyFindings: Array.isArray(item.keyFindings) ? item.keyFindings.join('\n') : '',
      content: item.content || '',
      architecturePoC: item.architecturePoC || '',
      threatModel: typeof item.threatModel === 'string' ? item.threatModel : JSON.stringify(item.threatModel || ''),
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      url: item.url || '',
      bannerImage: item.bannerImage || '',
      pocImages: Array.isArray(item.pocImages) ? item.pocImages : [],
      status: item.status || 'published'
    });
  };

  const handleUpdateResearch = async (e) => {
    e.preventDefault();
    if (!editingResearch) return;
    setBusy(true);
    try {
      const tags = editingResearch.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const keyFindings = editingResearch.keyFindings
        .split('\n')
        .map((k) => k.trim())
        .filter(Boolean);
      await patchJson(`/admin/research/${editingResearch._id}`, {
        title: editingResearch.title,
        slug: editingResearch.slug,
        category: editingResearch.category,
        readTimeMinutes: Number(editingResearch.readTimeMinutes) || 8,
        summary: editingResearch.summary,
        keyFindings,
        content: editingResearch.content,
        architecturePoC: editingResearch.architecturePoC,
        threatModel: editingResearch.threatModel,
        tags,
        url: editingResearch.url,
        bannerImage: editingResearch.bannerImage,
        pocImages: editingResearch.pocImages,
        status: editingResearch.status
      });
      showToast('Research whitepaper updated successfully.', 'success');
      setEditingResearch(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update research publication.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleResearch = async (item) => {
    try {
      const nextStatus = item.status === 'published' ? 'draft' : 'published';
      await patchJson(`/admin/research/${item._id}`, { status: nextStatus });
      showToast(`Research paper marked as ${nextStatus}.`, 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update research publication.', 'error');
    }
  };

  // ==========================================
  // 5. INQUIRIES & RBAC HANDLERS
  // ==========================================
  const handleUpdateInquiry = async (id, status) => {
    try {
      await patchJson(`/admin/inquiries/${id}`, { status });
      showToast(`Inquiry status updated to ${status}.`, 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update inquiry status.', 'error');
    }
  };

  const handleUpdateUserRole = async (user, role) => {
    try {
      await patchJson(`/admin/users/${user._id}`, { role });
      showToast(`Updated role for ${user.name} to ${role}.`, 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update user role.', 'error');
    }
  };

  const handleToggleUserActive = async (user) => {
    if (user._id === currentUser?.id) {
      showToast('You cannot deactivate your own active administrator account.', 'error');
      return;
    }
    try {
      await patchJson(`/admin/users/${user._id}`, { active: !user.active });
      showToast(`User ${!user.active ? 'activated' : 'disabled'}.`, 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update account status.', 'error');
    }
  };

  const handleDeleteRecord = async (path, label) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${label}? This cannot be undone.`)) return;
    try {
      await deleteJson(path);
      showToast(`${label} deleted permanently.`, 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete record.', 'error');
    }
  };

  // CSV Export Utilities
  const exportInquiriesCSV = () => {
    if (!inquiries.length) {
      showToast('No inquiries available to export.', 'info');
      return;
    }
    const headers = ['ID', 'Client Name', 'Email', 'Company', 'Requested Service', 'Authorized Scope', 'Status', 'Date Received', 'Message'];
    const rows = inquiries.map((i) => [
      i._id,
      `"${(i.name || '').replace(/"/g, '""')}"`,
      `"${(i.email || '').replace(/"/g, '""')}"`,
      `"${(i.company || '').replace(/"/g, '""')}"`,
      `"${(i.service || '').replace(/"/g, '""')}"`,
      i.authorized ? 'YES' : 'NO',
      i.status || 'new',
      new Date(i.createdAt).toISOString(),
      `"${(i.message || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexguard-inquiries-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inquiries CSV exported successfully.', 'success');
  };

  const exportUsersCSV = () => {
    if (!users.length) {
      showToast('No user records to export.', 'info');
      return;
    }
    const headers = ['User ID', 'Full Name', 'Email', 'System Role', 'Active Status', 'Created At'];
    const rows = users.map((u) => [
      u._id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.role || 'student',
      u.active !== false ? 'ACTIVE' : 'DISABLED',
      new Date(u.createdAt).toISOString()
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexguard-identities-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Identities directory exported successfully.', 'success');
  };

  // Filtered queries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      const matchesFilter = inquiryFilter === 'all' || i.status === inquiryFilter;
      const matchesSearch =
        !inquirySearch ||
        i.name?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        i.email?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        i.company?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        i.service?.toLowerCase().includes(inquirySearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [inquiries, inquiryFilter, inquirySearch]);

  const filteredCourses = useMemo(() => {
    return adminCourses.filter((c) => {
      const matchesFilter =
        courseFilter === 'all' ||
        (courseFilter === 'published' && c.published) ||
        (courseFilter === 'draft' && !c.published) ||
        c.level?.toLowerCase() === courseFilter;
      const matchesSearch =
        !courseSearch ||
        c.title?.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.category?.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.slug?.toLowerCase().includes(courseSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [adminCourses, courseFilter, courseSearch]);

  const filteredLabs = useMemo(() => {
    return adminLabs.filter((l) => {
      const matchesLevel = labLevelFilter === 'all' || l.level?.toLowerCase() === labLevelFilter;
      const matchesPublish =
        labPublishFilter === 'all' ||
        (labPublishFilter === 'published' && l.published) ||
        (labPublishFilter === 'draft' && !l.published);
      const matchesSearch =
        !labSearch ||
        l.title?.toLowerCase().includes(labSearch.toLowerCase()) ||
        l.slug?.toLowerCase().includes(labSearch.toLowerCase()) ||
        l.objective?.toLowerCase().includes(labSearch.toLowerCase());
      return matchesLevel && matchesPublish && matchesSearch;
    });
  }, [adminLabs, labLevelFilter, labPublishFilter, labSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchesSearch =
        !userSearch ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, userRoleFilter, userSearch]);

  const instructors = useMemo(() => users.filter((u) => u.role === 'instructor'), [users]);
  const newInquiriesCount = useMemo(() => inquiries.filter((i) => i.status === 'new').length, [inquiries]);

  return (
    <div className="admin-dashboard-root">
      {/* ============================================================ */}
      {/* MODULE 1: COMMAND CENTER & OPS OVERVIEW (tab === 'admin')    */}
      {/* ============================================================ */}
      {tab === 'admin' && (
        <>
          <div className="admin-hero-banner">
            <div className="admin-hero-copy">
              <span className="admin-eyebrow">
                <ShieldCheck size={13} /> OPERATIONS COMMAND & GOVERNANCE
              </span>
              <h2>Cybersecurity Operations Command Center</h2>
              <p>
                Dynamic administration of commercial client scoping requests, interactive sandbox laboratories, curriculum tracks, whitepapers, and RBAC security credentials.
              </p>
            </div>
            <div className="admin-hero-actions">
              <button className="btn-action-primary" onClick={() => setShowCourseModal(true)}>
                <Plus size={15} /> New Track
              </button>
              <button className="btn-action-secondary" onClick={() => setShowLabModal(true)}>
                <Plus size={15} /> New Lab
              </button>
              <button className="btn-action-ghost" onClick={exportInquiriesCSV} title="Export client scoping inquiries to CSV">
                <Download size={14} /> Export Inquiries
              </button>
              <button className="btn-action-ghost" onClick={() => onRefresh?.()} title="Synchronize records with database">
                <RefreshCw size={14} /> Sync DB
              </button>
            </div>
          </div>

          {/* Dynamic KPI Grid */}
          <div className="admin-kpi-grid">
            <div className="kpi-card" onClick={() => onSwitchTab('admin-users')}>
              <div className="kpi-top">
                <span className="kpi-title">SYSTEM IDENTITIES</span>
                <div className="kpi-icon-wrap icon-purple">
                  <Users size={18} />
                </div>
              </div>
              <div className="kpi-value">{overview?.users ?? users.length}</div>
              <div className="kpi-footer">
                <span className="kpi-pill pill-purple">
                  {users.filter(u => u.role === 'administrator').length} Admin · {users.filter(u => u.role === 'instructor').length} Instructors · {users.filter(u => u.role === 'student').length} Students
                </span>
                <span className="kpi-link">Manage RBAC →</span>
              </div>
            </div>

            <div className="kpi-card" onClick={() => onSwitchTab('admin-inquiries')}>
              <div className="kpi-top">
                <span className="kpi-title">CLIENT INQUIRIES</span>
                <div className={`kpi-icon-wrap ${newInquiriesCount > 0 ? 'icon-amber' : 'icon-green'}`}>
                  <ClipboardList size={18} />
                </div>
              </div>
              <div className="kpi-value">
                {overview?.inquiries ?? inquiries.length}
                {newInquiriesCount > 0 && (
                  <span className="kpi-urgent-tag">{newInquiriesCount} NEW</span>
                )}
              </div>
              <div className="kpi-footer">
                <span className="kpi-pill pill-amber">
                  {overview?.openInquiries ?? inquiries.filter(i => i.status !== 'closed').length} Action Required
                </span>
                <span className="kpi-link">Open Desk →</span>
              </div>
            </div>

            <div className="kpi-card" onClick={() => onSwitchTab('admin-courses')}>
              <div className="kpi-top">
                <span className="kpi-title">CURRICULUM TRACKS</span>
                <div className="kpi-icon-wrap icon-cyan">
                  <BookOpen size={18} />
                </div>
              </div>
              <div className="kpi-value">{overview?.courses ?? adminCourses.length}</div>
              <div className="kpi-footer">
                <span className="kpi-pill pill-cyan">
                  {overview?.publishedCourses ?? adminCourses.filter(c => c.published).length} Published Live
                </span>
                <span className="kpi-link">Edit Catalog →</span>
              </div>
            </div>

            <div className="kpi-card" onClick={() => onSwitchTab('admin-labs')}>
              <div className="kpi-top">
                <span className="kpi-title">INTERACTIVE LABS</span>
                <div className="kpi-icon-wrap icon-green">
                  <FlaskConical size={18} />
                </div>
              </div>
              <div className="kpi-value">{overview?.labs ?? adminLabs.length}</div>
              <div className="kpi-footer">
                <span className="kpi-pill pill-green">
                  {overview?.publishedLabs ?? adminLabs.filter(l => l.published).length} Live Scenarios
                </span>
                <span className="kpi-link">Configure Labs →</span>
              </div>
            </div>
          </div>

          {/* Subview Nav */}
          <div className="admin-subview-nav">
            <button
              className={`subview-tab ${subTab === 'overview' ? 'active' : ''}`}
              onClick={() => setSubTab('overview')}
            >
              <Activity size={14} /> Operations Overview
            </button>
            <button
              className={`subview-tab ${subTab === 'inquiries' ? 'active' : ''}`}
              onClick={() => setSubTab('inquiries')}
            >
              <ClipboardList size={14} /> Inbound Inquiries Desk ({newInquiriesCount})
            </button>
          </div>

          {subTab === 'overview' ? (
            <div className="admin-overview-section">
              <div className="admin-section-heading" style={{ marginTop: '16px' }}>
                <h3><Sliders size={16} /> Operational Workflow Launchpad</h3>
                <span>Direct access to administrative centers</span>
              </div>

              <div className="admin-modules-grid">
                <div className="admin-module-card" onClick={() => onSwitchTab('admin-courses')}>
                  <div className="module-card-icon icon-cyan">
                    <BookOpen size={22} />
                  </div>
                  <div className="module-card-body">
                    <h4>Course Tracks & LMS Architect</h4>
                    <p>Design curriculums, edit track contents and lessons, assign certified instructors, and publish live.</p>
                    <div className="module-card-meta">
                      <span>{adminCourses.length} courses loaded</span>
                      <span className="module-action">Manage →</span>
                    </div>
                  </div>
                </div>

                <div className="admin-module-card" onClick={() => onSwitchTab('admin-labs')}>
                  <div className="module-card-icon icon-green">
                    <FlaskConical size={22} />
                  </div>
                  <div className="module-card-body">
                    <h4>Interactive Lab Scenarios</h4>
                    <p>Configure guided sandbox challenges, objectives, steps, and flags with direct editing.</p>
                    <div className="module-card-meta">
                      <span>{adminLabs.length} scenarios online</span>
                      <span className="module-action">Configure →</span>
                    </div>
                  </div>
                </div>

                <div className="admin-module-card" onClick={() => onSwitchTab('admin-inquiries')}>
                  <div className="module-card-icon icon-amber">
                    <ClipboardList size={22} />
                  </div>
                  <div className="module-card-body">
                    <h4>Client Inquiries & Intake Desk</h4>
                    <p>Triage inbound client proposals (VAPT, Red Team, Audits) and inspect authorization scopes.</p>
                    <div className="module-card-meta">
                      <span>{inquiries.length} total inquiries</span>
                      <span className="module-action">Review →</span>
                    </div>
                  </div>
                </div>

                <div className="admin-module-card" onClick={() => onSwitchTab('admin-users')}>
                  <div className="module-card-icon icon-purple">
                    <Users size={22} />
                  </div>
                  <div className="module-card-body">
                    <h4>RBAC & Identity Governance</h4>
                    <p>Manage administrator, instructor, and student roles, active states, and account deletions.</p>
                    <div className="module-card-meta">
                      <span>{users.length} registered accounts</span>
                      <span className="module-action">Govern →</span>
                    </div>
                  </div>
                </div>

                <div className="admin-module-card" onClick={() => onSwitchTab('admin-services')}>
                  <div className="module-card-icon icon-green">
                    <Layers3 size={22} />
                  </div>
                  <div className="module-card-body">
                    <h4>Commercial Security Offerings</h4>
                    <p>Edit security capabilities, scope deliverable bullets, and toggle public availability.</p>
                    <div className="module-card-meta">
                      <span>{services.length} capability cards</span>
                      <span className="module-action">Edit →</span>
                    </div>
                  </div>
                </div>

                <div className="admin-module-card" onClick={() => onSwitchTab('admin-research')}>
                  <div className="module-card-icon icon-cyan">
                    <FileText size={22} />
                  </div>
                  <div className="module-card-body">
                    <h4>Research Intelligence & Papers</h4>
                    <p>Publish and update peer-reviewed security whitepapers, CVE write-ups, and threat modeling disclosures.</p>
                    <div className="module-card-meta">
                      <span>{research.length} publications</span>
                      <span className="module-action">Publish →</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Inquiries Quick Table */}
              <div className="admin-section-heading" style={{ marginTop: '28px' }}>
                <h3><ClipboardList size={16} /> Recent Inbound Client Inquiries</h3>
                <button className="link-action" onClick={() => onSwitchTab('admin-inquiries')}>
                  View all ({inquiries.length}) →
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>CLIENT / REQUESTER</th>
                      <th>REQUESTED SERVICE</th>
                      <th>AUTHORIZATION</th>
                      <th>RECEIVED</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="table-empty">
                          No inquiries received yet. Incoming project inquiries will appear here automatically.
                        </td>
                      </tr>
                    ) : (
                      inquiries.slice(0, 5).map((u) => (
                        <tr key={u._id}>
                          <td>
                            <div className="table-client-info">
                              <b>{u.name}</b>
                              <small>{u.email} {u.company ? `· ${u.company}` : ''}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-service">{u.service}</span>
                          </td>
                          <td>
                            {u.authorized ? (
                              <span className="badge badge-success">
                                <CheckCircle2 size={12} /> Authorized Scope
                              </span>
                            ) : (
                              <span className="badge badge-muted">General Inquiry</span>
                            )}
                          </td>
                          <td>
                            <span className="text-mono-date">{new Date(u.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td>
                            <select
                              className={`status-select status-${u.status}`}
                              value={u.status}
                              onChange={(e) => handleUpdateInquiry(u._id, e.target.value)}
                            >
                              <option value="new">🟡 New</option>
                              <option value="in_review">🔵 In Review</option>
                              <option value="closed">⚪ Closed</option>
                            </select>
                          </td>
                          <td>
                            <div className="table-actions-row">
                              <button
                                className="btn-edit-record"
                                onClick={() => setViewingInquiry(u)}
                                title="View full inquiry"
                              >
                                <Eye size={13} /> View
                              </button>
                              <a
                                href={`mailto:${u.email}?subject=Nexguard%20Security%20Inquiry%20-%20${encodeURIComponent(u.service)}`}
                                className="btn-table-action"
                                style={{ textDecoration: 'none' }}
                              >
                                Reply <Mail size={12} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="admin-inquiries-quick">
              <div className="admin-toolbar">
                <div className="admin-search-wrap">
                  <Search size={15} />
                  <input
                    placeholder="Search client name, email, or service…"
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                  />
                </div>
                <div className="admin-filter-group">
                  <span className="filter-label">Filter:</span>
                  {['all', 'new', 'in_review', 'closed'].map((f) => (
                    <button
                      key={f}
                      className={`filter-btn ${inquiryFilter === f ? 'active' : ''}`}
                      onClick={() => setInquiryFilter(f)}
                    >
                      {f.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="inquiries-desk-grid">
                {filteredInquiries.length === 0 ? (
                  <div className="table-empty" style={{ gridColumn: '1/-1' }}>
                    No inquiries match the current filter.
                  </div>
                ) : (
                  filteredInquiries.map((i) => (
                    <div key={i._id} className={`inquiry-desk-card status-border-${i.status}`}>
                      <div className="inquiry-card-head">
                        <div>
                          <span className="inquiry-client-name">{i.name}</span>
                          <span className="inquiry-client-email">{i.email}</span>
                        </div>
                        <select
                          className={`status-select status-${i.status}`}
                          value={i.status}
                          onChange={(e) => handleUpdateInquiry(i._id, e.target.value)}
                        >
                          <option value="new">🟡 New</option>
                          <option value="in_review">🔵 In Review</option>
                          <option value="closed">⚪ Closed</option>
                        </select>
                      </div>

                      <div className="inquiry-badges-row">
                        <span className="badge badge-service">{i.service}</span>
                        {i.company && <span className="badge badge-company">{i.company}</span>}
                        {i.authorized ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Authorization Verified
                          </span>
                        ) : (
                          <span className="badge badge-muted">General Intake</span>
                        )}
                        <span className="inquiry-date">{new Date(i.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="inquiry-message-box">
                        <p>{i.message}</p>
                      </div>

                      <div className="inquiry-card-foot" style={{ gap: '8px' }}>
                        <button
                          className="btn-edit-record"
                          onClick={() => setViewingInquiry(i)}
                        >
                          <Eye size={13} /> Full Details
                        </button>
                        <a
                          href={`mailto:${i.email}?subject=Nexguard%20Security%20Inquiry%20-%20${encodeURIComponent(i.service)}`}
                          className="btn-reply-email"
                        >
                          Contact Requester <ArrowUpRight size={13} />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* MODULE 2: COURSE CATALOG & LESSONS (tab === 'admin-courses') */}
      {/* ============================================================ */}
      {tab === 'admin-courses' && (
        <>
          <div className="admin-view-header">
            <div>
              <span className="admin-eyebrow">CURRICULUM ARCHITECT & SYLLABUS ENGINE</span>
              <h2>Course Tracks & Syllabus Management</h2>
              <p>Publish, unpublish, update syllabus tracks, manage lesson modules, and assign certified instructors.</p>
            </div>
            <button className="btn-action-primary" onClick={() => setShowCourseModal(true)}>
              <Plus size={15} /> Create Course Track
            </button>
          </div>

          {/* Stat Banner */}
          <div className="admin-view-stat-banner">
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#38bdf8' }} />
              <span>Total Tracks: <b>{adminCourses.length}</b></span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#4ade80' }} />
              <span>Published Live: <b>{adminCourses.filter(c => c.published).length}</b></span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#94a3b8' }} />
              <span>Drafts: <b>{adminCourses.filter(c => !c.published).length}</b></span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#c084fc' }} />
              <span>Total Lessons: <b>{adminCourses.reduce((acc, c) => acc + (c.lessons?.length || 0), 0)}</b></span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search-wrap">
              <Search size={15} />
              <input
                placeholder="Search tracks by title, category, or slug…"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
              />
            </div>
            <div className="admin-filter-group">
              <span className="filter-label">Status:</span>
              {['all', 'published', 'draft'].map((s) => (
                <button
                  key={s}
                  className={`filter-btn ${courseFilter === s ? 'active' : ''}`}
                  onClick={() => setCourseFilter(s)}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>TRACK DETAILS</th>
                  <th>LEVEL / DURATION</th>
                  <th>LESSONS</th>
                  <th>ASSIGNED INSTRUCTOR</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No courses match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div className="table-client-info">
                          <b>{c.title}</b>
                          <small>{c.category} · /{c.slug}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-level">{c.level}</span>
                        <small style={{ display: 'block', marginTop: '4px', color: '#889988' }}>
                          {c.duration}
                        </small>
                      </td>
                      <td>
                        <span className="badge badge-service">
                          {c.lessons?.length || 0} Lessons
                        </span>
                      </td>
                      <td>
                        <select
                          className={`admin-instructor-select ${c.instructor?._id || c.instructor ? 'assigned' : 'unassigned'}`}
                          value={c.instructor?._id || c.instructor || ''}
                          onChange={(e) => handleAssignInstructor(c._id, e.target.value)}
                        >
                          <option value="">No Instructor Assigned</option>
                          {instructors.map((i) => (
                            <option key={i._id} value={i._id}>
                              {i.name} ({i.email})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="table-status-cell">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={c.published}
                            onClick={() => handleToggleCoursePublish(c)}
                            className={`admin-toggle-btn ${c.published ? 'is-active' : 'is-inactive'}`}
                            title={`Status: ${c.published ? 'Live' : 'Draft'}. Click to toggle.`}
                          >
                            <span className="toggle-thumb" />
                          </button>
                          <span className={`status-label-pill ${c.published ? 'live' : 'draft'}`}>
                            {c.published ? 'Live' : 'Draft'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="table-actions-row">
                          <button
                            className="btn-edit-record"
                            onClick={() => handleOpenEditCourse(c)}
                            title="Edit course details and lessons"
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            className="btn-delete-record"
                            onClick={() => handleDeleteRecord(`/admin/courses/${c._id}`, 'course track')}
                            title="Delete course"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* MODULE 3: LAB SCENARIOS (tab === 'admin-labs')               */}
      {/* ============================================================ */}
      {tab === 'admin-labs' && (
        <>
          <div className="admin-view-header">
            <div>
              <span className="admin-eyebrow">SANDBOX LAB SCENARIOS</span>
              <h2>Guided Sandbox Scenario Management</h2>
              <p>Configure hands-on attack & defense scenarios, objectives, guided exercise steps, and flags.</p>
            </div>
            <button className="btn-action-primary" onClick={() => setShowLabModal(true)}>
              <Plus size={15} /> Add Lab Scenario
            </button>
          </div>

          {/* Stat Banner */}
          <div className="admin-view-stat-banner">
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#4ade80' }} />
              <span>Total Labs: <b>{adminLabs.length}</b></span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#baff66' }} />
              <span>Active Online: <b>{adminLabs.filter(l => l.published).length}</b></span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#fbbf24' }} />
              <span>Beginner: <b>{adminLabs.filter(l => l.level === 'Beginner').length}</b></span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#38bdf8' }} />
              <span>Intermediate: <b>{adminLabs.filter(l => l.level === 'Intermediate').length}</b></span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#f87171' }} />
              <span>Advanced: <b>{adminLabs.filter(l => l.level === 'Advanced').length}</b></span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search-wrap">
              <Search size={15} />
              <input
                placeholder="Search labs by title, slug, or objective…"
                value={labSearch}
                onChange={(e) => setLabSearch(e.target.value)}
              />
            </div>
            <div className="admin-filter-group">
              <span className="filter-label">Level:</span>
              {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                <button
                  key={lvl}
                  className={`filter-btn ${labLevelFilter === lvl ? 'active' : ''}`}
                  onClick={() => setLabLevelFilter(lvl)}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="admin-filter-group">
              <span className="filter-label">Status:</span>
              {['all', 'published', 'draft'].map((s) => (
                <button
                  key={s}
                  className={`filter-btn ${labPublishFilter === s ? 'active' : ''}`}
                  onClick={() => setLabPublishFilter(s)}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Labs Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>LAB TITLE & SLUG</th>
                  <th>LEVEL</th>
                  <th>ESTIMATED TIME</th>
                  <th>EXERCISE STEPS</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLabs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No lab scenarios match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLabs.map((l) => (
                    <tr key={l._id}>
                      <td>
                        <div className="table-client-info">
                          <b>{l.title}</b>
                          <small className="text-mono-email">/{l.slug}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-level">{l.level}</span>
                      </td>
                      <td>
                        <span className="text-mono-date">{l.estimatedMinutes || 25} MIN</span>
                      </td>
                      <td>
                        <span className="badge badge-service">{l.steps?.length || 0} Steps</span>
                      </td>
                      <td>
                        <div className="table-status-cell">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={l.published}
                            onClick={() => handleToggleLabPublish(l)}
                            className={`admin-toggle-btn ${l.published ? 'is-active' : 'is-inactive'}`}
                            title={`Status: ${l.published ? 'Online' : 'Draft'}. Click to toggle.`}
                          >
                            <span className="toggle-thumb" />
                          </button>
                          <span className={`status-label-pill ${l.published ? 'live' : 'draft'}`}>
                            {l.published ? 'Online' : 'Draft'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="table-actions-row">
                          <button
                            className="btn-edit-record"
                            onClick={() => handleOpenEditLab(l)}
                            title="Edit lab scenario"
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            className="btn-delete-record"
                            onClick={() => handleDeleteRecord(`/admin/labs/${l._id}`, 'lab scenario')}
                            title="Delete lab"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* MODULE 4: CLIENT INQUIRIES DESK (tab === 'admin-inquiries')  */}
      {/* ============================================================ */}
      {tab === 'admin-inquiries' && (
        <>
          <div className="admin-view-header">
            <div>
              <span className="admin-eyebrow">COMMERCIAL SCOPING & PROPOSALS</span>
              <h2>Client Scoping & Assessment Pipeline</h2>
              <p>Triage client assessments, inspect authorization agreements, update review stages, and contact leads.</p>
            </div>
            <button className="btn-action-secondary" onClick={exportInquiriesCSV}>
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div className="admin-view-stat-banner">
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#f59e0b' }} />
              <span>New Inquiries: <b>{newInquiriesCount}</b></span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#38bdf8' }} />
              <span>In Review: <b>{inquiries.filter(i => i.status === 'in_review').length}</b></span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#64748b' }} />
              <span>Closed: <b>{inquiries.filter(i => i.status === 'closed').length}</b></span>
            </div>
            <div className="admin-stat-item">
              <span className="stat-dot" style={{ background: '#4ade80' }} />
              <span>Authorized Scope Verified: <b>{inquiries.filter(i => i.authorized).length}</b></span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search-wrap">
              <Search size={15} />
              <input
                placeholder="Search by client name, email, company, or service…"
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
              />
            </div>
            <div className="admin-filter-group">
              <span className="filter-label">Filter:</span>
              {['all', 'new', 'in_review', 'closed'].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${inquiryFilter === f ? 'active' : ''}`}
                  onClick={() => setInquiryFilter(f)}
                >
                  {f.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Inquiries Cards Grid */}
          <div className="inquiries-desk-grid">
            {filteredInquiries.length === 0 ? (
              <div className="table-empty" style={{ gridColumn: '1/-1' }}>
                No inquiries match your current filter.
              </div>
            ) : (
              filteredInquiries.map((i) => (
                <div key={i._id} className={`inquiry-desk-card status-border-${i.status}`}>
                  <div className="inquiry-card-head">
                    <div>
                      <span className="inquiry-client-name">{i.name}</span>
                      <span className="inquiry-client-email">{i.email}</span>
                    </div>
                    <select
                      className={`status-select status-${i.status}`}
                      value={i.status}
                      onChange={(e) => handleUpdateInquiry(i._id, e.target.value)}
                    >
                      <option value="new">🟡 New</option>
                      <option value="in_review">🔵 In Review</option>
                      <option value="closed">⚪ Closed</option>
                    </select>
                  </div>

                  <div className="inquiry-badges-row">
                    <span className="badge badge-service">{i.service}</span>
                    {i.company && <span className="badge badge-company">{i.company}</span>}
                    {i.authorized ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> Authorization Verified
                      </span>
                    ) : (
                      <span className="badge badge-muted">General Intake</span>
                    )}
                    <span className="inquiry-date">{new Date(i.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="inquiry-message-box">
                    <p>{i.message}</p>
                  </div>

                  <div className="inquiry-card-foot" style={{ gap: '8px' }}>
                    <button
                      className="btn-edit-record"
                      onClick={() => setViewingInquiry(i)}
                    >
                      <Eye size={13} /> View Scope Details
                    </button>
                    <a
                      href={`mailto:${i.email}?subject=Nexguard%20Security%20Inquiry%20-%20${encodeURIComponent(i.service)}`}
                      className="btn-reply-email"
                    >
                      Contact Requester <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* MODULE 5: SECURITY SERVICES (tab === 'admin-services')       */}
      {/* ============================================================ */}
      {tab === 'admin-services' && (
        <>
          <div className="admin-view-header">
            <div>
              <span className="admin-eyebrow">SECURITY CAPABILITIES</span>
              <h2>Commercial Cyber Services Portfolio</h2>
              <p>Define cybersecurity capabilities, deliverable methodology bullets, and public availability.</p>
            </div>
            <button className="btn-action-primary" onClick={() => setShowServiceModal(true)}>
              <Plus size={15} /> Add Service Offering
            </button>
          </div>

          <div className="admin-cards-grid">
            {services.map((s) => (
              <div key={s._id} className="admin-capability-card">
                <div className="capability-head">
                  <span className="badge badge-service">{s.category}</span>
                  <div className="table-status-cell">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={s.published}
                      onClick={() => handleToggleService(s)}
                      className={`admin-toggle-btn ${s.published ? 'is-active' : 'is-inactive'}`}
                      title={`Status: ${s.published ? 'Live' : 'Hidden'}. Click to toggle.`}
                    >
                      <span className="toggle-thumb" />
                    </button>
                    <span className={`status-label-pill ${s.published ? 'live' : 'draft'}`}>
                      {s.published ? 'Live' : 'Hidden'}
                    </span>
                  </div>
                </div>
                <h4>{s.title}</h4>
                <p>{s.summary}</p>
                {s.bullets && s.bullets.length > 0 && (
                  <ul className="capability-bullets">
                    {s.bullets.map((b, i) => (
                      <li key={i}>
                        <Check size={13} /> {b}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="capability-foot" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    className="btn-edit-record"
                    onClick={() => handleOpenEditService(s)}
                  >
                    <Edit3 size={13} /> Edit Service
                  </button>
                  <button
                    className="btn-delete-record"
                    onClick={() => handleDeleteRecord(`/admin/services/${s._id}`, 'service')}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* MODULE 6: THREAT RESEARCH & PAPERS (tab === 'admin-research')*/}
      {/* ============================================================ */}
      {tab === 'admin-research' && (
        <>
          <div className="admin-view-header">
            <div>
              <span className="admin-eyebrow">INTELLIGENCE DESK</span>
              <h2>Threat Research, CVEs & Technical Whitepapers</h2>
              <p>Publish zero-day vulnerability disclosures, secure architecture guidelines, and threat intelligence reports.</p>
            </div>
            <button className="btn-action-primary" onClick={() => setShowResearchModal(true)}>
              <Plus size={15} /> Publish Whitepaper
            </button>
          </div>

          <div className="admin-cards-grid">
            {research.map((r) => (
              <div key={r._id} className="admin-capability-card">
                <div className="capability-head">
                  <span className="badge badge-level">
                    {r.category || 'CYBER RESEARCH'}
                  </span>
                  <div className="table-status-cell">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={r.status === 'published'}
                      onClick={() => handleToggleResearch(r)}
                      className={`admin-toggle-btn ${r.status === 'published' ? 'is-active' : 'is-inactive'}`}
                      title={`Status: ${r.status === 'published' ? 'Published' : 'Draft'}. Click to toggle.`}
                    >
                      <span className="toggle-thumb" />
                    </button>
                    <span className={`status-label-pill ${r.status === 'published' ? 'live' : 'draft'}`}>
                      {r.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <h4>{r.title}</h4>
                <p>{r.summary}</p>
                {r.tags && r.tags.length > 0 && (
                  <div className="project-stack" style={{ marginTop: '8px', marginBottom: '12px' }}>
                    {r.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                )}
                <div className="capability-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="table-actions-row">
                    <button
                      className="btn-edit-record"
                      onClick={() => handleOpenEditResearch(r)}
                    >
                      <Edit3 size={13} /> Edit Whitepaper
                    </button>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noreferrer" className="link-action" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Doc <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                  <button
                    className="btn-delete-record"
                    onClick={() => handleDeleteRecord(`/admin/research/${r._id}`, 'whitepaper')}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* MODULE 7: USERS & RBAC GOVERNANCE (tab === 'admin-users')     */}
      {/* ============================================================ */}
      {(tab === 'admin-users' || tab === 'admin-security') && (
        <>
          <div className="admin-view-header">
            <div>
              <span className="admin-eyebrow">
                <LockKeyhole size={13} style={{ display: 'inline', marginRight: '4px' }} />
                {tab === 'admin-security' ? 'SECURITY & CREDENTIALS' : 'IDENTITY & ACCESS MANAGEMENT'}
              </span>
              <h2>{tab === 'admin-security' ? 'Admin Password & Security Governance' : 'Role-Based Access Control (RBAC)'}</h2>
              <p>Govern platform privileges, single administrator identity, and update password credentials stored in database.</p>
            </div>
            {tab !== 'admin-security' && (
              <button className="btn-action-secondary" onClick={exportUsersCSV}>
                <Download size={14} /> Export Identities (.csv)
              </button>
            )}
          </div>

          {/* Dedicated Admin Password Update Card */}
          <div className="admin-security-card" style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '28px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
                    Administrator Password & Security
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    NexGuard Master Administrator: <strong style={{ color: '#38bdf8' }}>{currentUser?.email || 'Authenticated Administrator'}</strong>
                  </span>
                </div>
              </div>
              <span style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                SINGLE MASTER ADMIN
              </span>
            </div>

            <form onSubmit={handleChangePassword} style={{ marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 500 }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#f8fafc',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 500 }}>
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#f8fafc',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 500 }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#f8fafc',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="btn-action-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <LockKeyhole size={14} />
                  {pwdLoading ? 'Updating Password…' : 'Update Administrator Password'}
                </button>
              </div>
            </form>
          </div>

          {tab !== 'admin-security' && (
            <>
              {/* Toolbar */}
              <div className="admin-toolbar">
                <div className="admin-search-wrap">
                  <Search size={15} />
                  <input
                    placeholder="Search by user name or email…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <div className="admin-filter-group">
                  <span className="filter-label">Role:</span>
                  {['all', 'administrator', 'instructor', 'student'].map((r) => (
                    <button
                      key={r}
                      className={`filter-btn ${userRoleFilter === r ? 'active' : ''}`}
                      onClick={() => setUserRoleFilter(r)}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>IDENTITY / NAME</th>
                      <th>EMAIL ADDRESS</th>
                      <th>MEMBER SINCE</th>
                      <th>ACCOUNT STATE</th>
                      <th>ASSIGNED ROLE</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="table-empty">
                          No user accounts match the search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isCurrent = u._id === currentUser?.id;
                        return (
                          <tr key={u._id}>
                            <td>
                              <div className="table-user-name">
                                <b>{u.name}</b>
                                {isCurrent && <span className="current-user-tag">YOU (Active Session)</span>}
                              </div>
                            </td>
                            <td>
                              <span className="text-mono-email">{u.email}</span>
                            </td>
                            <td>
                              <span className="text-mono-date">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td>
                              <div className="table-status-cell">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={u.active}
                                  disabled={isCurrent}
                                  onClick={() => handleToggleUserActive(u)}
                                  className={`admin-toggle-btn ${u.active ? 'is-active' : 'is-inactive'}`}
                                  title={isCurrent ? 'Cannot deactivate your active session' : `Status: ${u.active ? 'Active' : 'Disabled'}. Click to toggle.`}
                                >
                                  <span className="toggle-thumb" />
                                </button>
                                <span className={`status-label-pill ${u.active ? 'live' : 'draft'}`}>
                                  {u.active ? 'Active' : 'Disabled'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <select
                                className={`role-select role-${u.role}`}
                                value={u.role}
                                disabled={isCurrent}
                                onChange={(e) => handleUpdateUserRole(u, e.target.value)}
                              >
                                <option value="student">🧑‍💻 Student</option>
                                <option value="instructor">🎓 Instructor</option>
                                <option value="writer">✍️ Verified Writer</option>
                                <option value="administrator">🛡️ Administrator</option>
                              </select>
                            </td>
                            <td>
                              {!isCurrent ? (
                                <button
                                  className="btn-delete-record"
                                  onClick={() => handleDeleteRecord(`/admin/users/${u._id}`, 'user')}
                                  title="Delete user account"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              ) : (
                                <span className="badge badge-muted">Protected</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* MODALS SECTION                                               */}
      {/* ============================================================ */}

      {/* 1. CREATE COURSE MODAL */}
      {showCourseModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCourseModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Create New Course Track</h3>
              <button className="btn-close-modal" onClick={() => setShowCourseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCourse}>
              <label className="admin-field">
                Course Title
                <input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                  minLength={3}
                  maxLength={180}
                  placeholder="e.g. Advanced Cloud Security Architecture"
                />
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  Category
                  <input
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    required
                    placeholder="e.g. Application Security"
                  />
                </label>
                <label className="admin-field">
                  Difficulty Level
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
              </div>
              <label className="admin-field">
                Duration / Pace
                <input
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  placeholder="e.g. 6 weeks · 15 hours"
                />
              </label>
              <label className="admin-field">
                Course Summary & Objectives
                <textarea
                  rows={4}
                  value={courseForm.summary}
                  onChange={(e) => setCourseForm({ ...courseForm, summary: e.target.value })}
                  required
                  minLength={10}
                  maxLength={500}
                  placeholder="Brief overview explaining practical competencies and threat model focus..."
                />
              </label>

              {/* Course Thumbnail / Banner Image */}
              <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                <ImageUploader
                  value={courseForm.thumbnail}
                  onChange={(url) => setCourseForm({ ...courseForm, thumbnail: url })}
                  label="Course Banner / Thumbnail (Local File or Google Drive)"
                  description="Auto-converts to compressed .webp for fast loading and responsive rendering."
                />
              </div>
              <div
                className="admin-modal-toggle-row"
                onClick={() => setCourseForm({ ...courseForm, published: !courseForm.published })}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={courseForm.published}
                  className={`admin-toggle-btn ${courseForm.published ? 'is-active' : 'is-inactive'}`}
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="admin-modal-toggle-label">
                  {courseForm.published ? 'Publish to live catalog immediately' : 'Save as draft track'}
                </span>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-action-ghost" onClick={() => setShowCourseModal(false)}>Cancel</button>
                <button type="submit" className="btn-action-primary" disabled={busy}>
                  {busy ? 'Creating Track…' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT COURSE MODAL (WITH COMPLETE LESSON MANAGER) */}
      {editingCourse && (
        <div className="admin-modal-backdrop" onClick={() => setEditingCourse(null)}>
          <div className="admin-modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <h3>Edit Course Track & Syllabus</h3>
                <small style={{ color: '#7dd3fc' }}>ID: {editingCourse._id}</small>
              </div>
              <button className="btn-close-modal" onClick={() => setEditingCourse(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateCourse}>
              <label className="admin-field">
                Course Title
                <input
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  required
                  minLength={3}
                  maxLength={180}
                />
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  Category
                  <input
                    value={editingCourse.category}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                    required
                  />
                </label>
                <label className="admin-field">
                  URL Slug
                  <input
                    value={editingCourse.slug}
                    onChange={(e) => setEditingCourse({ ...editingCourse, slug: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="admin-field-row">
                <label className="admin-field">
                  Difficulty Level
                  <select
                    value={editingCourse.level}
                    onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
                <label className="admin-field">
                  Duration
                  <input
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  />
                </label>
              </div>
              <label className="admin-field">
                Course Summary
                <textarea
                  rows={3}
                  value={editingCourse.summary}
                  onChange={(e) => setEditingCourse({ ...editingCourse, summary: e.target.value })}
                  required
                  minLength={10}
                />
              </label>

              {/* Course Thumbnail / Banner Image */}
              <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                <ImageUploader
                  value={editingCourse.thumbnail}
                  onChange={(url) => setEditingCourse({ ...editingCourse, thumbnail: url })}
                  label="Course Banner / Thumbnail (Local File or Google Drive)"
                  description="Auto-converts to compressed .webp for fast loading and responsive rendering."
                />
              </div>
              <div
                className="admin-modal-toggle-row"
                onClick={() => setEditingCourse({ ...editingCourse, published: !editingCourse.published })}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={editingCourse.published}
                  className={`admin-toggle-btn ${editingCourse.published ? 'is-active' : 'is-inactive'}`}
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="admin-modal-toggle-label">
                  {editingCourse.published ? 'Published to live catalog' : 'Hidden as draft track'}
                </span>
              </div>

              {/* LESSONS MANAGER */}
              <div className="lesson-manager-section">
                <div className="lesson-manager-header">
                  <h4>
                    <BookOpen size={16} /> Syllabus Lessons ({editingCourse.lessons?.length || 0})
                  </h4>
                  {!showAddLessonForm && (
                    <button
                      type="button"
                      className="btn-add-lesson-toggle"
                      onClick={() => setShowAddLessonForm(true)}
                    >
                      <Plus size={13} /> Add Lesson Module
                    </button>
                  )}
                </div>

                {/* List of existing lessons */}
                <div className="lesson-items-list">
                  {(!editingCourse.lessons || editingCourse.lessons.length === 0) ? (
                    <div className="table-empty" style={{ padding: '16px' }}>
                      No lessons attached yet. Add lesson modules below.
                    </div>
                  ) : (
                    editingCourse.lessons.map((lesson, idx) => (
                      <div key={idx} className="lesson-item-card">
                        <div className="lesson-item-meta">
                          <div className="lesson-item-title">
                            <span className="badge badge-service">Lesson {idx + 1}</span>
                            <b>{lesson.title}</b>
                            <span className="text-mono-date">({lesson.durationMinutes || 15}m)</span>
                          </div>
                          {lesson.summary && <p className="lesson-item-desc">{lesson.summary}</p>}
                        </div>
                        <div className="lesson-item-actions">
                          <button
                            type="button"
                            className="btn-remove-lesson"
                            onClick={() => handleRemoveLesson(idx)}
                            title="Remove this lesson"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Sub-form to add a new lesson */}
                {showAddLessonForm && (
                  <div className="lesson-add-box expanded">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ color: '#baff66', fontSize: '12px' }}>New Lesson Details</b>
                      <button
                        type="button"
                        className="btn-close-modal"
                        style={{ fontSize: '14px' }}
                        onClick={() => setShowAddLessonForm(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="admin-field-row">
                      <label className="admin-field">
                        Lesson Title
                        <input
                          value={newLesson.title}
                          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                          placeholder="e.g. Securing OAuth2 Token Exchanges"
                        />
                      </label>
                      <label className="admin-field">
                        Duration (Minutes)
                        <input
                          type="number"
                          min={5}
                          max={180}
                          value={newLesson.durationMinutes}
                          onChange={(e) => setNewLesson({ ...newLesson, durationMinutes: Number(e.target.value) || 15 })}
                        />
                      </label>
                    </div>
                    <label className="admin-field">
                      Summary
                      <input
                        value={newLesson.summary}
                        onChange={(e) => setNewLesson({ ...newLesson, summary: e.target.value })}
                        placeholder="Brief lesson takeaway..."
                      />
                    </label>
                    <label className="admin-field">
                      Lesson Technical Content / Notes (Markdown or Text)
                      <textarea
                        rows={3}
                        value={newLesson.content}
                        onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                        placeholder="Technical instructions, architecture notes..."
                      />
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-action-ghost"
                        onClick={() => setShowAddLessonForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-action-secondary"
                        onClick={handleAddLessonToEditingCourse}
                      >
                        <Plus size={13} /> Append Lesson
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn-action-ghost" onClick={() => setEditingCourse(null)}>Cancel</button>
                <button type="submit" className="btn-action-primary" disabled={busy}>
                  {busy ? 'Saving Changes…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CREATE LAB MODAL */}
      {showLabModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowLabModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Create Interactive Lab Scenario</h3>
              <button className="btn-close-modal" onClick={() => setShowLabModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateLab}>
              <label className="admin-field">
                Lab Title
                <input
                  value={labForm.title}
                  onChange={(e) => setLabForm({ ...labForm, title: e.target.value })}
                  required
                  minLength={3}
                  placeholder="e.g. Insecure Direct Object Reference (IDOR)"
                />
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  Slug Identifier
                  <input
                    value={labForm.slug}
                    onChange={(e) => setLabForm({ ...labForm, slug: e.target.value })}
                    placeholder="e.g. idor-access-control"
                  />
                </label>
                <label className="admin-field">
                  Difficulty Level
                  <select
                    value={labForm.level}
                    onChange={(e) => setLabForm({ ...labForm, level: e.target.value })}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
              </div>
              <label className="admin-field">
                Estimated Minutes
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={labForm.estimatedMinutes}
                  onChange={(e) => setLabForm({ ...labForm, estimatedMinutes: Number(e.target.value) })}
                />
              </label>
              <label className="admin-field">
                Objective
                <textarea
                  rows={2}
                  value={labForm.objective}
                  onChange={(e) => setLabForm({ ...labForm, objective: e.target.value })}
                  required
                  placeholder="Explain the security concept and defense objective..."
                />
              </label>
              <label className="admin-field">
                Guided Exercise Steps (one per line)
                <textarea
                  rows={4}
                  value={labForm.steps}
                  onChange={(e) => setLabForm({ ...labForm, steps: e.target.value })}
                  placeholder="Step 1: Inspect parameter...&#10;Step 2: Modify resource identifier...&#10;Step 3: Validate server defense"
                />
              </label>
              <label className="admin-field">
                Challenge Prompt / Instructions
                <input
                  value={labForm.challenge}
                  onChange={(e) => setLabForm({ ...labForm, challenge: e.target.value })}
                  required
                  placeholder="Find the boundary vulnerability and document remediation"
                />
              </label>
              <label className="admin-field">
                Hints (one per line, optional)
                <textarea
                  rows={2}
                  value={labForm.hints}
                  onChange={(e) => setLabForm({ ...labForm, hints: e.target.value })}
                  placeholder="Inspect the Authorization header...&#10;Check the user ID parameter"
                />
              </label>
              <div
                className="admin-modal-toggle-row"
                onClick={() => setLabForm({ ...labForm, published: !labForm.published })}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={labForm.published}
                  className={`admin-toggle-btn ${labForm.published ? 'is-active' : 'is-inactive'}`}
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="admin-modal-toggle-label">
                  {labForm.published ? 'Publish scenario online immediately' : 'Keep as draft scenario'}
                </span>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-action-ghost" onClick={() => setShowLabModal(false)}>Cancel</button>
                <button type="submit" className="btn-action-primary" disabled={busy}>
                  {busy ? 'Registering Lab…' : 'Create Lab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. EDIT LAB MODAL */}
      {editingLab && (
        <div className="admin-modal-backdrop" onClick={() => setEditingLab(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <h3>Edit Lab Scenario</h3>
                <small style={{ color: '#7dd3fc' }}>ID: {editingLab._id}</small>
              </div>
              <button className="btn-close-modal" onClick={() => setEditingLab(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateLab}>
              <label className="admin-field">
                Lab Title
                <input
                  value={editingLab.title}
                  onChange={(e) => setEditingLab({ ...editingLab, title: e.target.value })}
                  required
                />
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  Slug
                  <input
                    value={editingLab.slug}
                    onChange={(e) => setEditingLab({ ...editingLab, slug: e.target.value })}
                    required
                  />
                </label>
                <label className="admin-field">
                  Level
                  <select
                    value={editingLab.level}
                    onChange={(e) => setEditingLab({ ...editingLab, level: e.target.value })}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
              </div>
              <div className="admin-field-row">
                <label className="admin-field">
                  Estimated Minutes
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={editingLab.estimatedMinutes}
                    onChange={(e) => setEditingLab({ ...editingLab, estimatedMinutes: Number(e.target.value) })}
                  />
                </label>
                <label className="admin-field">
                  Safety Guideline
                  <input
                    value={editingLab.safety}
                    onChange={(e) => setEditingLab({ ...editingLab, safety: e.target.value })}
                  />
                </label>
              </div>
              <label className="admin-field">
                Objective
                <textarea
                  rows={2}
                  value={editingLab.objective}
                  onChange={(e) => setEditingLab({ ...editingLab, objective: e.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                Exercise Steps (one per line)
                <textarea
                  rows={4}
                  value={editingLab.steps}
                  onChange={(e) => setEditingLab({ ...editingLab, steps: e.target.value })}
                />
              </label>
              <label className="admin-field">
                Challenge Prompt / Instructions
                <input
                  value={editingLab.challenge}
                  onChange={(e) => setEditingLab({ ...editingLab, challenge: e.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                Hints (one per line)
                <textarea
                  rows={2}
                  value={editingLab.hints}
                  onChange={(e) => setEditingLab({ ...editingLab, hints: e.target.value })}
                />
              </label>
              <div
                className="admin-modal-toggle-row"
                onClick={() => setEditingLab({ ...editingLab, published: !editingLab.published })}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={editingLab.published}
                  className={`admin-toggle-btn ${editingLab.published ? 'is-active' : 'is-inactive'}`}
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="admin-modal-toggle-label">
                  {editingLab.published ? 'Scenario is Live / Online' : 'Scenario is Hidden / Offline'}
                </span>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-action-ghost" onClick={() => setEditingLab(null)}>Cancel</button>
                <button type="submit" className="btn-action-primary" disabled={busy}>
                  {busy ? 'Saving Changes…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CREATE SERVICE MODAL */}
      {showServiceModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowServiceModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Add Security Service Capability</h3>
              <button className="btn-close-modal" onClick={() => setShowServiceModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateService}>
              <label className="admin-field">
                Service Title
                <input
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  required
                  minLength={3}
                  placeholder="e.g. Cloud Security Posture Assessment"
                />
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  Category
                  <input
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    required
                    placeholder="e.g. Cloud Security"
                  />
                </label>
                <label className="admin-field">
                  Slug (optional)
                  <input
                    value={serviceForm.slug}
                    onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })}
                    placeholder="e.g. cloud-security-posture"
                  />
                </label>
              </div>
              <label className="admin-field">
                Executive Summary
                <textarea
                  rows={3}
                  value={serviceForm.summary}
                  onChange={(e) => setServiceForm({ ...serviceForm, summary: e.target.value })}
                  required
                  minLength={10}
                  maxLength={1000}
                  placeholder="Describe methodology and client outcomes..."
                />
              </label>
              <label className="admin-field">
                Scope Bullets (one per line)
                <textarea
                  rows={4}
                  value={serviceForm.bullets}
                  onChange={(e) => setServiceForm({ ...serviceForm, bullets: e.target.value })}
                  placeholder="AWS / Azure posture review&#10;IAM privilege creep analysis&#10;Hardened configuration roadmap"
                />
              </label>
              <div
                className="admin-modal-toggle-row"
                onClick={() => setServiceForm({ ...serviceForm, published: !serviceForm.published })}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={serviceForm.published}
                  className={`admin-toggle-btn ${serviceForm.published ? 'is-active' : 'is-inactive'}`}
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="admin-modal-toggle-label">
                  {serviceForm.published ? 'Publish capability to public offerings' : 'Keep hidden as draft'}
                </span>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-action-ghost" onClick={() => setShowServiceModal(false)}>Cancel</button>
                <button type="submit" className="btn-action-primary" disabled={busy}>
                  {busy ? 'Saving Capability…' : 'Add Capability'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT SERVICE MODAL */}
      {editingService && (
        <div className="admin-modal-backdrop" onClick={() => setEditingService(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <h3>Edit Security Service</h3>
                <small style={{ color: '#7dd3fc' }}>ID: {editingService._id}</small>
              </div>
              <button className="btn-close-modal" onClick={() => setEditingService(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateService}>
              <label className="admin-field">
                Service Title
                <input
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  required
                />
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  Category
                  <input
                    value={editingService.category}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    required
                  />
                </label>
                <label className="admin-field">
                  Slug
                  <input
                    value={editingService.slug}
                    onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label className="admin-field">
                Executive Summary
                <textarea
                  rows={3}
                  value={editingService.summary}
                  onChange={(e) => setEditingService({ ...editingService, summary: e.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                Scope Bullets (one per line)
                <textarea
                  rows={4}
                  value={editingService.bullets}
                  onChange={(e) => setEditingService({ ...editingService, bullets: e.target.value })}
                />
              </label>
              <div
                className="admin-modal-toggle-row"
                onClick={() => setEditingService({ ...editingService, published: !editingService.published })}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={editingService.published}
                  className={`admin-toggle-btn ${editingService.published ? 'is-active' : 'is-inactive'}`}
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="admin-modal-toggle-label">
                  {editingService.published ? 'Publish capability to public offerings' : 'Keep hidden as draft'}
                </span>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-action-ghost" onClick={() => setEditingService(null)}>Cancel</button>
                <button type="submit" className="btn-action-primary" disabled={busy}>
                  {busy ? 'Saving Changes…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. CREATE RESEARCH MODAL */}
      {showResearchModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowResearchModal(false)}>
          <div className="admin-modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Publish Security Whitepaper</h3>
              <button className="btn-close-modal" onClick={() => setShowResearchModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateResearch}>
              <label className="admin-field">
                Paper Title
                <input
                  value={researchForm.title}
                  onChange={(e) => setResearchForm({ ...researchForm, title: e.target.value })}
                  required
                  minLength={3}
                  placeholder="e.g. Zero-Trust Token Boundaries in Single-Page Applications"
                />
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  Category
                  <input
                    value={researchForm.category}
                    onChange={(e) => setResearchForm({ ...researchForm, category: e.target.value })}
                    placeholder="e.g. RED TEAM, AI SECURITY, ARCHITECTURE"
                  />
                </label>
                <label className="admin-field">
                  URL Slug (optional)
                  <input
                    value={researchForm.slug}
                    onChange={(e) => setResearchForm({ ...researchForm, slug: e.target.value })}
                    placeholder="e.g. zero-trust-token-boundaries"
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
                Summary / Abstract
                <textarea
                  rows={3}
                  value={researchForm.summary}
                  onChange={(e) => setResearchForm({ ...researchForm, summary: e.target.value })}
                  required
                  minLength={10}
                  placeholder="Brief description of finding, attack vector, or defense architecture..."
                />
              </label>
              <label className="admin-field">
                Key Findings / Discoveries (one per line)
                <textarea
                  rows={3}
                  value={researchForm.keyFindings}
                  onChange={(e) => setResearchForm({ ...researchForm, keyFindings: e.target.value })}
                  placeholder="Finding 1: Over 68% of standard pentests...&#10;Finding 2: Automating atomic tests..."
                />
              </label>
              <label className="admin-field">
                Full Technical Content (Deep Architecture / Methodologies)
                <textarea
                  rows={5}
                  value={researchForm.content}
                  onChange={(e) => setResearchForm({ ...researchForm, content: e.target.value })}
                  placeholder="Comprehensive technical breakdown, failure modes, and architectural analysis..."
                />
              </label>
              <label className="admin-field">
                Architecture PoC / Detection Artifact (Code, Sigma Rule, or Payload)
                <textarea
                  rows={4}
                  value={researchForm.architecturePoC}
                  onChange={(e) => setResearchForm({ ...researchForm, architecturePoC: e.target.value })}
                  placeholder="title: Sigma Rule Detection...&#10;or JavaScript Interceptor implementation..."
                />
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  Threat Model / MITRE Mapping
                  <input
                    value={researchForm.threatModel}
                    onChange={(e) => setResearchForm({ ...researchForm, threatModel: e.target.value })}
                    placeholder="e.g. MITRE ATT&CK T1059.001, T1055 · OWASP LLM01"
                  />
                </label>
                <label className="admin-field">
                  Tags (comma-separated)
                  <input
                    value={researchForm.tags}
                    onChange={(e) => setResearchForm({ ...researchForm, tags: e.target.value })}
                    placeholder="AppSec, Zero-Trust, JWT, Red Team"
                  />
                </label>
              </div>

              {/* Research Banner Image Uploader */}
              <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                <ImageUploader
                  value={researchForm.bannerImage}
                  onChange={(url) => setResearchForm({ ...researchForm, bannerImage: url })}
                  label="Research Banner Image (Local File or Google Drive)"
                  description="Automatically converted to .webp for high-efficiency display."
                />
              </div>

              {/* Multiple PoC Evidence Visuals */}
              <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                <PocImageManager
                  images={researchForm.pocImages || []}
                  onChange={(pocImages) => setResearchForm({ ...researchForm, pocImages })}
                  label="Proof-of-Concept (PoC) Visual Evidence & Screenshots"
                  description="Attach verification screenshots, execution proof, or diagrams. Auto-converted to .webp."
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
                    ? 'Publish to intelligence feed immediately (Live)'
                    : 'Save as internal draft only (Hidden)'}
                </span>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-action-ghost" onClick={() => setShowResearchModal(false)}>Cancel</button>
                <button type="submit" className="btn-action-primary" disabled={busy}>
                  {busy ? 'Publishing…' : 'Publish Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. EDIT RESEARCH MODAL */}
      {editingResearch && (
        <div className="admin-modal-backdrop" onClick={() => setEditingResearch(null)}>
          <div className="admin-modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <h3>Edit Threat Research & Whitepaper</h3>
                <small style={{ color: '#7dd3fc' }}>ID: {editingResearch._id}</small>
              </div>
              <button className="btn-close-modal" onClick={() => setEditingResearch(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateResearch}>
              <label className="admin-field">
                Paper Title
                <input
                  value={editingResearch.title}
                  onChange={(e) => setEditingResearch({ ...editingResearch, title: e.target.value })}
                  required
                />
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  Category
                  <input
                    value={editingResearch.category}
                    onChange={(e) => setEditingResearch({ ...editingResearch, category: e.target.value })}
                    required
                  />
                </label>
                <label className="admin-field">
                  URL Slug
                  <input
                    value={editingResearch.slug}
                    onChange={(e) => setEditingResearch({ ...editingResearch, slug: e.target.value })}
                    required
                  />
                </label>
                <label className="admin-field">
                  Read Time (Mins)
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={editingResearch.readTimeMinutes}
                    onChange={(e) => setEditingResearch({ ...editingResearch, readTimeMinutes: Number(e.target.value) || 8 })}
                  />
                </label>
              </div>
              <label className="admin-field">
                Summary / Abstract
                <textarea
                  rows={3}
                  value={editingResearch.summary}
                  onChange={(e) => setEditingResearch({ ...editingResearch, summary: e.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                Key Findings (one per line)
                <textarea
                  rows={3}
                  value={editingResearch.keyFindings}
                  onChange={(e) => setEditingResearch({ ...editingResearch, keyFindings: e.target.value })}
                />
              </label>
              <label className="admin-field">
                Full Technical Whitepaper Content
                <textarea
                  rows={6}
                  value={editingResearch.content}
                  onChange={(e) => setEditingResearch({ ...editingResearch, content: e.target.value })}
                />
              </label>
              <label className="admin-field">
                Architecture PoC / Code Artifact
                <textarea
                  rows={4}
                  value={editingResearch.architecturePoC}
                  onChange={(e) => setEditingResearch({ ...editingResearch, architecturePoC: e.target.value })}
                />
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  Threat Model / MITRE Mapping
                  <input
                    value={editingResearch.threatModel}
                    onChange={(e) => setEditingResearch({ ...editingResearch, threatModel: e.target.value })}
                  />
                </label>
                <label className="admin-field">
                  Tags (comma-separated)
                  <input
                    value={editingResearch.tags}
                    onChange={(e) => setEditingResearch({ ...editingResearch, tags: e.target.value })}
                  />
                </label>
              </div>
              <label className="admin-field">
                External Publication URL (optional)
                <input
                  value={editingResearch.url}
                  onChange={(e) => setEditingResearch({ ...editingResearch, url: e.target.value })}
                />
              </label>

              {/* Research Banner Image Uploader */}
              <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                <ImageUploader
                  value={editingResearch.bannerImage}
                  onChange={(url) => setEditingResearch({ ...editingResearch, bannerImage: url })}
                  label="Research Banner Image (Local File or Google Drive)"
                  description="Automatically converted to .webp for high-efficiency display."
                />
              </div>

              {/* Multiple PoC Evidence Visuals */}
              <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                <PocImageManager
                  images={editingResearch.pocImages || []}
                  onChange={(pocImages) => setEditingResearch({ ...editingResearch, pocImages })}
                  label="Proof-of-Concept (PoC) Visual Evidence & Screenshots"
                  description="Attach verification screenshots, execution proof, or diagrams. Auto-converted to .webp."
                />
              </div>
              <div
                className="admin-modal-toggle-row"
                onClick={() =>
                  setEditingResearch({
                    ...editingResearch,
                    status: editingResearch.status === 'published' ? 'draft' : 'published'
                  })
                }
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={editingResearch.status === 'published'}
                  className={`admin-toggle-btn ${editingResearch.status === 'published' ? 'is-active' : 'is-inactive'}`}
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="admin-modal-toggle-label">
                  {editingResearch.status === 'published'
                    ? 'Published to intelligence feed (Live)'
                    : 'Internal draft status (Hidden)'}
                </span>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-action-ghost" onClick={() => setEditingResearch(null)}>Cancel</button>
                <button type="submit" className="btn-action-primary" disabled={busy}>
                  {busy ? 'Saving Changes…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. VIEW INQUIRY DETAILS MODAL */}
      {viewingInquiry && (
        <div className="admin-modal-backdrop" onClick={() => setViewingInquiry(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <h3>Client Scoping Inquiry Details</h3>
                <small style={{ color: '#7dd3fc' }}>ID: {viewingInquiry._id}</small>
              </div>
              <button className="btn-close-modal" onClick={() => setViewingInquiry(null)}>✕</button>
            </div>
            <div className="inquiry-detail-view">
              <div className="inquiry-meta-grid">
                <div className="inquiry-meta-item">
                  <label>CLIENT NAME</label>
                  <span>{viewingInquiry.name}</span>
                </div>
                <div className="inquiry-meta-item">
                  <label>EMAIL ADDRESS</label>
                  <span className="text-mono-email">{viewingInquiry.email}</span>
                </div>
                <div className="inquiry-meta-item">
                  <label>ORGANIZATION / COMPANY</label>
                  <span>{viewingInquiry.company || 'Not Specified'}</span>
                </div>
                <div className="inquiry-meta-item">
                  <label>REQUESTED SERVICE</label>
                  <span className="badge badge-service">{viewingInquiry.service}</span>
                </div>
                <div className="inquiry-meta-item">
                  <label>SCOPE AUTHORIZATION</label>
                  <span>
                    {viewingInquiry.authorized ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> Authorized Verified
                      </span>
                    ) : (
                      <span className="badge badge-muted">General Intake</span>
                    )}
                  </span>
                </div>
                <div className="inquiry-meta-item">
                  <label>DATE SUBMITTED</label>
                  <span className="text-mono-date">{new Date(viewingInquiry.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#8da496', marginBottom: '6px', fontWeight: 600 }}>
                  INQUIRY SCOPE MESSAGE & OBJECTIVES:
                </label>
                <div className="inquiry-full-message">
                  {viewingInquiry.message}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8da496' }}>Status:</span>
                  <select
                    className={`status-select status-${viewingInquiry.status}`}
                    value={viewingInquiry.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      handleUpdateInquiry(viewingInquiry._id, newStatus);
                      setViewingInquiry({ ...viewingInquiry, status: newStatus });
                    }}
                  >
                    <option value="new">🟡 New</option>
                    <option value="in_review">🔵 In Review</option>
                    <option value="closed">⚪ Closed</option>
                  </select>
                </div>
                <a
                  href={`mailto:${viewingInquiry.email}?subject=Nexguard%20Security%20Inquiry%20-%20${encodeURIComponent(viewingInquiry.service)}`}
                  className="btn-action-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <Mail size={13} /> Respond via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
