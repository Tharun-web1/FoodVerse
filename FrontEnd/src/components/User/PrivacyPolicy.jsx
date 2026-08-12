import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from '../Footer';
import FloatingCart from './FloatingCart';
import { useTranslation } from 'react-i18next';
import {
  FiShield, FiFileText, FiLock, FiCreditCard,
  FiTruck, FiRotateCcw, FiAlertCircle, FiHelpCircle,
  FiSearch, FiArrowLeft, FiCheckCircle, FiChevronUp,
  FiInfo, FiMail, FiShare2, FiThumbsUp, FiThumbsDown,
  FiChevronRight, FiClock, FiCheck, FiCopy, FiPlus, FiMinus, FiMapPin, FiEye, FiServer, FiUserCheck
} from 'react-icons/fi';
import '../UserCss/PrivacyPolicy.css';

const privacySections = [
  {
    id: 'collection',
    number: '01',
    title: 'Information We Collect',
    category: 'Data Collection',
    icon: <FiFileText />,
    summary: 'We collect personal identification, location coordinates, device telemetry, and transaction history to deliver food seamlessly.',
    content: [
      'Personal Identification: When you create a Bitezy account, we collect your full name, email address, phone number, and delivery addresses.',
      'Geolocation Data: With your explicit permission, we collect precise GPS coordinates (latitude and longitude) to show nearby restaurants, calculate accurate delivery distance, and track live order dispatch.',
      'Device & Usage Telemetry: We automatically collect device model, operating system, IP address, app version, and interaction logs to troubleshoot crashes and enhance app performance.'
    ]
  },
  {
    id: 'usage',
    number: '02',
    title: 'How We Use Your Information',
    category: 'Data Usage',
    icon: <FiUserCheck />,
    summary: 'Your data is utilized strictly for order processing, live delivery dispatch, and personalized food recommendations.',
    content: [
      'Order Fulfillment: We process your details to transmit food orders to partner restaurants and assign assigned delivery partners for drop-off.',
      'Personalization: We analyze past order preferences and location radius to recommend top-rated nearby restaurants (e.g. 3km nearest & 5km top picks).',
      'Communication: We send critical order status updates via SMS, push notifications, and email receipts.'
    ]
  },
  {
    id: 'sharing',
    number: '03',
    title: 'Information Sharing & Third Parties',
    category: 'Third Parties',
    icon: <FiServer />,
    summary: 'We never sell your data. We share necessary details strictly with partner restaurants and delivery drivers.',
    content: [
      'Merchant Partners: Restaurants receive item choices, customer order notes, and first name to prepare meals correctly.',
      'Delivery Partners: Assigned riders receive your delivery address, drop-off instructions, and masked phone number to execute delivery.',
      'Payment Processors: Secure payment gateways (Credit/Debit, UPI, NetBanking) process billing data directly under PCI-DSS standards. Bitezy does not store raw credit card numbers.'
    ]
  },
  {
    id: 'cookies',
    number: '04',
    title: 'Cookies & Tracking Technologies',
    category: 'Tracking',
    icon: <FiEye />,
    summary: 'We use essential session tokens and local storage to keep you logged in and save location preferences.',
    content: [
      'Essential Storage: Local storage (localStorage) is used to remember your active delivery location, language preferences, and authentication tokens.',
      'Analytics & Performance: Anonymous performance cookies assist our engineering team in identifying slow API endpoints and improving page load speeds.',
      'You can clear web storage or disable cookies at any time via your browser settings, though certain interactive features like saved addresses may require re-entry.'
    ]
  },
  {
    id: 'security',
    number: '05',
    title: 'Data Protection & Security Standards',
    category: 'Security',
    icon: <FiLock />,
    summary: 'All telemetry and communications are encrypted using end-to-end 256-bit SSL/TLS encryption.',
    content: [
      'Encryption Standards: Data transmitted between the Bitezy app/web and server databases is secured with 256-bit SSL/TLS encryption.',
      'Access Control: Internal access to customer personal information is restricted to authorized operations personnel on a strict need-to-know basis.',
      'Continuous Auditing: We perform continuous automated vulnerability scans and infrastructure compliance checks.'
    ]
  },
  {
    id: 'rights',
    number: '06',
    title: 'Your Data Rights & Choices',
    category: 'User Rights',
    icon: <FiShield />,
    summary: 'You retain full control to edit profile details, export personal data, or request permanent account deletion.',
    content: [
      'Access & Correction: You can view and update your name, email, phone number, and saved delivery addresses anytime in My Profile settings.',
      'Account Deletion: You can request complete erasure of your Bitezy account and associated transaction history by submitting a request via Live Support.',
      'Marketing Preferences: You can opt out of promotional emails or push notifications anytime while continuing to receive essential order receipts.'
    ]
  },
  {
    id: 'children',
    number: '07',
    title: 'Children’s Privacy Protection',
    category: 'Policy Guidelines',
    icon: <FiAlertCircle />,
    summary: 'Bitezy services are intended for individuals aged 18 and above.',
    content: [
      'Bitezy does not knowingly collect or solicit personal data from children under 13 years of age.',
      'If we learn that we have unintentionally collected personal information from a minor under legal age without parental consent, we will promptly delete that data from our server databases.'
    ]
  },
  {
    id: 'contact',
    number: '08',
    title: 'Privacy Queries & Legal Contact Desk',
    category: 'Support Desk',
    icon: <FiHelpCircle />,
    summary: 'Have questions regarding privacy practices? Contact our Data Governance Team 24/7.',
    content: [
      'If you have questions, feedback, or complaints regarding this Privacy Policy or data handling practices, please contact our Compliance Officer.',
      'Email: privacy@bitezy.com | Helpline: +91 (800) 123-4567 | Address: Data Protection Desk, Bitezy Tech Tower, Rd Number 2, Jubilee Hills, Hyderabad 500033.'
    ]
  }
];

const quickTags = ['Location', 'Cookies', 'Payments', 'Security', 'Sharing', 'Deletion'];

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('collection');
  const [expandedSections, setExpandedSections] = useState(new Set(['collection']));
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [votedSections, setVotedSections] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      // Determine active section based on scroll position
      const scrollPosition = window.scrollY + 140;
      for (const sec of privacySections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (id) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(privacySections.map(s => s.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    if (!expandedSections.has(id)) {
      toggleSection(id);
    }
    const element = document.getElementById(id);
    if (element) {
      const offset = 95;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = (id) => {
    const url = `${window.location.origin}/privacy#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVote = (id, type) => {
    setVotedSections(prev => ({ ...prev, [id]: type }));
  };

  const filteredSections = privacySections.filter(sec =>
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.content.some(paragraph => paragraph.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="privacy-page-wrapper">
      <Navbar />

      {/* Hero Banner with Glassmorphic Gradient */}
      <section className="privacy-hero-v2">
        <div className="privacy-gradient-overlay"></div>
        <div className="privacy-mesh-glow glow-1"></div>
        <div className="privacy-mesh-glow glow-2"></div>

        <div className="privacy-hero-inner">
          <div className="hero-top-bar">
            <button className="hero-back-pill" onClick={() => navigate('/profile', { state: { openProfileSidebar: true } })} aria-label="Go Back">
              <FiArrowLeft /> Back to Profile
            </button>

            {/* <div className="hero-breadcrumb">
              <span onClick={() => navigate('/user')}>Home</span>
              <FiChevronRight className="bc-sep" />
              <span>Legal</span>
              <FiChevronRight className="bc-sep" />
              <span className="bc-active">Privacy Policy</span>
            </div> */}
          </div>

          <div className="hero-content-flex">
            <div className="hero-text-block">
              <div className="hero-pill-badge">
                <FiLock className="badge-shield-icon" /> Data Governance & Protection
              </div>
              <h1 className="hero-main-title">Privacy Policy</h1>
              <p className="hero-description">
                We are committed to safeguarding your personal data, location privacy, and payment security across Bitezy.
              </p>

              {/* Trust Badges Bar */}
              <div className="hero-trust-bar">
                <div className="trust-item">
                  <FiCheckCircle className="trust-icon" />
                  <span>Version <strong>2.4.0</strong></span>
                </div>
                <div className="trust-divider"></div>
                <div className="trust-item">
                  <FiClock className="trust-icon" />
                  <span>Last Updated: <strong>Aug 2026</strong></span>
                </div>
                <div className="trust-divider"></div>
                <div className="trust-item">
                  <FiShield className="trust-icon" />
                  <span>SSL 256-Bit Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Box & Quick Tags */}
          <div className="hero-search-wrapper">
            {/* <div className="search-input-card">
              <FiSearch className="search-main-icon" />
              <input
                type="text"
                placeholder="Search privacy topics (e.g. location, cookies, payments, deletion)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div> */}

            <div className="quick-tags-container">
              {/* <span className="tags-label">Popular Searches:</span>
              <div className="tags-list">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-chip ${searchQuery.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setSearchQuery(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Grid */}
      <div className="privacy-body-container">
        {/* Mobile Horizontal Pill Selector */}
        {/* <div className="mobile-pills-bar">
          {privacySections.map((sec) => (
            <button
              key={sec.id}
              className={`mobile-pill-btn ${activeSection === sec.id ? 'active' : ''}`}
              onClick={() => scrollToSection(sec.id)}
            >
              <span className="pill-num">{sec.number}</span>
              <span className="pill-txt">{sec.title.split(' ')[0]}</span>
            </button>
          ))}
        </div> */}

        <div className="privacy-layout-grid">
          {/* Desktop Sticky Table of Contents Sidebar */}
          <aside className="privacy-sticky-toc">
            <div className="toc-card">
              <div className="toc-header">
                <h3>Table of Contents</h3>
                <span className="toc-count">{privacySections.length} Sections</span>
              </div>

              <nav className="toc-nav-list">
                {privacySections.map((sec) => (
                  <button
                    key={sec.id}
                    className={`toc-nav-item ${activeSection === sec.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(sec.id)}
                  >
                    <span className="toc-item-number">{sec.number}</span>
                    <div className="toc-item-info">
                      <span className="toc-item-title">{sec.title}</span>
                      <span className="toc-item-cat">{sec.category}</span>
                    </div>
                  </button>
                ))}
              </nav>

              <div className="toc-help-box">
                <div className="help-box-icon">
                  <FiHelpCircle />
                </div>
                <div className="help-box-text">
                  <h4>Have Data Queries?</h4>
                  <p>Our Data Governance desk is online to assist you anytime.</p>
                  <button className="help-action-btn" onClick={() => navigate('/live-chat')}>
                    Chat With Us
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Content Main Section Cards in Table Accordion Format */}
          <main className="privacy-content-stack">
            {filteredSections.length === 0 ? (
              <div className="no-search-results-card">
                <div className="no-res-icon-circle">
                  <FiAlertCircle />
                </div>
                <h3>No Privacy Terms Match Your Search</h3>
                <p>We couldn't find matches for "<strong>{searchQuery}</strong>". Try searching for keywords like "location", "cookies", or "payments".</p>
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  Reset Search
                </button>
              </div>
            ) : (
              <div className="privacy-accordion-container">
                {/* Accordion Toolbar Controls */}
                {/* <div className="privacy-accordion-toolbar">
                  <div className="toolbar-info">
                    <span className="toolbar-count">Showing {filteredSections.length} Policy Terms</span>
                  </div>
                  <div className="toolbar-controls">
                    <button className="toolbar-toggle-all-btn" onClick={expandAll}>
                      Expand All
                    </button>
                    <span className="control-dot">•</span>
                    <button className="toolbar-toggle-all-btn" onClick={collapseAll}>
                      Collapse All
                    </button>
                  </div>
                </div> */}

                {/* Privacy Accordion Table */}
                <div className="privacy-accordion-table">
                  {filteredSections.map((sec) => {
                    const isExpanded = expandedSections.has(sec.id);
                    return (
                      <div
                        key={sec.id}
                        id={sec.id}
                        className={`privacy-table-item ${isExpanded ? 'is-expanded' : ''}`}
                      >
                        {/* Table Row Header (Left: Name/Query, Right: + / - Button) */}
                        <div
                          className="privacy-table-row-header"
                          onClick={() => toggleSection(sec.id)}
                        >
                          <div className="row-header-left">
                            <span className="sec-num-badge">{sec.number}</span>
                            <div className="sec-title-meta">
                              <span className="sec-category-tag">{sec.category}</span>
                              <h3 className="sec-title-heading">{sec.title}</h3>
                            </div>
                          </div>

                          <div className="row-header-right">
                            <button
                              className={`toggle-icon-btn ${isExpanded ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSection(sec.id);
                              }}
                              aria-label={isExpanded ? "Collapse Details" : "Expand Details"}
                            >
                              {isExpanded ? <FiMinus className="icon-minus" /> : <FiPlus className="icon-plus" />}
                            </button>
                          </div>
                        </div>

                        {/* Accordion Expandable Content Drawer */}
                        {isExpanded && (
                          <div className="privacy-row-drawer">
                            <div className="sec-summary-banner">
                              <FiInfo className="summary-info-icon" />
                              <span><strong>Key Summary:</strong> {sec.summary}</span>
                            </div>

                            <div className="sec-paragraphs-block">
                              {sec.content.map((paragraph, pIdx) => (
                                <p key={pIdx} className="legal-p">
                                  <span className="bullet-indicator"></span>
                                  {paragraph}
                                </p>
                              ))}
                            </div>

                            <div className="sec-drawer-footer">
                              <div className="sec-footer-voting">
                                <span className="vote-question">Was this section helpful?</span>
                                <div className="vote-buttons">
                                  <button
                                    className={`vote-btn yes ${votedSections[sec.id] === 'yes' ? 'selected' : ''}`}
                                    onClick={() => handleVote(sec.id, 'yes')}
                                  >
                                    <FiThumbsUp /> Yes
                                  </button>
                                  <button
                                    className={`vote-btn no ${votedSections[sec.id] === 'no' ? 'selected' : ''}`}
                                    onClick={() => handleVote(sec.id, 'no')}
                                  >
                                    <FiThumbsDown /> No
                                  </button>
                                </div>
                              </div>

                              <button
                                className={`copy-link-btn ${copiedId === sec.id ? 'copied' : ''}`}
                                onClick={() => handleCopyLink(sec.id)}
                                title="Copy link to this section"
                              >
                                {copiedId === sec.id ? <FiCheck /> : <FiCopy />}
                                <span>{copiedId === sec.id ? 'Copied' : 'Share'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Support Banner */}
            <div className="privacy-bottom-banner">
              <div className="b-banner-glow"></div>
              <div className="b-banner-content">
                <div className="b-banner-icon">
                  <FiMail />
                </div>
                <div>
                  <h3>Questions about Bitezy Privacy Policies?</h3>
                  <p>Our dedicated Data Protection Desk is available via Live Support or email anytime.</p>
                </div>
              </div>
              <div className="b-banner-actions">
                <button className="b-action-btn primary" onClick={() => navigate('/live-chat')}>
                  Live Support Chat <FiChevronRight />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button className="floating-scroll-top-btn" onClick={scrollToTop} aria-label="Scroll to top">
          <FiChevronUp />
        </button>
      )}

      <FloatingCart />
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
