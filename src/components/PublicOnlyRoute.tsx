import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

interface PublicOnlyRouteProps {
    children: JSX.Element;
}

const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicOnlyRoute;