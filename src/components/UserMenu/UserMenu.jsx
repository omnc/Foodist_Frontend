import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext.jsx';
import { AvatarIcon } from '../Icon/Icon';
import styles from './UserMenu.module.css';

/** Avatar button in the header with a small account menu (log in / sign up, or profile actions). */
export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const go = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <AvatarIcon />
      </button>

      {isOpen && (
        <div className={styles.menu} role="menu">
          {isAuthenticated ? (
            <>
              <p className={styles.account} title={user?.email}>
                {user?.username || user?.email}
              </p>
              <MenuItem onClick={() => go('/myPage')}>Profile</MenuItem>
              <MenuItem onClick={() => go('/postPage')}>Add Recipe</MenuItem>
              <MenuItem onClick={() => go('/saved')}>Saved recipes</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={() => go('/login')}>Log In</MenuItem>
              <MenuItem onClick={() => go('/signin')}>Sign Up</MenuItem>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ onClick, children }) {
  return (
    <button type="button" role="menuitem" className={styles.item} onClick={onClick}>
      {children}
    </button>
  );
}
