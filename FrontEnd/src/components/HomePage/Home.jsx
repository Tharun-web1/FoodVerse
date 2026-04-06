import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import { useTranslation } from 'react-i18next';
import {
  FiArrowRight,
  FiShoppingBag,
  FiTruck,
  FiTrendingUp,
  FiMapPin,
  FiUsers,
  FiBriefcase
} from 'react-icons/fi';
import { IoFastFoodOutline } from 'react-icons/io5';
import Footer from '../Footer';

const Home = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="home-premium-container">
      {/* Hero Section */}
      <section className="hero-wrapper">
        <div className="hero-glass-container">
          <div className="reveal">
            <IoFastFoodOutline className="hero-icon-lg" style={{ fontSize: '3rem', color: 'white', marginBottom: '20px' }} />
            <h1>{t('home_hero_title')}</h1>
            <p>{t('home_hero_subtitle')}</p>
            <div className="hero-actions">
              <Link to="/login/user" className="btn-hero btn-hero-primary">
                {t('home_hero_cta_user')} <FiArrowRight />
              </Link>
              <Link to="/signup/res" className="btn-hero btn-hero-outline">
                {t('home_hero_cta_res')}
              </Link>
              <Link to="/delivery/login" className="btn-hero btn-hero-outline">
                {t('home_hero_cta_delivery')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="stats-grid reveal">
          <div className="stat-card">
            <FiBriefcase className="stat-icon-sm" style={{ fontSize: '1.5rem', color: 'var(--primary-home)' }} />
            <span className="stat-number">{t('home_stats_restaurants')}</span>
            <span className="stat-label">{t('home_stats_restaurants_label')}</span>
          </div>
          <div className="stat-card">
            <FiUsers className="stat-icon-sm" style={{ fontSize: '1.5rem', color: 'var(--primary-home)' }} />
            <span className="stat-number">{t('home_stats_users')}</span>
            <span className="stat-label">{t('home_stats_users_label')}</span>
          </div>
          <div className="stat-card">
            <FiMapPin className="stat-icon-sm" style={{ fontSize: '1.5rem', color: 'var(--primary-home)' }} />
            <span className="stat-number">{t('home_stats_cities')}</span>
            <span className="stat-label">{t('home_stats_cities_label')}</span>
          </div>
        </div>
      </section>

      {/* Partner Discovery Section */}
      <section className="partners-discovery">
        <div className="container">
          <div className="partners-grid">
            {/* Restaurant Partner */}
            <div className="partner-card reveal">
              <div className="partner-icon">
                <FiTrendingUp />
              </div>
              <h3>{t('home_partner_res_title')}</h3>
              <p>{t('home_partner_res_desc')}</p>
              <Link to="/signup/res" className="btn-partner">
                {t('home_register_btn')}
              </Link>
            </div>

            {/* Delivery Partner */}
            <div className="partner-card reveal">
              <div className="partner-icon">
                <FiTruck />
              </div>
              <h3>{t('home_partner_delivery_title')}</h3>
              <p>{t('home_partner_delivery_desc')}</p>
              <Link to="/delivery/register" className="btn-partner">
                {t('home_register_btn')}
              </Link>
            </div>

            {/* Customer Portal */}
            <div className="partner-card reveal">
              <div className="partner-icon">
                <FiShoppingBag />
              </div>
              <h3>{t('hello')}</h3>
              <p>{t('home_hero_subtitle')}</p>
              <Link to="/login/user" className="btn-partner">
                {t('home_hero_cta_user')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bottom-cta reveal">
        <div className="cta-content">
          <h2>{t('home_cta_bottom_title')}</h2>
          <p>{t('home_cta_bottom_subtitle')}</p>
          <Link to="/signup/user" className="btn-register-final">
            {t('home_register_btn')}
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
