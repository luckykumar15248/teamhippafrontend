import React, { useState } from 'react';
import { toast } from 'react-toastify'; 

interface Sport {
id: number;
name: string;
isActive: boolean;
courseCount: number;
}

interface SportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sportData: { name: string; isActive: boolean }) => void;
    sport: Sport | null;
}



const SportModal: React.FC<SportModalProps> = ({ isOpen, onClose, onSave, sport }) => {
    const [name, setName] = useState(sport?.name || '');
    const [isActive, setIsActive] = useState(sport?.isActive ?? true);
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim()) {
            toast.error("Sport name cannot be empty.");
            return;
        }
        onSave({ name, isActive });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{sport ? 'Edit Sport' : 'Add New Sport'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="sportName" className="block text-sm font-medium text-gray-700">Sport Name</label>
                            <input
                                type="text"
                                id="sportName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="flex items-center">
                             <input
                                type="checkbox"
                                id="sportStatus"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="sportStatus" className="ml-2 block text-sm text-gray-900">Active</label>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700">Save Sport</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SportModal;