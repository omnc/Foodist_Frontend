import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserDropDown from './userDropDown';
import logo from '../assets/Logo.png';
import '../design/header.css';

function Logo() {
  return (
    <Link to="/" aria-label="Foodist home">
      <img src={logo} alt="Foodist" style={{ height: '40px' }} />
    </Link>
  );
}

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const q = searchQuery.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="search-container" role="search">
      <label htmlFor="header-search" className="visually-hidden">
        Search recipes
      </label>
      <input
        id="header-search"
        type="search"
        className="search-bar"
        placeholder="Search recipes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="button" className="search-icon-button" onClick={handleSearch} aria-label="Search recipes">
        <span className="material-icons search-icon" aria-hidden="true">
          search
        </span>
      </button>
    </div>
  );
}

function User() {
  return (
    <div className="user-icon-container">
      <UserDropDown />
    </div>
  );
}

function Liked() {
  return (
    <div className="liked-icon-container">
      <Link to="/saved" aria-label="Saved recipes" className="liked-link">
        <span className="material-icons liked-icon" aria-hidden="true">
          favorite
        </span>
      </Link>
    </div>
  );
}

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="search">
          <Search />
        </div>
      </div>

      <div className="header-center">
        <div className="logo">
          <Logo />
        </div>
      </div>

      <div className="header-right">
        <Liked />
        <User />
      </div>
    </header>
  );
}
