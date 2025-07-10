import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode
} from 'react';
import api from '../api/axios';

export interface User {
    _id: string;
    name: string;
    email: string;
    highScore: number;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<User | void>;
    logout: () => void;
    updateHighScore: (score: number) => Promise<any>;
    getLeaderboard: () => Promise<any[]>;
    error: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(res.data.user);
                } catch (err) {
                    console.error('Token invalid or expired');
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email: string, password: string): Promise<User | void> => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });
            const data = response.data
            setUser(data.user);
            localStorage.setItem('token', data.token);
            setError('');
            return data.user;
        } catch (err: any) {
            console.error('Login error', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Login failed');
            }
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    const updateHighScore = async (score: number): Promise<any> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await api.put(
                '/auth/update-highscore', 
                { score }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
            
            // Update the user's high score in the context if it was updated
            if (data.isNewHighScore) {
                setUser((prevUser) =>
                    prevUser
                        ? { ...prevUser, highScore: data.highScore }
                        : prevUser
                );
            }

            return data;
        } catch (err) {
            console.error('Update high score error:', err);
            throw err;
        }
    };

    const getLeaderboard = async (): Promise<any[]> => {
        try {
            const response = await api.get('/auth/leaderboard');
            return response.data.leaderboard;
        } catch (err) {
            console.error('Get leaderboard error:', err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, login, logout, updateHighScore, getLeaderboard, error }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used with an AuthProvider');
    }
    return context;
};
