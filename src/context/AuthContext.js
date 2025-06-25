import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            console.log('Checking token', token);
            if (token) {
                try {
                    const res = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log('User loaded:', res.data.user);
                    setUser(res.data.user);
                } catch (err) {
                    console.error('Token invalid or expired');
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
            console.log("Finished auth check");
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });
            const data = response.data

            setUser(data.user);
            localStorage.setItem('token', data.token);
            console.log('Login successful', data);
            setError('');
            return data.user;
        } catch (err) {
            console.error('Login error', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Login failed');
            }
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, error }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

