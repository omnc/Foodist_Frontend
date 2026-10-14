import React from 'react';
import { Link } from 'react-router-dom';
import { InstagramIcon, LinkedinIcon, FacebookIcon } from '../Icon/Icon';
import logo from '../../assets/brand/logo.png';
import styles from './Footer.module.css';

/*
 * Social and legal destinations (Instagram, LinkedIn, Facebook, Privacy Policy, Careers, Contact)
 * do not exist yet, so they render as plain, non-clickable items rather than dead links.
 */
export default function Footer() {
  return (
    <footer className={`${styles.footer} no-print`} data-testid="site-footer">
      <div className={styles.scallops} aria-hidden="true" />
      <div className={styles.body}>
        <div className={`page-container ${styles.inner}`}>
          <div className={styles.brand}>
            <img src={logo} alt="Foodist" width="265" height="105" className={styles.logo} />
            <p className={styles.copyright}>© 2025 Foodist All right all rights reserved</p>
          </div>
          <div className={styles.follow}>
            <p className={styles.heading}>Follow us</p>
            <ul className={styles.social} aria-label="Social media">
              <li><InstagramIcon size={34} aria-label="Instagram" role="img" /></li>
              <li><LinkedinIcon size={34} aria-label="LinkedIn" role="img" /></li>
              <li><FacebookIcon size={34} aria-label="Facebook" role="img" /></li>
            </ul>
          </div>
          <ul className={styles.links}>
            <li><Link to="/aboutUs">About us</Link></li>
            <li><span>Privacy Policy</span></li>
            <li><span>Careers</span></li>
            <li><span>Contact</span></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
