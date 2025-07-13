import GoogleLoginButton from "../components/GoogleLoginButton";
import "./Login.css";

const Login = () => {
    return (
        <div className="login-page">
            <h2>Sign in</h2>
            <GoogleLoginButton />
        </div>
    );
};

export default Login;