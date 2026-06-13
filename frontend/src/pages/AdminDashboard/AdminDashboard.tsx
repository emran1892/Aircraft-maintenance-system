import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plane, AlertTriangle, Users, LogOut, User, X } from 'lucide-react';
import apiClient from '../../api/apiClient';

// 📂 Sub-components
import Overview from './Overview';
import Aircrafts from './Aircrafts';
import Discrepancies from './Discrepancies';
import ManageUsers from './ManageUsers'; // 👈 নতুন সাব-কম্পোনেন্ট ইম্পোর্ট করা হলো

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Admin';

    // 🚀 activeTab-এ 'users' অপশন যুক্ত করা হলো
    const [activeTab, setActiveTab] = useState<'overview' | 'aircrafts' | 'discrepancies' | 'users'>('overview');
    const [stats, setStats] = useState({ totalAircrafts: 0, activeDiscrepancies: 0, resolvedToday: 0 });
    const [aircrafts, setAircrafts] = useState<any[]>([]);
    const [discrepancies, setDiscrepancies] = useState<any[]>([]);
    const [engineers, setEngineers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Aircraft Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAircraft, setNewAircraft] = useState({ name: '', model: '', registration_number: '', status: 'fully_serviceable' });
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);

            let aircraftList: any[] = [];
            let totalDiscrepancies: any[] = [];
            let engineerList: any[] = [];

            // 🟢 ১. এয়ারক্রাফট ডেটা লোড
            try {
                const aircraftRes = await apiClient.get('/aircrafts/all');
                aircraftList = aircraftRes.data?.data || [];
            } catch (err) {
                console.error("এয়ারক্রাফট লোড করতে সমস্যা হয়েছে:", err);
            }

            // 🟢 ২. ডিসক্রিপেন্সি ডেটা লোড
            try {
                const discrepancyRes = await apiClient.get('/discrepancies/all');
                totalDiscrepancies = discrepancyRes.data?.data || [];
            } catch (err) {
                console.error("ডিসক্রিপেন্সি লোড করতে সমস্যা হয়েছে:", err);
            }

            // 🟢 ৩. ইঞ্জিনিয়ারদের ডেটা লোড করা
            try {
                const engineerRes = await apiClient.get('/auth/engineers');
                if (engineerRes.data && Array.isArray(engineerRes.data.data)) {
                    engineerList = engineerRes.data.data;
                } else if (Array.isArray(engineerRes.data)) {
                    engineerList = engineerRes.data;
                }
            } catch (err) {
                console.error("ইঞ্জিনিয়ার লিস্ট লোড করতে সমস্যা হয়েছে:", err);
            }

            // 🎯 সব ডেটা একসাথে স্টেটে সেট করা হচ্ছে
            setAircrafts(aircraftList);
            setDiscrepancies(totalDiscrepancies);
            setEngineers(engineerList);

            // 📊 স্ট্যাটাস আপডেট
            setStats({
                totalAircrafts: aircraftList.length,
                activeDiscrepancies: totalDiscrepancies.filter((d: any) => d.status !== 'resolved').length,
                resolvedToday: totalDiscrepancies.filter((d: any) => d.status === 'resolved').length
            });

        } catch (error) {
            console.error("ড্যাশবোর্ডের মূল ডেটা প্রসেসিংয়ে জটিল সমস্যা:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleAddAircraft = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!newAircraft.name || !newAircraft.model || !newAircraft.registration_number) {
            setFormError('Please fill in all fields.');
            return;
        }

        try {
            setFormLoading(true);
            await apiClient.post('/aircrafts/create', newAircraft);
            setNewAircraft({ name: '', model: '', registration_number: '', status: 'SERVICEABLE' });
            setIsModalOpen(false);
            await fetchAllData();
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Failed to add aircraft.');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between">
                <div>
                    <div className="p-6 border-b border-gray-800 flex items-center gap-2">
                        <span className="text-2xl">💡</span>
                        <h1 className="text-xl font-bold tracking-wider text-white">AERO-FIX</h1>
                    </div>
                    <nav className="p-4 space-y-2">
                        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <LayoutDashboard size={20} />
                            <span>Overview</span>
                        </button>
                        <button onClick={() => setActiveTab('aircrafts')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'aircrafts' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <Plane size={20} />
                            <span>Aircrafts</span>
                        </button>
                        <button onClick={() => setActiveTab('discrepancies')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'discrepancies' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <AlertTriangle size={20} />
                            <span>Discrepancies</span>
                        </button>

                        {/* 🔓 Manage Users বাটনটি আনলক এবং সচল করা হলো */}
                        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <Users size={20} />
                            <span>Manage Users</span>
                        </button>
                    </nav>
                </div>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-end px-8">
                    <div className="flex items-center gap-3 bg-gray-800 px-4 py-1.5 rounded-full border border-gray-700">
                        <User size={16} className="text-blue-400" />
                        <span className="text-sm font-medium text-gray-200">{userName}</span>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-bold uppercase">Admin</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="text-center text-blue-400 font-medium mt-12 animate-pulse">⚡ Loading Fleet Intel...</div>
                    ) : (
                        <>
                            {activeTab === 'overview' && <Overview userName={userName} stats={stats} setActiveTab={setActiveTab} />}
                            {activeTab === 'aircrafts' && <Aircrafts aircrafts={aircrafts} setIsModalOpen={setIsModalOpen} />}
                            {activeTab === 'discrepancies' && <Discrepancies discrepancies={discrepancies} aircrafts={aircrafts} engineers={engineers} refreshData={fetchAllData} />}

                            {/* 👥 Manage Users ট্যাব রেন্ডারিং কন্ডিশন */}
                            {activeTab === 'users' && <ManageUsers />}
                        </>
                    )}
                </main>
            </div>

            {/* Modal: Add Aircraft */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Register New Aircraft</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddAircraft} className="p-6 space-y-4">
                            {formError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{formError}</div>}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Aircraft Name</label>
                                <input type="text" placeholder="e.g., Boeing 777" value={newAircraft.name} onChange={(e) => setNewAircraft({ ...newAircraft, name: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Aircraft Model</label>
                                <input type="text" placeholder="e.g., Airbus A320" value={newAircraft.model} onChange={(e) => setNewAircraft({ ...newAircraft, model: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Registration Number</label>
                                <input type="text" placeholder="e.g., S2-AHM" value={newAircraft.registration_number} onChange={(e) => setNewAircraft({ ...newAircraft, registration_number: e.target.value.toUpperCase() })} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Operational Status</label>
                                <select value={newAircraft.status} onChange={(e) => setNewAircraft({ ...newAircraft, status: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">
                                    <option value="fully_serviceable">🟢 SERVICEABLE</option>
                                    <option value="aog">🔴 AOG (Aircraft On Ground)</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg">Cancel</button>
                                <button type="submit" disabled={formLoading} className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-800">{formLoading ? 'Registering...' : 'Register Aircraft'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;