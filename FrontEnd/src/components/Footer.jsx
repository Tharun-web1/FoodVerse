import React from 'react';
import "./footer.css";
import { Link } from 'react-router-dom';
import {
    FiInstagram,
    FiFacebook,
    FiTwitter,
    FiDownload
} from 'react-icons/fi';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
import { IoFastFood } from 'react-icons/io5';
import logo from '../assets/images/logo1.jpeg';

const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-col brand-col">
                        <div className="footer-brand">
                            <img src={logo} alt="Bitezy Logo" className="footer-logo-img" />
                            <span><span className="brand-text-accent">BITEZY</span></span>
                        </div>
                        <p className="footer-tagline">
                            Experience the best culinary delights delivered straight to your doorstep. Faster, fresher, and smarter.
                        </p>
                    </div>

                    {/* Company Column */}
                    <div className="footer-col">
                        <h4 className="footer-title">About Us</h4>
                        <ul className="footer-links">
                            <li><Link to="/about">Our Story</Link></li>
                            <li><Link to="/careers">Careers</Link></li>
                            <li><Link to="/team">Meet the Team</Link></li>
                            <li><Link to="/blog">Foodie Blog</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="footer-col">
                        <h4 className="footer-title">Contact</h4>
                        <ul className="footer-links">
                            <li><Link to="/contact">Help & Support</Link></li>
                            <li><Link to="/partner">Partner with us</Link></li>
                            <li><Link to="/ride">Ride with us</Link></li>
                            <li><Link to="/press">Press Kit</Link></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div className="footer-col">
                        <h4 className="footer-title">Legal</h4>
                        <ul className="footer-links">
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                            <li><Link to="/cookie">Cookie Policy</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/security">Security</Link></li>
                        </ul>
                    </div>

                    {/* Download Column */}
                    <div className="footer-col download-col">
                        <h4 className="footer-title">Download App</h4>
                        <div className="app-buttons">
                            <a href="#" className="app-btn">
                                <FaApple className="app-icon" />
                                <div className="app-btn-text">
                                    <span>Download on the</span>
                                    <strong>App Store</strong>
                                </div>
                            </a>
                            <a href="#" className="app-btn">
                                <FaGooglePlay className="app-icon" />
                                <div className="app-btn-text">
                                    <span>Get it on</span>
                                    <strong>Google Play</strong>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Social Column */}
                    <div className="footer-col social-col">
                        <h4 className="footer-title">Follow Us</h4>
                        <div className="social-links">
                            <a href="#" aria-label="Instagram"><FiInstagram /></a>
                            <a href="#" aria-label="Facebook"><FiFacebook /></a>
                            <a href="#" aria-label="Twitter"><FiTwitter /></a>
                        </div>
                        <div className="footer-info-badge">
                           🚀 Join 50k+ Happy Foodies
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-copyright">
                        © {new Date().getFullYear()} BITEZY. All rights reserved.
                    </div>
                    <div className="footer-bottom-links">
                        <a href="#">Sitemap</a>
                        <a href="#">Accessibility</a>
                        <a href="#">Status</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};


export default Footer;
