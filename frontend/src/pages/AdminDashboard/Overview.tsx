import React from 'react';

interface OverviewProps {
    userName: string;
    stats: { totalAircrafts: number; activeDiscrepancies: number; resolvedToday: number };
    setActiveTab: (tab: 'overview' | 'aircrafts' | 'discrepancies') => void;
}

const Overview: React.FC<OverviewProps> = ({ userName, stats, setActiveTab }) => {
    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Welcome Back, {userName}!</h2>
                <p className="text-gray-400 mt-1">Here is what's happening with your fleet today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 cursor-pointer hover:border-blue-500/50 transition-all" onClick={() => setActiveTab('aircrafts')}>
                    <p className="text-gray-400 text-sm font-medium">Total Aircrafts</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalAircrafts}</p>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 cursor-pointer hover:border-yellow-500/50 transition-all" onClick={() => setActiveTab('discrepancies')}>
                    <p className="text-gray-400 text-sm font-medium">Active Discrepancies</p>
                    <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.activeDiscrepancies}</p>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 cursor-pointer hover:border-green-500/50 transition-all" onClick={() => setActiveTab('discrepancies')}>
                    <p className="text-gray-400 text-sm font-medium">Resolved (Closed)</p>
                    <p className="text-3xl font-bold text-green-500 mt-2">{stats.resolvedToday}</p>
                </div>
            </div>
        </div>
    );
};

export default Overview;