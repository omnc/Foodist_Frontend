import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/brand/logo.png';
import leek from '../../assets/brand/character-leek.png';
import tomato from '../../assets/brand/character-tomato.png';
import styles from './AuthLayout.module.css';

const CHARACTERS = {
  leek: { src: leek, width: 174, height: 400, className: styles.leek },
  tomato: { src: tomato, width: 349, height: 276, className: styles.tomato },
};

/**
 * Two-pane layout shared by log in, sign up, forgot password and change password:
 * the form on cream, a coloured panel (optionally scalloped) with an optional character on the right.
 * Renders its own <main>, so auth pages sit outside PageLayout (no site header/footer).
 */
export default function AuthLayout({ eyebrow, title, tone = 'green', scalloped = true, character, children }) {
  const art = character ? CHARACTERS[character] : null;
  const panelClass = [styles.panel, scalloped ? styles.scalloped : ''].join(' ');

  return (
    <div className={`${styles.page} ${styles[tone]}`}>
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <Link to="/" className={styles.logo} aria-label="Foodist home">
          <img src={logo} alt="Foodist" width="195" height="77" />
        </Link>
        <div className={styles.content}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          {children}
        </div>
      </main>
      <aside className={panelClass} aria-hidden="true">
        {art && <img className={art.className} src={art.src} alt="" width={art.width} height={art.height} />}
      </aside>
    </div>
  );
}
