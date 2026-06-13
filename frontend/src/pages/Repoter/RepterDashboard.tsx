import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';

interface Aircraft {
    id: string;
    name: string;
    model: string;
    registration_number: string;
    status: string;
}

const RepterDashboard: React.FC = () => {
    const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

    // Form States for reporting problem
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // 1. Fetch All Aircrafts
    const fetchAircrafts = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/aircrafts/all'); // তোমার ব্যাকএন্ডের অল এয়ারক্রাফট এপিআই
            setAircrafts(res.data.data || res.data);
        } catch (err) {
            console.error("Failed to load aircrafts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAircrafts();
    }, []);

    // 2. Open Report Modal
    const openReportModal = (aircraft: Aircraft) => {
        setSelectedAircraft(aircraft);
        setIsModalOpen(true);
    };

    // 3. Submit Discrepancy Report
    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !selectedAircraft) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            setFormLoading(true);

            // 🚀 এখানে 'aircraftId' বদলে 'aircraft_id' করা হলো (ব্যাকএন্ডের সাথে ম্যাচ করাতে)
            await apiClient.post('/discrepancies/report', {
                title,
                description,
                aircraft_id: selectedAircraft.id
            });

            alert(`Discrepancy reported successfully for ${selectedAircraft.name}!`);

            // Reset form and close modal
            setTitle('');
            setDescription('');
            setIsModalOpen(false);
            setSelectedAircraft(null);

            // Refresh aircraft list to show updated status (e.g. if it turns into AOG)
            fetchAircrafts();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to submit report.");
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="p-8 bg-gray-950 min-h-screen text-white">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-wide text-indigo-400">🕵️‍♂️ Tester / Checker Station</h1>
                    <p className="text-gray-400 text-sm mt-1">Inspect aircraft and instantly report technical discrepancies to engineering.</p>
                </div>
                <button
                    onClick={fetchAircrafts}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-sm transition-all"
                >
                    🔄 Refresh Fleet Status
                </button>
            </div>

            {/* Main Aircraft Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-500 animate-pulse">Loading active fleet...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aircrafts.map((aircraft) => (
                        <div key={aircraft.id} className="p-5 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col justify-between hover:border-indigo-500/30 transition-all">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold tracking-wide text-gray-100">{aircraft.name}</h3>
                                    <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-md uppercase tracking-wider ${aircraft.status === 'SERVICEABLE' || aircraft.status === 'fully_serviceable'
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-red-500/10 text-red-400'
                                        }`}>
                                        {aircraft.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">Model: <span className="text-gray-300 font-medium">{aircraft.model}</span></p>
                                <p className="text-gray-400 text-sm mt-0.5">Registration: <span className="text-indigo-400 font-mono text-xs">{aircraft.registration_number}</span></p>
                            </div>

                            {/* Report Action Button */}
                            <div className="mt-6 pt-4 border-t border-gray-800/60">
                                <button
                                    onClick={() => openReportModal(aircraft)}
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10"
                                >
                                    ⚠️ Report New Discrepancy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 🛠️ Report Discrepancy Modal Form */}
            {isModalOpen && selectedAircraft && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-md p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95">
                        <h2 className="text-xl font-bold text-indigo-400">Log Issue for {selectedAircraft.name}</h2>
                        <p className="text-xs text-gray-400 mt-1 mb-4">This will flag the aircraft and add the job to the Engineer Pool.</p>

                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Issue Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Left Engine Oil Leak, Cockpit Display Flicker"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Detailed Description</label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the defect details observed during standard inspection..."
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                />
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
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                                >
                                    {formLoading ? "Submitting..." : "Submit Report"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepterDashboard;