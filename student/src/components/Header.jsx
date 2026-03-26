import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ChevronDown, Menu, X, Phone, Mail } from 'lucide-react';
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import styles from './Header.module.css';
import logo from '/maarulalogo.png';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Re-usable component for mobile links
  const MobileNavLink = ({ to, children }) => (
    <NavLink to={to} className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMobileMenu}>
      {children}
    </NavLink>
  );

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      {/* Top Bar with Corrected Links */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.contactInfo}>
            <a href="tel:+919935965550"><Phone size={14} /> +91 99359 65550</a>
            <a href="mailto:contact@maarula.in"><Mail size={14} /> contact@maarula.in</a>
          </div>
          <div className={styles.socialIcons}>
           <a href="https://www.instagram.com/maarula.classes" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://www.facebook.com/classes.maarula" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://www.youtube.com/c/MAARULACLASSES" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
            <a href="https://www.linkedin.com/company/maarulaclasses" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      {/* Main Header with "Mathem Solvex" Branding and Corrected Links */}
      <div className={styles.mainHeader}>
        <Link to="/" className={styles.logoContainer}>
          <img src={logo} alt="Mathem Solvex Logo" className={styles.logo} />
          <div className={styles.brandName}>
            <h2>Mathem Solvex</h2>
            <p>Get the solution of every question</p>
          </div>
        </Link>

        <nav className={styles.desktopNav}>
          <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink>
          
          <div className={styles.dropdown}>
            <NavLink to="/questions" className={styles.dropdownToggle}>Previous Year Questions <ChevronDown size={16} /></NavLink>
            <div className={styles.dropdownMenu}>
              <Link to="/questions?exam=NIMCET">NIMCET</Link>
              <Link to="/questions?exam=CUET PG">CUET PG</Link>
              <Link to="/questions?exam=JAMIA">JAMIA</Link>
              <Link to="/questions?exam=MAH-CET">MAH-CET</Link>
              <Link to="/questions?exam=AMU">AMU</Link>
              <Link to="/questions?exam=VITMEE">VITMEE</Link>
              <div className={styles.divider}></div>
              <Link to="/resources" className={styles.specialLink}>PYQ Paper Downloads</Link>
              <Link to="/test" className={styles.specialLink}>Practice Paper</Link>
            </div>
          </div>
          
          <NavLink to="/articles">Latest Update</NavLink>
          
          <div className={styles.dropdown}>
            <span className={styles.dropdownToggle}>Resources <ChevronDown size={16} /></span>
            <div className={styles.dropdownMenu}>
              <Link to="/resources" className={styles.highlightLink}>PYQ PDF Downloads</Link>
              <a href="https://maarulaclasses.classx.co.in/new-courses" target="_blank" rel="noopener noreferrer">Our Courses</a>
              <a href="https://maarulaclasses.classx.co.in/test-series" target="_blank" rel="noopener noreferrer">Test Series</a>
              <Link to="/results">Our Results</Link>
              <Link to="/about">About Us</Link>
            </div>
          </div>
          
          <NavLink to="/contact" className={({ isActive }) => isActive ? styles.active : ''}>Contact Us</NavLink>
        </nav>

        <div className={styles.headerActions}>
          <a href="https://maarulaclasses.classx.co.in/" target="_blank" rel="noopener noreferrer" className={styles.loginButton}>Login</a>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation with Corrected Links */}
      <div className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.isOpen : ''}`}>
        <nav className={styles.mobileNav}>
          <MobileNavLink to="/">Home</MobileNavLink>
          <MobileNavLink to="/questions">All PYQs</MobileNavLink>
          <MobileNavLink to="/questions?exam=NIMCET">NIMCET PYQs</MobileNavLink>
          <MobileNavLink to="/questions?exam=CUET PG">CUET PG PYQs</MobileNavLink>
          <MobileNavLink to="/questions?exam=JAMIA">JAMIA PYQs</MobileNavLink>
          <MobileNavLink to="/questions?exam=MAH-CET">MAH-CET PYQs</MobileNavLink>
          <MobileNavLink to="/questions?exam=AMU">AMU PYQs</MobileNavLink>
          <MobileNavLink to="/questions?exam=VITMEE">VITMEE PYQs</MobileNavLink>
          <div className={styles.mobileDivider}></div>
          <MobileNavLink to="/resources">PYQ Paper Downloads</MobileNavLink>
          <MobileNavLink to="/test">Practice Paper</MobileNavLink>
          <div className={styles.mobileDivider}></div>
          <MobileNavLink to="/articles">Latest Update</MobileNavLink>
          <a href="https://maarulaclasses.classx.co.in/new-courses" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>Our Courses</a>
          <a href="https://maarulaclasses.classx.co.in/test-series" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>Test Series</a>
          <Link to="/results">Our Results</Link>
          <MobileNavLink to="/about">About Us</MobileNavLink>
          <MobileNavLink to="/contact">Contact Us</MobileNavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;