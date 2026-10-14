import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

// Context Providers
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { WishlistCartProvider } from './context/WishlistCartContext.jsx';
import { apiRequest } from './api/client.js';

// Modular Public Components
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import WishlistCartDrawer from './components/common/WishlistCartDrawer.jsx';
import HeroSection from './components/public/HeroSection.jsx';
import ServicesSection from './components/public/ServicesSection.jsx';
import ServiceDetailPage from './components/public/ServiceDetailPage.jsx';
import ApproachSection from './components/public/ApproachSection.jsx';
import AcademySection from './components/academy/AcademySection.jsx';
import CopilotSection from './components/public/CopilotSection.jsx';
import ResearchSection from './components/public/ResearchSection.jsx';
import ResearchDetailPage from './components/public/ResearchDetailPage.jsx';
import AllResearchPage from './components/public/AllResearchPage.jsx';
import CourseDetailPage from './components/public/CourseDetailPage.jsx';
import ContactSection from './components/public/ContactSection.jsx';
import CopilotModal from './components/public/CopilotModal.jsx';

// Platform Modal
import Platform from './Platform.jsx';


function App() {
  const [platformOpen, setPlatformOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);

  const [publishedResearch, setPublishedResearch] = useState([]);
  const [researchLoading, setResearchLoading] = useState(true);
  const [researchError, setResearchError] = useState(null);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  // Deep-linking / Routing for Service Details
  const [activeServiceSlug, setActiveServiceSlug] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#service/')) {
      return window.location.hash.replace('#service/', '').trim();
    }
    return null;
  });

  // Deep-linking / Routing for Research Details
  const [activeResearchSlug, setActiveResearchSlug] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#research/')) {
      return window.location.hash.replace('#research/', '').trim();
    }
    return null;
  });

  // Deep-linking / Routing for Academy Course Details
  const [activeCourseSlug, setActiveCourseSlug] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#course/')) return hash.replace('#course/', '').trim();
      if (hash.startsWith('#curriculum/')) return hash.replace('#curriculum/', '').trim();
    }
    return null;
  });

  const [preselectedContactService, setPreselectedContactService] = useState('');

  // Handle URL hash routing (Back/Forward browser buttons & in-app link clicks)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin' || hash === '#platform' || hash === '#instructor') {
        setPlatformOpen(true);
        setActiveServiceSlug(null);
        setActiveResearchSlug(null);
        setActiveCourseSlug(null);
        return;
      }
      if (hash.startsWith('#service/')) {
        setPlatformOpen(false);
        const slug = hash.replace('#service/', '').trim();
        setActiveServiceSlug(slug || null);
        setActiveResearchSlug(null);
        setActiveCourseSlug(null);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else if (hash.startsWith('#research/')) {
        setPlatformOpen(false);
        const slug = hash.replace('#research/', '').trim();
        setActiveResearchSlug(slug || null);
        setActiveServiceSlug(null);
        setActiveCourseSlug(null);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else if (hash.startsWith('#course/')) {
        setPlatformOpen(false);
        const slug = hash.replace('#course/', '').trim();
        setActiveCourseSlug(slug || null);
        setActiveServiceSlug(null);
        setActiveResearchSlug(null);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else if (hash.startsWith('#curriculum/')) {
        setPlatformOpen(false);
        const slug = hash.replace('#curriculum/', '').trim();
        setActiveCourseSlug(slug || null);
        setActiveServiceSlug(null);
        setActiveResearchSlug(null);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else {
        setActiveServiceSlug(null);
        setActiveResearchSlug(null);
        setActiveCourseSlug(null);
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const fetchServices = () => {
    setServicesLoading(true);
    setServicesError(null);
    apiRequest('/services')
      .then((data) => {
        if (data?.services) {
          setServices(
            data.services.map((s, i) => ({
              ...s,
              n: s.number || String(i + 1).padStart(2, '0'),
              tag: s.category?.toUpperCase() || 'CAPABILITY',
              desc: s.summary,
              items: s.bullets?.length ? s.bullets : ['Scope-defined delivery', 'Evidence-led recommendations', 'Practical next steps']
            }))
          );
        }
      })
      .catch((err) => {
        setServicesError(err.message || 'Unable to connect to service database.');
      })
      .finally(() => setServicesLoading(false));
  };

  const fetchResearch = () => {
    setResearchLoading(true);
    setResearchError(null);
    apiRequest('/research')
      .then((data) => {
        if (data?.research) {
          setPublishedResearch(data.research);
        }
      })
      .catch((err) => {
        setResearchError(err.message || 'Unable to connect to research database.');
      })
      .finally(() => setResearchLoading(false));
  };

  const fetchCourses = () => {
    setCoursesLoading(true);
    setCoursesError(null);
    apiRequest('/courses')
      .then((data) => {
        if (data?.courses) {
          setCourses(data.courses);
        }
      })
      .catch((err) => {
        setCoursesError(err.message || 'Unable to connect to course database.');
      })
      .finally(() => setCoursesLoading(false));
  };

  useEffect(() => {
    fetchServices();
    fetchResearch();
    fetchCourses();
  }, []);

  // Professional Scroll-Reveal IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    // Small delay to ensure DOM nodes have mounted
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -40px 0px',
          threshold: 0.08
        }
      );

      const selector = '.section-heading, .services-grid, .service-card, .process-row, .courses-grid, .course-card, .copilot-panel, .project-card, .contact-layout, .research-cta-banner, .approach-layout, .tech-capability-card';
      const elements = document.querySelectorAll(selector);

      elements.forEach((el) => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [activeServiceSlug, activeResearchSlug, services, publishedResearch, courses]);

  const handleOpenPlatformCourse = (course) => {
    setSelectedCourse(course);
    setPlatformOpen(true);
  };

  const handleSelectService = (slug) => {
    setActiveResearchSlug(null);
    setActiveServiceSlug(slug);
    window.location.hash = `#service/${slug}`;
  };

  const handleBackToServices = () => {
    setActiveServiceSlug(null);
    window.location.hash = '#services';
    setTimeout(() => {
      const el = document.getElementById('services');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSelectResearch = (slug) => {
    setActiveServiceSlug(null);
    setActiveResearchSlug(slug);
    window.location.hash = `#research/${slug}`;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleBackToResearch = () => {
    setActiveResearchSlug(null);
    window.location.hash = '#research';
    setTimeout(() => {
      const el = document.getElementById('research');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleScopeService = (serviceTitle) => {
    setActiveServiceSlug(null);
    setActiveResearchSlug(null);
    setPreselectedContactService(serviceTitle);
    window.location.hash = '#contact';
    setTimeout(() => {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleContactResearch = (researchTitle) => {
    setActiveServiceSlug(null);
    setActiveResearchSlug(null);
    setActiveCourseSlug(null);
    setPreselectedContactService(`Research Inquiry: ${researchTitle}`);
    window.location.hash = '#contact';
    setTimeout(() => {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSelectCourse = (slug) => {
    setActiveServiceSlug(null);
    setActiveResearchSlug(null);
    setActiveCourseSlug(slug);
    window.location.hash = `#course/${slug}`;
  };

  const handleBackToAcademy = () => {
    setActiveCourseSlug(null);
    window.location.hash = '#academy';
    setTimeout(() => {
      const el = document.getElementById('academy');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleInquireCohort = (courseTitle) => {
    setActiveCourseSlug(null);
    setPreselectedContactService(`Academy Cohort Inquiry: ${courseTitle}`);
    window.location.hash = '#contact';
    setTimeout(() => {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      <Navbar onOpenPlatform={() => setPlatformOpen(true)} />

      <main>
        {activeServiceSlug ? (
          <div className="page-view-enter" key={`service-${activeServiceSlug}`}>
            <ServiceDetailPage
              serviceSlug={activeServiceSlug}
              onBack={handleBackToServices}
              onScopeService={handleScopeService}
            />
          </div>
        ) : activeResearchSlug ? (
          activeResearchSlug === 'all' ? (
            <div className="page-view-enter" key="research-all">
              <AllResearchPage
                publishedResearch={publishedResearch}
                onSelectResearch={handleSelectResearch}
                onBack={handleBackToResearch}
              />
            </div>
          ) : (
            <div className="page-view-enter" key={`research-${activeResearchSlug}`}>
              <ResearchDetailPage
                articleSlug={activeResearchSlug}
                onBack={handleBackToResearch}
                onContact={handleContactResearch}
              />
            </div>
          )
        ) : activeCourseSlug ? (
          <div className="page-view-enter" key={`course-${activeCourseSlug}`}>
            <CourseDetailPage
              courseSlug={activeCourseSlug}
              onBack={handleBackToAcademy}
              onOpenPlatform={handleOpenPlatformCourse}
              onInquireCohort={handleInquireCohort}
            />
          </div>
        ) : (
          <div className="page-view-enter" key="home">
            <HeroSection />
            <ServicesSection
              services={services}
              loading={servicesLoading}
              error={servicesError}
              onRetry={fetchServices}
              onSelectService={handleSelectService}
            />
            <ApproachSection />
            <AcademySection
              courses={courses}
              loading={coursesLoading}
              error={coursesError}
              onRetry={fetchCourses}
              onSelectCourse={handleSelectCourse}
              onOpenPlatform={handleOpenPlatformCourse}
            />
            <CopilotSection onOpenChat={() => setChatOpen(true)} />
            <ResearchSection
              publishedResearch={publishedResearch}
              loading={researchLoading}
              error={researchError}
              onRetry={fetchResearch}
              onSelectResearch={handleSelectResearch}
            />
            <ContactSection preselectedService={preselectedContactService} />
          </div>
        )}
      </main>

      <Footer />

      <WishlistCartDrawer
        onOpenPlatform={() => setPlatformOpen(true)}
        onOpenContact={() => handleScopeService('General Inquiry')}
      />

      {platformOpen && (
        <Platform
          initialCourse={selectedCourse}
          onClose={() => {
            setPlatformOpen(false);
            setSelectedCourse(null);
          }}
        />
      )}

      <CopilotModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <WishlistCartProvider>
          <App />
        </WishlistCartProvider>
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);

