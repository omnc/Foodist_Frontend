import React, { useState } from 'react';
import UserDropDown from './userDropDown';
import logo from '../assets/Logo.png';
import '../design/header.css';

function Logo() {
    return (
        <img src={logo} alt="Logo" style={{ height: '40px' }} />
    );
}

function Search() {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        // TODO: Navigate to search page with searchQuery
        console.log('Searching for:', searchQuery);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="search-container">
            <input
                type="text"
                className="search-bar"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <button 
                className="search-icon-button"
                onClick={handleSearch}
                aria-label="Search"
            >
                <span className="material-icons search-icon">search</span>
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
            <span className="material-icons liked-icon">favorite</span>
        </div>
    );
}

export default function Header() {
    return (
        <div className="header">
            {/* Left-aligned section */}
            <div className="header-left">
                <div className="search">
                    <Search />
                </div>
            </div>
            
            {/* Center section */}
            <div className="header-center">
                <div className="logo">
                    <Logo />
                </div>
            </div>
            
            {/* Right-aligned section */}
            <div className="header-right">
                <div className="liked">
                    <Liked />
                </div>
                <div className="user">
                    <User />
                </div>
            </div>
        </div>
    );
}