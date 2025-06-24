import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <h1 className="navbar-title">Tetris</h1>
            <div>
                {user ? (
                    <>
                        <span>{user.username}</span>
                        <button onClick={logout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;