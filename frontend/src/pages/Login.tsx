import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const Login: React.FC = () => {
    // 1. States to store user input, error messages, and loading status
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate(); // Used to redirect users to different pages

    // 2. Form submit handler function
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic validation to check if fields are empty
        if (!email || !password) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        try {
            // Clear any old session data before logging in again
            localStorage.clear();

            // Send login request to the backend API
            const response = await apiClient.post('/auth/login', { email, password });

            // Get token and user details from backend response
            const { token, user } = response.data.data;

            // 3. Save token and user information inside browser's localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('role', user?.role || '');
            localStorage.setItem('userName', user?.name || '');

            // 4. Check user role and redirect to the correct dashboard
            const userRole = user?.role;

            if (userRole === 'admin') {
                navigate('/admin');
            } else if (userRole === 'checker') {
                navigate('/checker');
            } else if (userRole === 'engineer') {
                navigate('/engineer'); // Redirects engineers to the new dashboard
            } else {
                setError('Unknown user role. Access denied.');
            }
        } catch (err: any) {
            // Get error message from backend or use a default message
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">

                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-white tracking-wide">💡 AERO-FIX</h2>
                    <p className="text-gray-400 mt-2 text-sm">Aviation Maintenance Dashboard</p>
                </div>

                {/* Error Alert Box */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                            placeholder="name@airline.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:bg-blue-800 text-sm shadow-lg shadow-blue-600/10"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;