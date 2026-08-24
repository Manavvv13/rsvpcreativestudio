import React, { useState, useEffect, useRef } from 'react';
import Starfield from './Starfield';
import SparkleIcon from './SparkleIcon';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [showAshtechPage, setShowAshtechPage] = useState(false);

  const ashtechVideos = [
    { src: '/ash 1.mp4' },
    { src: '/ash 2.mp4' },
    { src: '/ash 3.mp4' },
    { src: '/reel 4.mp4' },
    { src: '/ash 4.mp4' },
    { src: '/ash 5.mp4' }
  ];

  const handleEmailClick = (e) => {
    // Copy the email to clipboard as a premium fallback
    navigator.clipboard.writeText('vaibhav@rsvpcreativestudio.com').then(() => {
      setEmailCopied(true);
      setTimeout(() => {
        setEmailCopied(false);
      }, 2500);
    }).catch(err => {
      console.error('Could not copy email: ', err);
    });
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [coords, setCoords] = useState({
    heroX: 0,
    heroY: 0,
    heroW: 0,
    heroH: 0,
    missionX: 0,
    missionY: 0,
    missionW: 0,
    missionH: 0
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeProgress, setActiveProgress] = useState(0);
  const [isMeasured, setIsMeasured] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeService, setActiveService] = useState(0);
  const [logoState, setLogoState] = useState('preloader');
  const carouselRef = useRef(null);

  // Preloader animation states
  const [preloaderProgress, setPreloaderProgress] = useState(0);
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [preloaderFadeOut, setPreloaderFadeOut] = useState(false);

  const heroPlaceholderRef = useRef(null);
  const missionPlaceholderRef = useRef(null);

  const measurePositions = () => {
    const heroEl = heroPlaceholderRef.current;
    const missionEl = missionPlaceholderRef.current;
    if (!heroEl || !missionEl) return;

    const heroRect = heroEl.getBoundingClientRect();
    const missionRect = missionEl.getBoundingClientRect();

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    setCoords({
      heroX: heroRect.left + scrollX,
      heroY: heroRect.top + scrollY,
      heroW: heroRect.width,
      heroH: heroRect.height,
      missionX: missionRect.left + scrollX,
      missionY: missionRect.top + scrollY,
      missionW: missionRect.width,
      missionH: missionRect.height
    });
    setIsMeasured(true);
  };

  // Simulate preloader loading sequence
  useEffect(() => {
    // Force page scroll reset to Hero section on reload
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    let progressInterval;
    
    // Add overflow hidden class to body
    document.body.classList.add('preloader-active');
    
    progressInterval = setInterval(() => {
      setPreloaderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // 1. Measure layout and start smooth transition from Preloader center to Hero placeholder
          setTimeout(() => {
            measurePositions();
            setLogoState('transitioning-to-hero');
          }, 50);

          // 2. Start preloader fade-out while logo is flying
          setTimeout(() => {
            setPreloaderFadeOut(true);
            document.body.classList.remove('preloader-active');
            setTimeout(() => {
              setPreloaderVisible(false);
            }, 800); // matches transition timing
          }, 450);

          // 3. Switch to scroll-linked tracking after logo arrives in Hero section
          setTimeout(() => {
            setLogoState('scroll-tracking');
          }, 1500); // 50ms + 1400ms transition time
          
          return 100;
        }
        const inc = Math.floor(Math.random() * 8) + 2;
        return Math.min(100, prev + inc);
      });
    }, 45);

    return () => {
      clearInterval(progressInterval);
      document.body.classList.remove('preloader-active');
    };
  }, []);

  // Measure positions once preloader finishes and DOM settles
  useEffect(() => {
    if (!preloaderVisible) {
      measurePositions();

      const t1 = setTimeout(measurePositions, 100);
      const t2 = setTimeout(measurePositions, 400);
      const t3 = setTimeout(measurePositions, 800);

      window.addEventListener('resize', measurePositions);
      window.addEventListener('load', measurePositions);

      if (document.fonts) {
        document.fonts.ready.then(measurePositions);
      }

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        window.removeEventListener('resize', measurePositions);
        window.removeEventListener('load', measurePositions);
      };
    }
  }, [preloaderVisible]);

  // Scroll to top when transitioning to/from the subpage
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showAshtechPage]);

  // Track scroll position to update header background, scroll spy, and animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      
      // Header background opacity trigger
      setIsHeaderScrolled(scrollPos > 50);

      // Scroll Spy logic
      const sections = ['hero', 'mission', 'work', 'team', 'services', 'contact'];
      let currentSection = 'hero';
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop - 120; // adjust offset for header height
          const offsetHeight = element.offsetHeight;
          
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            currentSection = sectionId;
            break;
          }
        }
      }
      
      setActiveSection(currentSection);

      // Calculate scroll progress for the active section line
      const activeEl = document.getElementById(currentSection);
      if (activeEl) {
        const offsetTop = activeEl.offsetTop - 120;
        const height = activeEl.offsetHeight;
        
        let progress = 0;
        if (currentSection === 'hero') {
          progress = 0; // Loading progress only starts when entering the Our Mission section
        } else {
          progress = Math.min(1, Math.max(0, (scrollPos - offsetTop) / height));
        }
        
        setActiveProgress(progress * 100);
      }

      // Calculate scroll progress for RSVP logo animation
      if (isMeasured && coords.missionY > 0) {
        const isMobile = window.innerWidth < 768;
        const start = 0;
        const end = isMobile ? 140 : Math.max(100, coords.missionY - 180);
        const progress = Math.min(1, Math.max(0, (scrollPos - start) / (end - start)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [coords, isMeasured]);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const card = carouselRef.current.querySelector('.work-card');
      const cardWidth = card ? card.offsetWidth : 380;
      const style = window.getComputedStyle(carouselRef.current);
      const gap = parseInt(style.gap) || 32;
      const scrollAmount = cardWidth + gap;

      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setFormSubmitted(false);
      }, 5000);
    }
  };



  const projects = [
    {
      id: 1,
      name: 'EUD Group',
      category: 'Real Estate Company',
      video: '/Video 1 (1).mp4'
    },
    {
      id: 2,
      name: 'Lumora Estates',
      category: 'Real Estate Builders',
      video: '/Video 1 (2).mp4'
    },
    {
      id: 3,
      name: 'JMDR Arihant Green',
      category: 'Blisstown Developers Pvt Ltd',
      video: '/Video 1 (3).mp4'
    },
    {
      id: 4,
      name: 'Ashtech Group',
      category: 'Real Estate Developers',
      video: '/reel 4.mp4'
    },
    {
      id: 5,
      name: 'Earthcon',
      category: 'Real Estate Developers',
      video: '/Video 1 (6).mp4'
    }
  ];

  const teamRow1 = [
    {
      name: 'Ritika',
      designation: 'COO (Partner)',
      avatar: '/team/ritika.jpeg'
    },
    {
      name: 'Vaibhav Sharma',
      designation: 'Creative Head (Partner)',
      avatar: '/team/vaibhav.jpeg'
    }
  ];

  const teamRow2 = [
    {
      name: 'Radhika',
      designation: 'Account Director',
      avatar: '/team/radhika.webp',
      customClass: 'team-avatar-radhika'
    },
    {
      name: 'Priya',
      designation: 'Copy and Strategy Head',
      avatar: '/team/priya.webp',
      customClass: 'team-avatar-priya'
    },
    {
      name: 'Heena Tyagi',
      designation: 'AI Head',
      avatar: '/team/heena.jpeg'
    }
  ];

  const teamRow3 = [
    {
      name: 'Nitin',
      designation: 'SEO & Analytics Head',
      avatar: '/team/Nitin.jpeg'
    },
    {
      name: 'Rahul Kumar',
      designation: 'Art Group Head',
      avatar: '/team/rahul.jpeg',
      customClass: 'team-avatar-rahul'
    },
    {
      name: 'Manav',
      designation: 'Web Developer Expert',
      avatar: '/team/Manav.png'
    }
  ];

  const getActiveSlot = (section) => {
    switch (section) {
      case 'hero':
      case 'mission':
        return 0;
      case 'work':
        return 1;
      case 'team':
        return 2;
      case 'services':
        return 3;
      case 'contact':
        return 4;
      default:
        return 0;
    }
  };

  const services = [
    {
      id: 1,
      number: '01',
      title: 'Social Media & Influence',
      desc: 'Content creation, viral campaigns, brand positioning, and social community growth strategies.',
      icon: (
        <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="service-icon">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      )
    },
    {
      id: 2,
      number: '02',
      title: 'Web Design & Development',
      desc: 'Headless CMS integrations, premium interactive portfolios, high-performance Vite & Next.js systems.',
      icon: (
        <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="service-icon">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      )
    },
    {
      id: 3,
      number: '03',
      title: 'AI Solutions & Workflows',
      desc: 'Custom LLM integrations, retrieval augmented generation, intelligent chatbots, and workflow automation.',
      icon: (
        <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="service-icon">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"></path>
        </svg>
      )
    },
    {
      id: 4,
      number: '04',
      title: 'Brand Design & Identity',
      desc: 'Creative direction, visual styling guidelines, typography design, vector assets, and digital strategy.',
      icon: (
        <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="service-icon">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
      )
    }
  ];

  const getFloatingStyle = () => {
    // If the subpage is open, hide the landing page floating logo
    if (showAshtechPage) {
      return {
        display: 'none'
      };
    }
    // 1. Preloader State: Centered exactly in the preloader viewport area
    if (logoState === 'preloader') {
      return {
        position: 'absolute',
        left: '50%',
        top: '40vh',
        width: 'clamp(80px, 12vw, 120px)',
        height: 'clamp(80px, 12vw, 120px)',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        opacity: 1,
        transition: 'none'
      };
    } 
    // 2. Transitioning-to-Hero State: Fly smoothly from preloader center to Hero placeholder center
    else if (logoState === 'transitioning-to-hero') {
      return {
        position: 'absolute',
        left: isMeasured ? `${coords.heroX + coords.heroW / 2}px` : '50%',
        top: isMeasured ? `${coords.heroY + coords.heroH / 2}px` : '40vh',
        width: isMeasured ? `${coords.heroW}px` : 'clamp(80px, 12vw, 120px)',
        height: isMeasured ? `${coords.heroH}px` : 'clamp(80px, 12vw, 120px)',
        transform: 'translate(-50%, -50%)', // Keeps centering anchor intact during fly
        zIndex: 10000, // On top of preloader until arrival
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        opacity: 1,
        filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.15))',
        transition: 'all 1.4s cubic-bezier(0.16, 1, 0.3, 1)', // Smooth scaling and center translation
        transformOrigin: 'center center'
      };
    } 
    // 3. Scroll Tracking State: Seamless center-to-center linear path from Hero placeholder to Mission placeholder
    else {
      const startX = coords.heroX + coords.heroW / 2;
      const startY = coords.heroY + coords.heroH / 2;
      const endX = coords.missionX + coords.missionW / 2;
      const endY = coords.missionY + coords.missionH / 2;

      const currentX = startX + (endX - startX) * scrollProgress;
      const currentY = startY + (endY - startY) * scrollProgress;
      const currentW = coords.heroW + (coords.missionW - coords.heroW) * scrollProgress;
      const currentH = coords.heroH + (coords.missionH - coords.heroH) * scrollProgress;

      return {
        position: 'absolute',
        left: `${currentX}px`,
        top: `${currentY}px`,
        width: `${currentW}px`,
        height: `${currentH}px`,
        transform: 'translate(-50%, -50%)', // Lock center alignment
        zIndex: 10,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        opacity: 1,
        filter: `drop-shadow(0 0 ${20 - 5 * scrollProgress}px rgba(255, 255, 255, ${0.15 - 0.05 * scrollProgress}))`,
        transition: 'none'
      };
    }
  };

  const floatingStyle = getFloatingStyle();

  return (
    <>
      {preloaderVisible && (
        <div className={`preloader-overlay ${preloaderFadeOut ? 'fade-out' : ''}`}>
          <div className="preloader-content">
            {/* Logo placeholder slot to maintain vertical spacing */}
            <div className="preloader-logo-placeholder"></div>
            <div className={`preloader-bar-bg ${preloaderProgress >= 100 ? 'bar-fade-out' : ''}`}>
              <div className="preloader-bar-fill" style={{ width: `${preloaderProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      <Starfield />

      {/* Floating animated RSVP logo */}
      <div className="logo-rsvp-floating" style={floatingStyle}>
        <img src="/rsvp full.png" alt="RSVP Logo" className="brand-logo-img" />
      </div>

      {showAshtechPage ? (
        <div className="ashtech-page">
          <header className="ashtech-header">
            <button className="ashtech-back-btn" onClick={() => setShowAshtechPage(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="back-arrow-svg">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to Home</span>
            </button>
            <div className="ashtech-header-logo">
              <img src="/logo.png" alt="Logo" className="ashtech-logo-img" />
            </div>
          </header>

          <main className="ashtech-main">
            <div className="ashtech-title-wrap">
              <h1 className="ashtech-page-title">ASHTECH GROUP</h1>
              <p className="ashtech-page-subtitle">REAL ESTATE DEVELOPERS</p>
            </div>

            <div className="ashtech-grid">
              {ashtechVideos.map((video, idx) => (
                <div 
                  key={idx} 
                  className="work-card"
                  onClick={() => setActiveVideo(video.src)}
                >
                  <video
                    className="work-card-video"
                    src={video.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                  <div className="work-card-overlay">
                    <div className="work-card-text">
                      <h3 className="work-card-title">Video {idx + 1}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      ) : (
        <>
          {/* Header element replicating the exact layout of the reference image */}
          <header className={`header ${isHeaderScrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <img src="/logo.png" alt="Logo" className="header-logo-img" />
          <span className="line line-short"></span>
        </div>

        <button
          className={`mobile-nav-toggle ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav-menu-flow ${isMobileMenuOpen ? 'open' : ''}`}>
          <button
            onClick={() => scrollToSection('mission')}
            className={`glow-btn ${activeSection === 'mission' ? 'active' : ''}`}
          >
            Our Mission
          </button>

          <div className={`nav-line-slot ${getActiveSlot(activeSection) === 0 ? 'active-long' : 'collapsed'}`}>
            <div 
              className="nav-line-progress" 
              style={{ width: `${getActiveSlot(activeSection) === 0 ? activeProgress : 0}%` }}
            ></div>
          </div>

          <button
            onClick={() => scrollToSection('work')}
            className={`glow-btn ${activeSection === 'work' ? 'active' : ''}`}
          >
            Our Work
          </button>

          <div className={`nav-line-slot ${getActiveSlot(activeSection) === 1 ? 'active-long' : 'collapsed'}`}>
            <div 
              className="nav-line-progress" 
              style={{ width: `${getActiveSlot(activeSection) === 1 ? activeProgress : 0}%` }}
            ></div>
          </div>

          <button
            onClick={() => scrollToSection('team')}
            className={`glow-btn ${activeSection === 'team' ? 'active' : ''}`}
          >
            Our Team
          </button>

          <div className={`nav-line-slot ${getActiveSlot(activeSection) === 2 ? 'active-long' : 'collapsed'}`}>
            <div 
              className="nav-line-progress" 
              style={{ width: `${getActiveSlot(activeSection) === 2 ? activeProgress : 0}%` }}
            ></div>
          </div>

          <button
            onClick={() => scrollToSection('services')}
            className={`glow-btn ${activeSection === 'services' ? 'active' : ''}`}
          >
            Our Services
          </button>

          <div className={`nav-line-slot ${getActiveSlot(activeSection) === 3 ? 'active-long' : 'collapsed'}`}>
            <div 
              className="nav-line-progress" 
              style={{ width: `${getActiveSlot(activeSection) === 3 ? activeProgress : 0}%` }}
            ></div>
          </div>

          <button
            onClick={() => scrollToSection('contact')}
            className={`glow-btn ${activeSection === 'contact' ? 'active' : ''}`}
          >
            Get In Touch
          </button>

          <div className={`nav-line-slot ${getActiveSlot(activeSection) === 4 ? 'active-long' : 'collapsed'}`}>
            <div 
              className="nav-line-progress" 
              style={{ width: `${getActiveSlot(activeSection) === 4 ? activeProgress : 0}%` }}
            ></div>
          </div>
        </nav>
      </header>

      {/* Main Sections */}
      <main>
        {/* HERO SECTION */}
        <section id="hero" className="hero-section">
          <div className="hero-content">
            <div className="logo-wrapper">
              <img 
                ref={heroPlaceholderRef} 
                src="/rsvp full.png" 
                alt="RSVP Logo Placeholder" 
                className="logo-rsvp-placeholder" 
                style={{ visibility: 'hidden' }}
              />
            </div>

          </div>

          <div className="hero-scroll-indicator" onClick={() => scrollToSection('mission')}>
            <span>Explore RSVP</span>
            <div className="scroll-mouse">
              <div className="scroll-wheel"></div>
            </div>
          </div>
        </section>

        {/* MISSION SECTION */}
        <section id="mission" className="mission-section">
          <div className="container">
            <div className="mission-typography">
              <div className="mission-line">
                <img 
                  ref={missionPlaceholderRef} 
                  src="/rsvp full.png" 
                  alt="RSVP Logo Placeholder" 
                  className="mission-logo-rsvp-placeholder" 
                  style={{ visibility: 'hidden' }}
                />
                <span className="mission-text-line">POWERED BY CREATIVITY.</span>
              </div>
              <div className="mission-line">
                <span className="mission-text-line">ACCELERATED BY</span>
                <span className="mission-pill">AI.</span>
              </div>
            </div>
          </div>
        </section>

        {/* WORK SECTION */}
        <section id="work" className="work-section-carousel">
          <div className="container">
            <h2 className="section-title">
              Our <span>Work</span>
            </h2>
            <p className="section-subtitle">
              A curated selection of our creative digital artifacts, blending high-end design with functional frontend execution.
            </p>
          </div>

          <div className="work-carousel-container">
            <button 
              className="carousel-nav-btn prev" 
              onClick={() => scrollCarousel('left')}
              aria-label="Previous Project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>

            <div className="work-carousel" ref={carouselRef}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="work-card"
                  onClick={() => setActiveVideo(project.video)}
                >
                  {/* Autoplay looping muted background video */}
                  <video
                    className="work-card-video"
                    src={project.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                  <div className="work-card-overlay">
                    {project.hasSparkle && (
                      <div className="work-card-sparkle">
                        <SparkleIcon size={32} />
                      </div>
                    )}
                    <div className="work-card-text">
                      <h3 className="work-card-title">{project.name}</h3>
                      <p className="work-card-subtitle">{project.category}</p>
                      {project.id === 4 && (
                        <button
                          className="work-card-explore-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAshtechPage(true);
                          }}
                        >
                          <span>Explore More</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="explore-arrow-svg">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="carousel-nav-btn next" 
              onClick={() => scrollCarousel('right')}
              aria-label="Next Project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </section>


        {/* TEAM SECTION */}
        <section id="team" className="team-section">
          <div className="container">
            <div className="team-header-block">
              <h2 className="team-main-title">
                We are the people <br /> who make up <span>RSVP</span>
              </h2>
            </div>

            {/* Row 1: 2 members (Ritika & Vaibhav) */}
            <div className="team-grid team-grid-row-3">
              {teamRow1.map((member, idx) => (
                <div key={idx} className="team-card">
                  <div className="team-avatar-wrap">
                    <img src={member.avatar} alt={member.name} className={`team-avatar ${member.customClass || ''}`} />
                  </div>
                  <div className="team-meta">
                    <div className="team-name-row">
                      <h3 className="team-name">{member.name}</h3>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="team-arrow-svg">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                    <p className="team-designation">{member.designation}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2: 3 members */}
            <div className="team-grid team-grid-row-3">
              {teamRow2.map((member, idx) => (
                <div key={idx} className="team-card">
                  <div className="team-avatar-wrap">
                    <img src={member.avatar} alt={member.name} className={`team-avatar ${member.customClass || ''}`} />
                  </div>
                  <div className="team-meta">
                    <div className="team-name-row">
                      <h3 className="team-name">{member.name}</h3>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="team-arrow-svg">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                    <p className="team-designation">{member.designation}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 3: 3 members */}
            <div className="team-grid team-grid-row-3">
              {teamRow3.map((member, idx) => (
                <div key={idx} className="team-card">
                  <div className="team-avatar-wrap">
                    <img src={member.avatar} alt={member.name} className={`team-avatar ${member.customClass || ''}`} />
                  </div>
                  <div className="team-meta">
                    <div className="team-name-row">
                      <h3 className="team-name">{member.name}</h3>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="team-arrow-svg">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                    <p className="team-designation">{member.designation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* SERVICES SECTION */}
        <section id="services" className="services-section">
          
          <div className="container services-container">
            <h2 className="section-title">
              Our <span>Services</span>
            </h2>
            
            <div className="services-list">
              {services.map((service, index) => (
                <div 
                  key={service.id} 
                  className={`service-item ${activeService === index ? 'active' : ''}`}
                  onMouseEnter={() => setActiveService(index)}
                >
                  <div className="service-content">
                    <div className="service-left">
                      <span className="service-number">{service.number}</span>
                    </div>
                    <div className="service-middle">
                      <h3 className="service-name">{service.title}</h3>
                      <p className="service-desc">{service.desc}</p>
                    </div>
                    <div className="service-right">
                      <div className="service-icon-wrap">
                        {service.icon}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="contact-section">
          <div className="contact-container">
            {/* Email Pills aligned to the right */}
            <div className="contact-pills-wrap">
              <a 
                href="https://mail.google.com/mail/?view=cm&tf=0&to=vaibhav@rsvpcreativestudio.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="contact-pill-btn"
                onClick={handleEmailClick}
              >
                {emailCopied ? 'Copied to Clipboard!' : 'Email Us'}
              </a>
              <a href="https://wa.me/917498125252" target="_blank" rel="noopener noreferrer" className="contact-pill-btn">
                Book a call
              </a>

              <div className="contact-info-text contact-address-bottom">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="location-icon-svg">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>B 403 2nd Patel Nagar, Ghaziabad 201001 U.P.</span>
              </div>
            </div>

            {/* Giant Background Title */}
            <div className="contact-giant-title">
              GET IN TOUCH
            </div>
          </div>

          {/* Solid Neon Green Footer Bar */}
          <div className="contact-footer-bar">
            <div className="contact-footer-left">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="social-icon-svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4.002 4.002 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="social-icon-svg">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
            
            <div className="contact-footer-right">
              <div className="footer-promo-text">
                WATCH THIS SPACE FOR MORE TO COME FROM
              </div>
              <div className="footer-logo-row">
                <img src="/rsvp full.png" alt="RSVP" className="footer-rsvp-logo-img" />
                <span className="footer-promo-text promo-bold">IN 2026.</span>
              </div>
            </div>
          </div>
        </section>
      </main>
        </>
      )}

      {/* Video Modal Lightbox — native player with full controls */}
      {activeVideo && (
        <div className="video-modal-overlay" onClick={() => setActiveVideo(null)}>
          <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setActiveVideo(null)}>✕</button>
            <div className="video-modal-iframe-wrapper">
              <video
                src={activeVideo}
                controls
                autoPlay
                loop
                playsInline
                className="video-modal-native"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
