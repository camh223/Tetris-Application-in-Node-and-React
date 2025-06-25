import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi'; 

import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav class="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
            <div class="container-fluid">
                <a className="navbar-brand" href="/dashboard">
                    <h1 className="navbar-title">Tetris</h1>
                </a>
                <div>
                    {user ? (
                        <>
                            <button 
                                onClick={logout}
                                className="btn btn-outline-light"
                            >
                                <FiLogOut />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;