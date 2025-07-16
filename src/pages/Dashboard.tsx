import React, { useState, useEffect, JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';
import axios from "../api/axios";

interface LeaderboardPlayer {
    _id: string;
    name: string;
    highScore: number;
}

function Dashboard(): JSX.Element {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [highScore, setHighScore] = useState<number | undefined>(user?.highScore);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get("/scores/top");
                setLeaderboard(res.data);
            } catch (err) {
                setError('Failed to load leaderboard');
                console.error('Failed to fetch leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    useEffect(() => {
        setHighScore(user?.highScore);
    }, [user?.highScore])

    const handlePlayClick = () => {
        navigate('/play');
    };

    if (!user) {
        return <p>Loading user data...</p>;
    }

    return (
        <div className="dashboard">
            <h2>Welcome {user.name} to your Tetris Dashboard!</h2>
            
            <div className="dashboard-content">
                <div className="stats-section">
                    <div className="stats">
                        <h3>Your High Score: {highScore}</h3>
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
                                            className={`leaderboard-item ${player.name === user.name ? 'current-user' : ''}`}
                                        >
                                            <span className="rank">#{index + 1}</span>
                                            <span className="username">{player.name}</span>
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