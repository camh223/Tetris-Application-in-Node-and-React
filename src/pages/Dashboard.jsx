import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handlePlayClick = () => {
        navigate('/play');
    };

    return (
        <div className="dashboard">
            <h2>Welcome { user.username } to your Tetris Dashboard!</h2>
            <button onClick={handlePlayClick}>Play Tetris</button>
        </div>
    );
}

export default Dashboard;