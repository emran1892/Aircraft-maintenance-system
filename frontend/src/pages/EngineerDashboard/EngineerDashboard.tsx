import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';

interface Aircraft {
    id: string;
    name: string;
    model: string;
    registration_number: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    aircraft: Aircraft;
}

const EngineerDashboard: React.FC = () => {
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [openPool, setOpenPool] = useState<Task[]>([]);
    const [activeTab, setActiveTab] = useState<'my_tasks' | 'open_pool'>('my_tasks');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // 1. Fetch data using existing backend endpoints
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // 1. Get tasks already assigned to me
            const myTasksRes = await apiClient.get('/discrepancies/my-tasks');
            setMyTasks(myTasksRes.data.data || myTasksRes.data);

            // 2. Get ALL discrepancies and log them to see the exact structure
            const allDiscrepanciesRes = await apiClient.get('/discrepancies/all');

            // 🔍 [CONSOLE LOG]: ব্রাউজার কনসোলে ডাটা চেক করার জন্য
            console.log("=== API RESPONSE FROM /all ===", allDiscrepanciesRes.data);

            const allTasks = allDiscrepanciesRes.data.data || allDiscrepanciesRes.data;

            if (Array.isArray(allTasks)) {
                // Filter only the OPEN tasks
                const openTasks = allTasks.filter((task: any) => {
                    console.log(`Task ID: ${task.id} | Current Status: ${task.status}`);
                    return task.status === 'open';
                });
                setOpenPool(openTasks);
            } else {
                console.error("Backend did not return an array. Check your structure!");
            }

        } catch (err: any) {
            console.error("Dashboard fetch error:", err);
            setError(err.response?.data?.message || "Failed to load tasks.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // 2. Claim/Accept Task using your existing patch route (/:id/assign)
    const handleAcceptJob = async (discrepancyId: string) => {
        try {
            if (window.confirm("Are you sure you want to claim and start this maintenance task?")) {
                // Using your existing backend patch endpoint
                await apiClient.patch(`/discrepancies/${discrepancyId}/assign`);
                alert("Task claimed successfully! It is now in your active list.");
                fetchDashboardData(); // Refresh data to update tabs instantly
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to claim task. It might be taken.");
        }
    };

    // 3. Resolve Task using your existing patch route (/:id/resolve)
    const handleResolveJob = async (discrepancyId: string) => {
        try {
            if (window.confirm("Are you sure this discrepancy is fully resolved?")) {
                await apiClient.patch(`/discrepancies/${discrepancyId}/resolve`);
                alert("Task resolved and aircraft marked as serviceable!");
                fetchDashboardData();
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to resolve task.");
        }
    };

    return (
        <div className="p-8 bg-gray-950 min-h-screen text-white">
            {/* Header section */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-wide">🔧 Engineer Workstation</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage assigned maintenance tasks and claim open pool jobs.</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-sm transition-all"
                >
                    🔄 Refresh Data
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-800 pb-3">
                <button
                    onClick={() => setActiveTab('my_tasks')}
                    className={`px-4 py-2 font-bold text-sm rounded-xl transition-all ${activeTab === 'my_tasks' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    My Active Tasks ({myTasks.length})
                </button>
                <button
                    onClick={() => setActiveTab('open_pool')}
                    className={`px-4 py-2 font-bold text-sm rounded-xl transition-all ${activeTab === 'open_pool' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Available Jobs Pool ({openPool.length})
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500 text-sm animate-pulse">Updating task lists...</div>
            ) : (
                <div>
                    {/* Tab 1: Tasks Assigned to Me */}
                    {activeTab === 'my_tasks' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myTasks.length === 0 ? (
                                <p className="text-gray-500 text-sm col-span-full italic py-4">No tasks currently assigned to you.</p>
                            ) : (
                                myTasks.map((task) => (
                                    <div key={task.id} className="p-5 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-amber-400 tracking-wide">{task.title}</h3>
                                                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-md uppercase tracking-wider">{task.status}</span>
                                            </div>
                                            <p className="text-gray-400 text-sm leading-relaxed">{task.description}</p>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-gray-800/60 flex flex-col space-y-3">
                                            <div className="text-xs text-gray-400 font-semibold flex justify-between">
                                                <span>Aircraft:</span>
                                                <span className="text-gray-300">{task.aircraft?.name} ({task.aircraft?.registration_number})</span>
                                            </div>
                                            {task.status !== 'RESOLVED' && (
                                                <button
                                                    onClick={() => handleResolveJob(task.id)}
                                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/10"
                                                >
                                                    Sign-off & Resolve Discrepancy
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Tab 2: Available Open Pool Tasks */}
                    {activeTab === 'open_pool' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {openPool.length === 0 ? (
                                <p className="text-gray-500 text-sm col-span-full italic py-4">The job pool is empty. All reported discrepancies are currently being worked on!</p>
                            ) : (
                                openPool.map((task) => (
                                    <div key={task.id} className="p-5 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl hover:border-blue-500/30 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-blue-400 tracking-wide">{task.title}</h3>
                                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-md uppercase tracking-wider">POOL</span>
                                            </div>
                                            <p className="text-gray-400 text-sm leading-relaxed">{task.description}</p>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-gray-800/60 flex flex-col space-y-3">
                                            <div className="text-xs text-gray-400 font-semibold flex justify-between">
                                                <span>Aircraft Impacted:</span>
                                                <span className="text-gray-300">{task.aircraft?.name} ({task.aircraft?.registration_number})</span>
                                            </div>
                                            <button
                                                onClick={() => handleAcceptJob(task.id)}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/10"
                                            >
                                                Accept & Start Maintenance
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EngineerDashboard;