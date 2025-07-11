import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi'; 

import './Navbar.css';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/dashboard">
                    <h1 className="navbar-title">Tetris</h1>
                </Link>
                <div>
                    {user ? (
                        <button 
                            onClick={logout}
                            className="btn btn-outline-light"
                        >
                            <FiLogOut style={{ marginRight: '5px' }} />
                            Logout
                        </button>
                    ) : null}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;