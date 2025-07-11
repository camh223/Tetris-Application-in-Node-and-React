import { JSX, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import './Login.css'

const Login = (): JSX.Element => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { login, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const loggedInUser = await login(email, password);
            if (!loggedInUser) {
                console.log('Login failed');
            } else {
                console.log('Login successful');
                navigate('/play');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    return (
        <div className="container-md">
            <div className="login-container">
                <h2>Login</h2>

                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />

                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                    />

                    <button type="submit">Login</button>
                </form>
                
                <div className="auth-link">
                    <p>Don't have an account? <Link to="/register">Register here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;