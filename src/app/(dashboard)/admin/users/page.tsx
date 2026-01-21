'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useForm } from 'react-hook-form';

// --- Types ---
interface User {
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    isActive: boolean;
    registrationMethod: string;
    createdAt: string;
}

interface UserUpdateForm {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
    isActive: boolean;
}

// --- API Config ---
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const ITEMS_PER_PAGE = 10; // Number of users per page

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

// --- Styles ---
const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
const labelClass = "block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300";
const btnClass = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50";
const secondaryBtnClass = "bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showModal, setShowModal] = useState(false);
    
    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);

    // --- Data Fetching ---
    const fetchUsers = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers['Authorization']) return;

        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/admin/users`, { headers });
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            // toast.error("Could not load user list.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- Stats Calculation ---
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;

    // --- Form Handling ---
    const { register, handleSubmit, reset, setValue } = useForm<UserUpdateForm>();

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setValue('firstName', user.firstName);
        setValue('lastName', user.lastName);
        setValue('email', user.email);
        setValue('phoneNumber', user.phoneNumber);
        setValue('role', user.role);
        setValue('isActive', user.isActive);
        setShowModal(true);
    };

    const closeModal = () => {
        setEditingUser(null);
        setShowModal(false);
        reset();
    };

    const onUpdateSubmit = async (data: UserUpdateForm) => {
        if (!editingUser) return;

        const headers = getAuthHeaders();
        try {
            await axios.put(`${apiUrl}/api/admin/users/${editingUser.userId}`, data, { headers });
            toast.success("User updated successfully!");
            fetchUsers();
            closeModal();
        } catch (error: unknown) {
            console.error(error);
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error(axiosError.response?.data?.message || "Failed to update user.");
        }
    };

    const handleDelete = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        const headers = getAuthHeaders();
        try {
            await axios.delete(`${apiUrl}/api/admin/users/${userId}`, { headers });
            toast.success("User deleted.");
            setUsers(users.filter(u => u.userId !== userId));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete user.");
        }
    };

    // --- Filtering & Sorting ---
    // 1. Filter based on search term
    const filteredUsers = users.filter(user => 
        (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.phoneNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // 2. Sort by Created At (Latest First)
    const sortedUsers = [...filteredUsers].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // 3. Paginate
    const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedUsers = sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset to page 1 if search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="container mx-auto p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <ToastContainer position="bottom-right" />
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage registered users.</p>
                </div>
                <div className="mt-4 md:mt-0 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* --- User Statistics Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Users</h3>
                    <p className="text-3xl font-bold mt-1">{totalUsers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Active Users</h3>
                    <p className="text-3xl font-bold mt-1 text-green-600">{activeUsers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Inactive Users</h3>
                    <p className="text-3xl font-bold mt-1 text-red-600">{inactiveUsers}</p>
                </div>
            </div>

            {/* --- User Table --- */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading users...</td></tr>
                            ) : paginatedUsers.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No users found.</td></tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : 'U')}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <div>{user.email}</div>
                                            <div className="text-xs">{user.phoneNumber || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isActive ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button 
                                                onClick={() => openEditModal(user)} 
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user.userId)} 
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination Controls --- */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, sortedUsers.length)}</span> of <span className="font-medium">{sortedUsers.length}</span> users
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Edit Modal --- */}
            {showModal && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full shadow-xl transform transition-all">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>First Name</label>
                                    <input {...register('firstName', { required: true })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name</label>
                                    <input {...register('lastName', { required: true })} className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" {...register('email', { required: true })} className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <input type="tel" {...register('phoneNumber')} className={inputClass} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Role</label>
                                    <select {...register('role')} className={inputClass}>
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <input type="checkbox" id="modalActive" {...register('isActive')} className="w-5 h-5 accent-indigo-600 mr-2 rounded" />
                                    <label htmlFor="modalActive" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">Account Active</label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-2">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className={`flex-1 ${secondaryBtnClass}`}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className={`flex-1 ${btnClass}`}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}