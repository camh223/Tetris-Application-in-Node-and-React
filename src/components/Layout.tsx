import React, { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout(): JSX.Element {
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