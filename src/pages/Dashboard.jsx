import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();

    const handlePlayClick = () => {
        navigate('/play');
    };

    return (
        <div className="dashboard">
            <h2>Welcome to the Tetris Dashboard</h2>
            <button onClick={handlePlayClick}>Play Tetris</button>
        </div>
    );
}

export default Dashboard;