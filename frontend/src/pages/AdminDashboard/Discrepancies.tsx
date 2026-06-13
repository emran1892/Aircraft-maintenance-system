import React, { useState } from 'react';
import { Plane, User, ShieldAlert, Plus, X, UserPlus } from 'lucide-react';
import apiClient from '../../api/apiClient';

interface DiscrepanciesProps {
    discrepancies: any[];
    aircrafts: any[];
    engineers: any[]; // 👈 ইঞ্জিনিয়ারদের লিস্ট
    refreshData: () => Promise<void>;
}

const Discrepancies: React.FC<DiscrepanciesProps> = ({ discrepancies, aircrafts, engineers, refreshData }) => {
    // Report Modal States
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportForm, setReportForm] = useState({ title: '', description: '', aircraftId: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 🎯 টাস্ক অ্যাসাইন করার জন্য সিলেক্টেড ইঞ্জিনিয়ার ট্র্যাক করার স্টেট অবজেক্ট
    const [selectedEngineerMap, setSelectedEngineerMap] = useState<{ [key: string]: string }>({});
    const [assignLoadingId, setAssignLoadingId] = useState<string | null>(null);

    // 💾 নতুন ডিসক্রিপেন্সি রিপোর্ট করার সাবমিট হ্যান্ডলার
    const handleReportIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!reportForm.title || !reportForm.description || !reportForm.aircraftId) {
            setError('Please fill in all mandatory fields.');
            return;
        }

        try {
            setLoading(true);
            await apiClient.post('/discrepancies/report', {
                title: reportForm.title,
                description: reportForm.description,
                aircraft_id: reportForm.aircraftId
            });

            setReportForm({ title: '', description: '', aircraftId: '' });
            setIsReportModalOpen(false);
            await refreshData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit discrepancy log.');
        } finally {
            setLoading(false);
        }
    };

    // ⚙️ ইঞ্জিনিয়ার অ্যাসাইন করার এপিআই হ্যান্ডলার
    const handleAssignEngineer = async (discrepancyId: string) => {
        const engineerId = selectedEngineerMap[discrepancyId];
        if (!engineerId) {
            alert('Please select an engineer first!');
            return;
        }

        try {
            setAssignLoadingId(discrepancyId);
            // তোমার ব্যাকএন্ড রাউট: patch('/:id/assign') এর সাথে হুবহু ম্যাচ করা হয়েছে
            await apiClient.patch(`/discrepancies/${discrepancyId}/assign`, {
                engineer_id: engineerId // ব্যাকএন্ড রিকোয়েস্ট বডি থেকে 'engineer_id' ই এক্সপেক্ট করে
            });

            alert('Task successfully assigned to engineer! ✈️');
            await refreshData(); // স্ক্রিনের ডাটা রিফ্রেশ করা হবে
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to assign engineer.');
        } finally {
            setAssignLoadingId(null);
        }
    };

    return (
        <div>
            {/* 🔝 Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Discrepancies & Maintenance Logs</h2>
                    <p className="text-gray-400 text-sm mt-1">Track mechanical issues, leaks, and repair status across the fleet.</p>
                </div>
                <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-yellow-600/10"
                >
                    <Plus size={18} />
                    <span>Report Discrepancy</span>
                </button>
            </div>

            {/* 📇 Discrepancies List */}
            {discrepancies.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800 text-gray-500">
                    No issues reported yet. Smooth flying! ☀️
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {discrepancies.map((dis: any) => (
                        <div key={dis.id} className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col justify-between gap-4 hover:border-gray-700 transition-all">

                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="text-lg font-bold text-white">{dis.title}</h3>
                                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase ${dis.status === 'resolved'
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                        : dis.status === 'in_progress'
                                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                        {dis.status ? dis.status.replace('_', ' ') : 'Open'}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">{dis.description}</p>
                            </div>

                            {/* Relations Details Boxes */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-gray-400">
                                <div className="flex items-center gap-2 bg-gray-950/40 p-2.5 rounded-lg border border-gray-800">
                                    <Plane size={14} className="text-blue-400 flex-shrink-0" />
                                    <div>
                                        <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider">Aircraft</span>
                                        <span className="text-gray-200 font-medium">{dis.aircraft ? `${dis.aircraft.name} (${dis.aircraft.registration_number})` : 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-gray-950/40 p-2.5 rounded-lg border border-gray-800">
                                    <User size={14} className="text-purple-400 flex-shrink-0" />
                                    <div>
                                        <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider">Reported By</span>
                                        <span className="text-gray-200 font-medium">{dis.reportedBy?.name || dis.user?.name || 'Unknown Crew'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-gray-950/40 p-2.5 rounded-lg border border-gray-800">
                                    <ShieldAlert size={14} className="text-yellow-500 flex-shrink-0" />
                                    <div>
                                        <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider">Assigned Engineer</span>
                                        <span className="text-gray-200 font-medium">{dis.assignedTo?.name ? dis.assignedTo.name : '⛔ Not Assigned'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ⚙️ এডমিনের অ্যাসাইনমেন্ট প্যানেল (শুধুমাত্র টাস্ক 'open' থাকলে এটি দেখাবে) */}
                            {(!dis.status || dis.status === 'open') && (
                                <div className="mt-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="text-xs text-blue-400 font-medium">
                                        👋 This discrepancy needs an Engineer. Assign one below:
                                    </div>
                                    <div className="flex w-full sm:w-auto gap-2 items-center">
                                        <select
                                            value={selectedEngineerMap[dis.id] || ''}
                                            onChange={(e) => setSelectedEngineerMap({ ...selectedEngineerMap, [dis.id]: e.target.value })}
                                            className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full sm:w-48"
                                        >
                                            <option value="">-- Select Engineer --</option>
                                            {/* 💡 এখানে নিশ্চিত করো eng.name এবং eng.id সব ছোট হাতের অক্ষরে আছে */}
                                            {engineers && engineers.map((eng) => (
                                                <option key={eng.id} value={eng.id}>
                                                    {eng.name ? eng.name : "No Name Found"}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleAssignEngineer(dis.id)}
                                            disabled={assignLoadingId === dis.id}
                                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                                        >
                                            <UserPlus size={14} />
                                            <span>{assignLoadingId === dis.id ? 'Assigning...' : 'Assign'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1 border-t border-gray-800/30">
                                <span>ID: #{dis.id}</span>
                                <span>Reported on: <strong className="text-gray-400 font-normal">{new Date(dis.createdAt || dis.created_at).toLocaleDateString()}</strong></span>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Modal: Report Discrepancy */}
            {isReportModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Log Fleet Discrepancy</h3>
                            <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleReportIssue} className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Target Aircraft</label>
                                <select value={reportForm.aircraftId} onChange={(e) => setReportForm({ ...reportForm, aircraftId: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">
                                    <option value="">-- Select Affected Aircraft --</option>
                                    {aircrafts.map((ac) => (
                                        <option key={ac.id} value={ac.id}>{ac.name} ({ac.registration_number})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Issue Title</label>
                                <input type="text" placeholder="e.g., Left Engine Oil Leakage" value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Detailed Description</label>
                                <textarea rows={4} placeholder="Describe the physical or technical systems error..." value={reportForm.description} onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none" />
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg">Cancel</button>
                                <button type="submit" disabled={loading} className="px-5 py-2 bg-yellow-600 text-white rounded-lg disabled:bg-yellow-800">{loading ? 'Submitting...' : 'Log Discrepancy'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Discrepancies;