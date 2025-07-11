import { JSX, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import './Register.css'

import api from '../api/axios';

const Register = (): JSX.Element => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await api.post('/auth/register', {
                username,
                email,
                password,
            });

            setError('');
            setSuccess('Registration successful! You can now log in.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: unknown) {
            console.error('Registration error', err);
            if (
                typeof err === 'object' &&
                err !== null &&
                'response' in err &&
                typeof err.response === 'object' &&
                err.response !== null &&
                'data' in err.response &&
                typeof err.response.data === 'object' &&
                err.response.data !== null &&
                'message' in err.response.data
            ) {
                setError((err.response.data as { message: string }).message);
            } else {
                setError('Registration failed');
            }
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                />

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

                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                />

                <button type="submit">Register</button>
            </form>
            
            <div className="auth-link">
                <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </div>
    );
};

export default Register;