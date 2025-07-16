import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";

interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    highScore?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => void;
    refetchUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    console.log(user);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/auth/me", { withCredentials: true });
            setUser(res.data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await axios.get("/auth/logout", { withCredentials: true });
        setUser(null);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, logout, refetchUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};