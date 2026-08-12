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
  FiChevronRight, FiClock, FiCheck, FiCopy, FiPlus, FiMinus
} from 'react-icons/fi';
import '../UserCss/TermsAndConditions.css';

const sections = [
  {
    id: 'intro',
    number: '01',
    title: 'Introduction & Acceptance of Terms',
    category: 'General Policy',
    icon: <FiFileText />,
    summary: 'By accessing or using Bitezy, you agree to comply with and be legally bound by these terms.',
    content: [
      'Welcome to Bitezy (operated by FoodVerse Inc.). By accessing, browsing, downloading, or ordering through the Bitezy platform (app or web), you acknowledge that you have read, understood, and agree to be bound by these legal terms and our Privacy Policy.',
      'These Terms apply to all users, registered account holders, merchants, and visitors. If you do not agree with any portion of these conditions, you must immediately cease using all Bitezy services.',
      'Bitezy reserves the right to revise or update these terms periodically. Continued platform usage after changes take effect constitutes your binding acceptance of modified conditions.'
    ]
  },
  {
    id: 'account',
    number: '02',
    title: 'User Registration & Account Security',
    category: 'Account Management',
    icon: <FiLock />,
    summary: 'You are responsible for maintaining confidentiality of credentials and account actions.',
    content: [
      'To place food orders or access wallet benefits, you must register an account using an accurate phone number, full name, and verified email address.',
      'You are solely responsible for keeping your login credentials confidential and for all transactions executed through your account.',
      'Notify Bitezy support immediately upon discovering any unauthorized usage or security breach. Bitezy is not liable for losses caused by unauthorized credential access.'
    ]
  },
  {
    id: 'orders',
    number: '03',
    title: 'Ordering, Pricing & Payment Methods',
    category: 'Billing & Orders',
    icon: <FiCreditCard />,
    summary: 'Prices, item availability, delivery fees, and taxes are clearly calculated prior to checkout.',
    content: [
      'All orders submitted via Bitezy constitute an offer to purchase designated items from independent partner restaurants.',
      'Item prices are configured in collaboration with merchant partners. Delivery fees, packaging surcharges, and applicable taxes are calculated transparently at checkout before payment confirmation.',
      'Supported payment gateways include Credit/Debit cards, UPI, Net Banking, and Bitezy Cash Wallet. Orders are confirmed only upon successful payment authorization.'
    ]
  },
  {
    id: 'delivery',
    number: '04',
    title: 'Delivery Services & Fulfillment',
    category: 'Logistics',
    icon: <FiTruck />,
    summary: 'Deliveries are fulfilled by independent partners; times are target estimations.',
    content: [
      'Deliveries are dispatched through independent delivery partners. Delivery ETAs shown in app are target estimations influenced by distance, traffic conditions, weather, and restaurant preparation delays.',
      'Customers must provide complete address details, landlines/floor info, and remain reachable via phone upon delivery partner arrival.',
      'If a delivery partner waits at the designated drop location for over 10 minutes without customer response, the order may be marked completed without refund eligibility.'
    ]
  },
  {
    id: 'refunds',
    number: '05',
    title: 'Cancellations, Refunds & Disputes',
    category: 'Refund Policy',
    icon: <FiRotateCcw />,
    summary: 'Cancellation windows depend on restaurant preparation status.',
    content: [
      'You may cancel an order free of penalty before the partner restaurant accepts and begins preparing your items.',
      'Once restaurant preparation starts, order cancellations cannot be processed due to the perishable nature of fresh food.',
      'In the event of missing items, severe food quality issues, or wrong items delivered, report the issue via Bitezy Live Support within 24 hours. Verified refunds are credited to Bitezy Wallet or original payment method within 3–7 business days.'
    ]
  },
  {
    id: 'conduct',
    number: '06',
    title: 'User Conduct & Platform Integrity',
    category: 'Community Rules',
    icon: <FiShield />,
    summary: 'Zero tolerance for harassment, fraudulent accounts, or coupon manipulation.',
    content: [
      'Users must interact respectfully with delivery partners, restaurant staff, and customer support representatives.',
      'Abusive behavior, offensive language, or physical intimidation will result in immediate, permanent account suspension without prior notice.',
      'Creating duplicate or fake accounts to exploit introductory discounts, referral rewards, or promo codes is strictly prohibited and subject to account forfeiture.'
    ]
  },
  {
    id: 'intellectual',
    number: '07',
    title: 'Intellectual Property Rights',
    category: 'Legal Ownership',
    icon: <FiCheckCircle />,
    summary: 'All software, logos, trademarks, and UI artwork remain exclusive Bitezy property.',
    content: [
      'All software, source code, UI designs, brand logos, graphics, and trade secrets are the exclusive intellectual property of FoodVerse Inc.',
      'You are granted a limited, revocable, non-exclusive license to use the app for personal food ordering. Copying, scraping, or reverse engineering any software component is strictly forbidden.'
    ]
  },
  {
    id: 'liability',
    number: '08',
    title: 'Limitation of Liability & Disclaimers',
    category: 'Disclaimers',
    icon: <FiAlertCircle />,
    summary: 'Bitezy is a tech marketplace platform connecting consumers and independent vendors.',
    content: [
      'Bitezy provides an online platform connecting customers with third-party food merchants and independent logistics providers. Food quality, hygiene, and allergen disclaimers remain the responsibility of the preparing merchant.',
      'Services are provided "as is" without implied warranties. Bitezy will not be liable for indirect, punitive, or consequential damages resulting from app downtime or merchant delays.'
    ]
  },
  {
    id: 'privacy',
    number: '09',
    title: 'Privacy Protection & Data Rights',
    category: 'Data Governance',
    icon: <FiInfo />,
    summary: 'We safeguard your personal data and location data using industry-standard encryption.',
    content: [
      'We collect location data, contact information, and device telemetry strictly to facilitate food delivery, personalize recommendations, and process secure payments.',
      'We never sell your personal information to third-party data brokers. Detailed privacy practices can be inspected in our official Privacy Policy.'
    ]
  },
  {
    id: 'contact',
    number: '10',
    title: 'Customer Support & Legal Contact',
    category: 'Support',
    icon: <FiHelpCircle />,
    summary: 'Reach out 24/7 via in-app Live Chat or dedicated support hotline.',
    content: [
      'For questions regarding these terms, dispute resolutions, or legal inquiries, contact our operations desk through Bitezy Live Support.',
      'Email: legal@bitezy.com | Helpline: +91 (800) 123-4567 | Address: Bitezy Tech Tower, Rd Number 2, Jubilee Hills, Hyderabad 500033.'
    ]
  }
];

const quickTags = ['Refunds', 'Cancellation', 'Payments', 'Account', 'Delivery', 'Privacy'];

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('intro');
  const [expandedSections, setExpandedSections] = useState(new Set(['intro']));
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
      for (const sec of sections) {
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
    setExpandedSections(new Set(sections.map(s => s.id)));
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
    const url = `${window.location.origin}/terms#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVote = (id, type) => {
    setVotedSections(prev => ({ ...prev, [id]: type }));
  };

  const filteredSections = sections.filter(sec =>
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.content.some(paragraph => paragraph.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="terms-page-wrapper">
      <Navbar />

      {/* Hero Banner with Modern Backdrop Effects */}
      <section className="terms-hero-v2">
        <div className="hero-gradient-overlay"></div>
        <div className="hero-mesh-glow glow-1"></div>
        <div className="hero-mesh-glow glow-2"></div>

        <div className="terms-hero-inner">
          <div className="hero-top-bar">
            <button className="hero-back-pill" onClick={() => navigate('/profile', { state: { openProfileSidebar: true } })} aria-label="Go Back">
              <FiArrowLeft /> Back to Profile
            </button>

            {/* <div className="hero-breadcrumb">
              <span onClick={() => navigate('/user')}>Home</span>
              <FiChevronRight className="bc-sep" />
              <span>Legal</span>
              <FiChevronRight className="bc-sep" />
              <span className="bc-active">Terms & Conditions</span>
            </div> */}
          </div>

          <div className="hero-content-flex">
            <div className="hero-text-block">
              <div className="hero-pill-badge">
                <FiShield className="badge-shield-icon" /> Official Terms of Service
              </div>
              <h1 className="hero-main-title">Terms & Conditions</h1>
              <p className="hero-description">
                Transparent legal conditions governing order placements, deliveries, wallet refunds, and platform safety guidelines across Bitezy.
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
                  <FiLock className="trust-icon" />
                  <span>Customer Protected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Box & Quick Tags */}
          {/* <div className="hero-search-wrapper">
            <div className="search-input-card">
              <FiSearch className="search-main-icon" />
              <input 
                type="text" 
                placeholder="Search legal terms (e.g. refund, cancellation, wallet, delivery)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            <div className="quick-tags-container">
              <span className="tags-label">Popular Searches:</span>
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
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Main Body Grid */}
      <div className="terms-body-container">
        {/* Mobile Horizontal Pill Selector */}
        <div className="mobile-pills-bar">
          {/* {sections.map((sec) => (
            <button
              key={sec.id}
              className={`mobile-pill-btn ${activeSection === sec.id ? 'active' : ''}`}
              onClick={() => scrollToSection(sec.id)}
            >
              <span className="pill-num">{sec.number}</span>
              <span className="pill-txt">{sec.title.split(' ')[0]}</span>
            </button>
          ))} */}
        </div>

        <div className="terms-layout-grid">
          {/* Desktop Sticky Table of Contents Sidebar */}
          <aside className="terms-sticky-toc">
            <div className="toc-card">
              <div className="toc-header">
                <h3>Table of Contents</h3>
                <span className="toc-count">{sections.length} Sections</span>
              </div>

              {/* <nav className="toc-nav-list">
                {sections.map((sec) => (
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
              </nav> */}

              <div className="toc-help-box">
                <div className="help-box-icon">
                  <FiHelpCircle />
                </div>
                <div className="help-box-text">
                  <h4>Have Legal Queries?</h4>
                  <p>Our operations team is available 24/7 to clarify terms.</p>
                  <button className="help-action-btn" onClick={() => navigate('/live-chat')}>
                    Chat With Us
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Content Main Section Cards in Table Accordion Format */}
          <main className="terms-content-stack">
            {filteredSections.length === 0 ? (
              <div className="no-search-results-card">
                <div className="no-res-icon-circle">
                  <FiAlertCircle />
                </div>
                <h3>No Legal Terms Match Your Search</h3>
                <p>We couldn't find matches for "<strong>{searchQuery}</strong>". Try searching for keywords like "refund", "cancellation", or "wallet".</p>
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  Reset Search
                </button>
              </div>
            ) : (
              <div className="terms-accordion-container">
                {/* Accordion Toolbar Controls */}
                {/* <div className="terms-accordion-toolbar">
                  <div className="toolbar-info">
                    <span className="toolbar-count">Showing {filteredSections.length} Terms</span>
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

                {/* Terms Accordion Table */}
                <div className="terms-accordion-table">
                  {filteredSections.map((sec) => {
                    const isExpanded = expandedSections.has(sec.id);
                    return (
                      <div
                        key={sec.id}
                        id={sec.id}
                        className={`terms-table-item ${isExpanded ? 'is-expanded' : ''}`}
                      >
                        {/* Table Row Header (Left: Name/Query, Right: + / - Button) */}
                        <div
                          className="terms-table-row-header"
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
                          <div className="terms-row-drawer">
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
            <div className="terms-bottom-banner">
              <div className="b-banner-glow"></div>
              <div className="b-banner-content">
                <div className="b-banner-icon">
                  <FiMail />
                </div>
                <div>
                  <h3>Questions about Bitezy Legal Policies?</h3>
                  <p>Our dedicated compliance team is ready to assist you via Live Support or email anytime.</p>
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

export default TermsAndConditions;
