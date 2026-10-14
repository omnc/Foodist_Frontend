import React from 'react';
import { Link } from 'react-router-dom';
import SearchBox from './SearchBox';
import UserMenu from '../UserMenu/UserMenu';
import CategoryNav from '../CategoryNav/CategoryNav';
import { SavedBadgeIcon } from '../Icon/Icon';
import logo from '../../assets/brand/logo.png';
import styles from './Header.module.css';

/** Site header: search, logo, saved/profile icons, then the category bar with its mega menu. */
export default function Header() {
  return (
    <header className={`${styles.header} no-print`} data-testid="site-header">
      <div className={styles.topRow}>
        <div className={styles.search}>
          <SearchBox />
        </div>
        <Link to="/" className={styles.logo} aria-label="Foodist home">
          <img src={logo} alt="Foodist" width="195" height="77" />
        </Link>
        <div className={styles.actions}>
          <Link to="/saved" className={styles.savedLink} aria-label="Saved recipes">
            <SavedBadgeIcon size={52} />
          </Link>
          <UserMenu />
        </div>
      </div>
      <CategoryNav />
    </header>
  );
}
