import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '../Icon/Icon';
import styles from './SearchBox.module.css';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <form className={styles.searchBox} role="search" onSubmit={submit}>
      <label htmlFor="header-search" className="visually-hidden">
        Search recipes
      </label>
      <input
        id="header-search"
        type="search"
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className={styles.submit} aria-label="Search recipes">
        <SearchIcon size={28} />
      </button>
    </form>
  );
}
