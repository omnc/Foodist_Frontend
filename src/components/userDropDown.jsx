import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/authContext.jsx';
import { useNavigate } from 'react-router-dom';
import './userDropDown.css';

const UserDropDown = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <div className="user-dropdown" ref={dropdownRef}>
            <button 
                className="user-icon-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User menu"
            >
                <div className="user-icon">
                    {isAuthenticated ? (
                        <span>{user?.email?.charAt(0).toUpperCase()}</span>
                    ) : (
                        <span>👤</span>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className={`dropdown-menu ${isAuthenticated ? 'logged-in' : 'logged-out'}`}>
                    {isAuthenticated ? (
                        <LoggedInMenu 
                            user={user}
                            onLogout={handleLogout}
                            onNavigate={handleNavigation}
                        />
                    ) : (
                        <NotLoggedInMenu onNavigate={handleNavigation} />
                    )}
                </div>
            )}
        </div>
    );
};

const NotLoggedIn = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="dropdown-menu">
            <div className="dropdown-header">
                <h3>Welcome to Foodist</h3>
                <p>Please log in to continue</p>
            </div>
            <div className="dropdown-actions">
                <button 
                    className="dropdown-btn primary"
                    onClick={() => navigate('/login')}
                >
                    Log In
                </button>
                <button 
                    className="dropdown-btn secondary"
                    onClick={() => navigate('/signin')}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};

const LoggedIn = ({ user, onLogout, onNavigate }) => {
    return (
        <div className="dropdown-menu">
            <div className="dropdown-header">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                        <h4>{user?.email}</h4>
                        <span className="user-status">Online</span>
                    </div>
                </div>
            </div>
            
            <div className="dropdown-items">
                <button 
                    className="dropdown-item"
                    onClick={() => onNavigate('/profile')}
                >
                    <span className="icon">👤</span>
                    Profile
                </button>
                
                <button 
                    className="dropdown-item"
                    onClick={() => onNavigate('/add-recipe')}
                >
                    <span className="icon">➕</span>
                    Add Recipe
                </button>
                
                <button 
                    className="dropdown-item"
                    onClick={() => onNavigate('/settings')}
                >
                    <span className="icon">⚙️</span>
                    Settings
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button 
                    className="dropdown-item logout"
                    onClick={onLogout}
                >
                    <span className="icon">🚪</span>
                    Logout
                </button>
            </div>
        </div>
    );
};

const NotLoggedInMenu = ({ onNavigate }) => {
    return (
        <div className="dropdown-menu">
            <div className="dropdown-header">
                <h3>Welcome to Foodist</h3>
                <p>Please log in to continue</p>
            </div>
            <div className="dropdown-actions">
                <button 
                    className="dropdown-btn primary"
                    onClick={() => onNavigate('/login')}
                >
                    Log In
                </button>
                <button 
                    className="dropdown-btn secondary"
                    onClick={() => onNavigate('/signin')}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};

const LoggedInMenu = ({ user, onLogout, onNavigate }) => {
    return (
        <div className="dropdown-menu">
            <div className="dropdown-header">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                        <h4>{user?.email}</h4>
                        <span className="user-status">Online</span>
                    </div>
                </div>
            </div>
            
            <div className="dropdown-items">
                <button 
                    className="dropdown-item"
                    onClick={() => onNavigate('/profile')}
                >
                    <span className="icon">👤</span>
                    Profile
                </button>
                
                <button 
                    className="dropdown-item"
                    onClick={() => onNavigate('/add-recipe')}
                >
                    <span className="icon">➕</span>
                    Add Recipe
                </button>
                
                <button 
                    className="dropdown-item"
                    onClick={() => onNavigate('/settings')}
                >
                    <span className="icon">⚙️</span>
                    Settings
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button 
                    className="dropdown-item logout"
                    onClick={onLogout}
                >
                    <span className="icon">🚪</span>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default UserDropDown;