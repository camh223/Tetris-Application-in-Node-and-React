import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user, getLeaderboard } = useAuth();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard();
                setLeaderboard(data);
            } catch (err) {
                setError('Failed to load leaderboard');
                console.error('Failed to fetch leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [getLeaderboard]);

    const handlePlayClick = () => {
        navigate('/play');
    };

    return (
        <div className="dashboard">
            <h2>Welcome {user.username} to your Tetris Dashboard!</h2>
            
            <div className="dashboard-content">
                <div className="stats-section">
                    <div className="stats">
                        <h3>Your High Score: {user.highScore}</h3>
                    </div>
                    <button onClick={handlePlayClick}>Play Tetris</button>
                </div>

                <div className="leaderboard-section">
                    <h3>🏆 Leaderboard - Top 10</h3>
                    {loading ? (
                        <p>Loading leaderboard...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : (
                        <div className="leaderboard">
                            {leaderboard.length === 0 ? (
                                <p>No scores yet. Be the first to play!</p>
                            ) : (
                                <ol className="leaderboard-list">
                                    {leaderboard.map((player, index) => (
                                        <li 
                                            key={player._id} 
                                            className={`leaderboard-item ${player.username === user.username ? 'current-user' : ''}`}
                                        >
                                            <span className="rank">#{index + 1}</span>
                                            <span className="username">{player.username}</span>
                                            <span className="score">{player.highScore.toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;