'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
};

interface Camp {
    campId: number;
    title: string;
    status: string;
    startDate: string; // Assuming your DTO will provide at least one date
    location: string;
    isActive: boolean;
}

const CampsDashboard: React.FC = () => {
    const [camps, setCamps] = useState<Camp[]>([]);

    const fetchCamps = useCallback(async () => {
        try {
            const headers = getAuthHeaders();
              if (!headers || !headers['Authorization']) return;
            const response = await axios.get(`${apiUrl}/api/admin/camps`, { headers });
            console.log("Fetched camps:", response.data);   
            setCamps(response.data);
        } catch (error) {
            toast.error("Failed to fetch camps.");
            console.error("Error fetching camps:", error);
        }
    }, []);

    useEffect(() => {
        fetchCamps();
    }, [fetchCamps]);

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this camp?")) {
            try {
                const headers = getAuthHeaders();
                  if (!headers || !headers['Authorization']) return;
                await axios.delete(`${apiUrl}/api/admin/camps/${id}`, { headers });
                toast.success("Camp deleted!");
                fetchCamps();
            } catch (error) {
                toast.error("Failed to delete camp.");
                console.error("Error deleting camp:", error);   
            }
        }
    };
    
    // You will need to implement this function
    const handleToggleActive = async (id: number, newStatus: boolean) => {
        try {
            const headers = getAuthHeaders();
              if (!headers || !headers['Authorization']) return;
            await axios.put(`${apiUrl}/api/admin/camps/${id}/active`, { isActive: newStatus }, { headers });
            toast.success(`Camp status updated!`);
            fetchCamps();
        } catch {
            toast.error("Failed to update status.");
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <ToastContainer position="bottom-right" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Camps</h1>
                <Link href="/admin/camps/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    Add New Camp
                </Link>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Public</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {camps.map(camp => (
                                <tr key={camp.campId} className="border-b">
                                    <td className="px-4 py-3 font-medium">{camp.title}</td>
                                    <td className="px-4 py-3">{camp.location}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${camp.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {camp.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleToggleActive(camp.campId, !camp.isActive)} className={`text-sm ${camp.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                            {camp.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 flex items-center gap-2">
                                        <Link href={`/admin/camps/edit/${camp.campId}`} className="text-indigo-600 hover:underline">Edit</Link>
                                        <button onClick={() => handleDelete(camp.campId)} className="text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CampsDashboard;