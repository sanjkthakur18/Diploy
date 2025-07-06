import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
    const [data, setData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3500/api/auth/register", data);
            console.log(response)
            setSuccess(response?.data?.message);
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            const message = err.response?.data?.error?.message || "Registration failed";
            setError(message);
        }
    };

    return (
        <div className="flex items-center justify-center h-[100vh] bg-gradient-to-br from-blue-100 to-purple-100">
            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Create Account</h2>
                <div className="space-y-4">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {success && <p className="text-green-500 text-sm text-center">{success}</p>}
                    <input
                        placeholder="Username"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        name="username"
                        value={data.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        name="password"
                        value={data.password}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold p-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition duration-300"
                    >
                        Sign Up
                    </button>
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Already have an account{' '}
                        <Link to="/" className="text-blue-600 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Register;