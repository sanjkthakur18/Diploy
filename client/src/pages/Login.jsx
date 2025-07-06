import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
        // setSuccess(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("http://localhost:3500/api/auth/login", {
                email,
                password,
            });
            localStorage.setItem("token", data.token);
            navigate("/products");
        } catch (err) {
           const message = err.response?.data?.error?.message || "Registration failed";
            setError(message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Login</h2>
                <div className="space-y-4">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold p-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition duration-300"
                    >
                        Login
                    </button>
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Login;