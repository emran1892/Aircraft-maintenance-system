import React from 'react';
import { Plus } from 'lucide-react';

interface AircraftsProps {
    aircrafts: any[];
    setIsModalOpen: (open: boolean) => void;
}

const Aircrafts: React.FC<AircraftsProps> = ({ aircrafts, setIsModalOpen }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Aircraft Fleet Management</h2>
                    <p className="text-gray-400 text-sm mt-1">Monitor and add aircraft to the operational fleet.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/10"
                >
                    <Plus size={18} />
                    <span>Add Aircraft</span>
                </button>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-800/50 text-gray-400 text-sm font-semibold border-b border-gray-800">
                            <th className="p-4">Tail/Registration No</th>
                            <th className="p-4">Aircraft Name</th>
                            <th className="p-4">Aircraft Model</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Added At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-gray-300">
                        {aircrafts.map((aircraft: any) => (
                            <tr key={aircraft.id} className="hover:bg-gray-800/30 transition-colors">
                                <td className="p-4 font-mono font-bold text-blue-400">{aircraft.registration_number}</td>
                                <td className="p-4">{aircraft.name}</td>
                                <td className="p-4">{aircraft.model}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${aircraft.status === 'fully_serviceable' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {aircraft.status === 'fully_serviceable' ? 'Serviceable' : 'AOG'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(aircraft.createdAt || Date.now()).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Aircrafts;