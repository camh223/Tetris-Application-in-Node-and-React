import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
    return (
        <div style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#ffffff' }}>
            <Navbar />
            <main style={{ backgroundColor: '#121212' }}>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;