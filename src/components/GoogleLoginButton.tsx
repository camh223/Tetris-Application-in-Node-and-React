import React from "react";

const GoogleLoginButton: React.FC = () => {
    const handleLogin = () => {
        window.location.href = "http://localhost:5000/api/auth/google";
    };

    return (
        <button onClick={handleLogin} className="btn-google-login">
            Sign in with Google
        </button>
    );
};

export default GoogleLoginButton;