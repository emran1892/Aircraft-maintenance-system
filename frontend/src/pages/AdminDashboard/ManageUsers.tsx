import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'engineer' | 'checker';
    createdAt?: string;
}

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Form States for creating a new user
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'engineer' | 'checker'>('engineer');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // 1. Fetch Existing Users (Engineers) using your auth endpoint
    const fetchUsers = async () => {
        try {
            setLoading(true);
            // 📡 তোমার এক্সিস্টিং রাউট: /auth/engineers
            const res = await apiClient.get('/auth/engineers');
            setUsers(res.data.data || res.data);
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(); // কম্পোনেন্ট লোড হওয়ার সাথে সাথে লিস্ট চলে আসবে
    }, []);

    // 2. Handle Create User Submit via Admin Secure Route
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!name || !email || !password || !role) {
            setFormError('Please fill in all fields.');
            return;
        }

        try {
            setFormLoading(true);

            // 🚀 তোমার ব্যাকএন্ডের সিকিউরড অ্যাডমিন ক্রিয়েশন এপিআই: /auth/create-user
            await apiClient.post('/auth/create-user', {
                name,
                email,
                password,
                role
            });

            alert(`${role.toUpperCase()} account created successfully!`);

            // Reset Form and close modal
            setName('');
            setEmail('');
            setPassword('');
            setRole('engineer');
            setIsModalOpen(false);

            // নতুন ইউজার তৈরি হওয়ার পর লিস্টটি রিফ্রেশ করা হবে
            fetchUsers();
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Failed to create user.');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-950 min-h-screen text-white">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-wide text-blue-400">👥 Manage Team Members</h2>
                    <p className="text-gray-400 text-xs mt-1">Manually onboard and manage system access for Engineers and Checkers.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                >
                    ➕ Onboard New Member
                </button>
            </div>

            {/* Existing Users Table List */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                    <h3 className="text-sm font-bold tracking-wide text-gray-300">Active Technical Personnel</h3>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500 text-sm animate-pulse">Loading member directory...</div>
                ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm italic">No users found in the system database.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-gray-950/60 text-xs uppercase text-gray-400 tracking-wider font-mono">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email Address</th>
                                    <th className="px-6 py-3">System Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-850/40 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-200">{user.name}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md uppercase ${user.role === 'engineer'
                                                    ? 'bg-amber-500/10 text-amber-400'
                                                    : user.role === 'checker'
                                                        ? 'bg-indigo-500/10 text-indigo-400'
                                                        : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 🛠️ Add User Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-md p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-xl font-bold text-blue-400 mb-1">Create Team Account</h3>
                        <p className="text-xs text-gray-400 mb-4">Register a new verified employee into the system database.</p>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Jane Doe"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jane@aviation.com"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">System Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'engineer' | 'checker')}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="engineer">🔧 Aircraft Maintenance Engineer (AME)</option>
                                    <option value="checker">🕵️‍♂️ Quality Checker / Tester</option>
                                </select>
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                                >
                                    {formLoading ? "Creating..." : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;