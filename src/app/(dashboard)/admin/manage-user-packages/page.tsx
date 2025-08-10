// File: app/(dashboard)/admin/manage-user-packages/page.tsx
'use client';

import React, { useState, useEffect} from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';

// --- Type Definitions ---
interface UserSummary {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface PurchasedSessionDetails {
    id: number;
    courseId: number;
    courseName: string;
    totalSessionsAllotted: number;
    remainingSessions: number;
}

interface PurchasedPackageDetails {
    id: number;
    packageName: string;
    expiryDate: string;
    totalSessions: number;
    remainingSessions: number;
    status: string;
    user: UserSummary;
    sessionDetails: PurchasedSessionDetails[];
}

interface UserSearchResult {
    id: number;
    name: string;
    email: string;
}

interface CourseSearchResult {
    id: number;
    name: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
        toast.error("Authentication session expired. Please log in again.");
        return null;
    }
    return { 'Authorization': `Bearer ${token}` };
};

// --- Main Page Component ---
const AdminManageUserPackagesPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userSuggestions, setUserSuggestions] = useState<UserSearchResult[]>([]);
    const [userPackages, setUserPackages] = useState<PurchasedPackageDetails[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // State for the Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<PurchasedPackageDetails | null>(null);
    const [editFormData, setEditFormData] = useState({ 
        totalSessions: 0, 
        remainingSessions: 0, 
        status: '',
        expiryDate: '' 
    });
    const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
    const [sessionEditData, setSessionEditData] = useState({ totalSessionsAllotted: 0, remainingSessions: 0 });

    // State for the Add Course Modal
    const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
    const [allCourses, setAllCourses] = useState<CourseSearchResult[]>([]);
    const [courseToAdd, setCourseToAdd] = useState<{ courseId: number | null, sessions: number }>({ courseId: null, sessions: 1 });
    
    // State for the Schedule Modal
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [itemToSchedule, setItemToSchedule] = useState<{pkg: PurchasedPackageDetails, session: PurchasedSessionDetails} | null>(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('09:00'); // Default time

    const router = useRouter();

    // Fetch all courses once for the "Add Course" modal
    useEffect(() => {
        const fetchAllCourses = async () => {
            const headers = getAuthHeaders();
            if (!headers) return;
            try {
                const response = await axios.get(`${apiUrl}/api/admin/courses`, { headers });
                setAllCourses(response.data.data || []);
            } catch {
                toast.error("Could not load course list.");
            }
        };
        fetchAllCourses();
    }, []);

    // Debounced search for user autocomplete
    useEffect(() => {
        if (searchTerm.length < 2) {
            setUserSuggestions([]);
            return;
        }
        const handler = setTimeout(async () => {
            const headers = getAuthHeaders();
            if (!headers) return;
            try {
                const response = await axios.get(`${apiUrl}/api/admin/users/search`, {
                    headers,
                    params: { query: searchTerm }
                });
                setUserSuggestions(response.data);
            } catch {
                console.error("Failed to search for users.");
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const handleUserSelect = async (user: UserSearchResult) => {
        setSearchTerm(user.email);
        setUserSuggestions([]);
        setIsLoading(true);
        const headers = getAuthHeaders();
        if (!headers) { setIsLoading(false); router.push('/login'); return; }
        try {
            const response = await axios.get(`${apiUrl}/api/admin/user-packages/search`, {
                headers,
                params: { query: user.email }
            });
            setUserPackages(response.data);
            if (response.data.length === 0) {
                toast.info("No packages found for this user.");
            }
        } catch {
            toast.error("Failed to fetch user packages.");
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (pkg: PurchasedPackageDetails) => {
        setSelectedPackage(pkg);
        setEditFormData({
            totalSessions: pkg.totalSessions,
            remainingSessions: pkg.remainingSessions,
            status: pkg.status,
            expiryDate: moment(pkg.expiryDate).format('YYYY-MM-DD')
        });
        setIsEditModalOpen(true);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdatePackage = async () => {
        if (!selectedPackage) return;
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        try {
            await axios.put(`${apiUrl}/api/admin/user-packages/${selectedPackage.id}`, editFormData, { headers });
            toast.success("Package updated successfully!");
            setIsEditModalOpen(false);
            handleUserSelect(selectedPackage.user as any); // Refresh search results
        } catch {
            toast.error("Failed to update package.");
        }
    };
    
    const startEditingSession = (session: PurchasedSessionDetails) => {
        setEditingSessionId(session.id);
        setSessionEditData({ totalSessionsAllotted: session.totalSessionsAllotted, remainingSessions: session.remainingSessions });
    };

    const handleUpdateCourseSession = async (sessionId: number) => {
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        try {
            await axios.put(`${apiUrl}/api/admin/user-packages/sessions/${sessionId}`, sessionEditData, { headers });
            toast.success("Session updated successfully!");
            setEditingSessionId(null);
            handleUserSelect(selectedPackage!.user as any); // Refresh data
        } catch {
            toast.error("Failed to update session.");
        }
    };

    const handleAddCourseToPackage = async () => {
        if (!selectedPackage || !courseToAdd.courseId || courseToAdd.sessions < 1) {
            toast.error("Please select a course and enter a valid number of sessions.");
            return;
        }
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        try {
            await axios.post(`${apiUrl}/api/admin/user-packages/${selectedPackage.id}/add-course`, courseToAdd, { headers });
            toast.success("Course added to package successfully!");
            setIsAddCourseModalOpen(false);
            handleUserSelect(selectedPackage.user as any); // Refresh data
        } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || "Failed to schedule class.");
        }
         else {
            toast.error("An unknown error occurred.");
        }
    }
    };

    const openScheduleModal = (pkg: PurchasedPackageDetails, session: PurchasedSessionDetails) => {
        setItemToSchedule({ pkg, session });
        setIsEditModalOpen(false);
        setIsScheduleModalOpen(true);
        // Set default date to today
        setScheduleDate(moment().format('YYYY-MM-DD'));
    };
    
    const handleScheduleSubmit = async () => {
        if (!itemToSchedule || !scheduleDate || !scheduleTime) {
            toast.error("Please select a date and time.");
            return;
        }
        
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        
        const requestBody = {
            purchasedPackageId: itemToSchedule.pkg.id,
            courseId: itemToSchedule.session.courseId,
            bookedDates: [`${scheduleDate}T${scheduleTime}`],
            participants: [{ 
                firstName: itemToSchedule.pkg.user.firstName, 
                lastName: itemToSchedule.pkg.user.lastName,
            }]
        };

        try {
            await axios.post(`${apiUrl}/api/admin/user-packages/schedule-from-package`, requestBody, { headers });
            toast.success("Class scheduled successfully for the user!");
            setIsScheduleModalOpen(false);
            handleUserSelect(itemToSchedule.pkg.user as any); // Refresh data
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to schedule class.");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage User Packages</h1>
            
            <div className="relative mb-8 max-w-xl">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by user email or name..."
                    className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                {userSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg">
                        {userSuggestions.map(user => (
                            <li 
                                key={user.id} 
                                onClick={() => handleUserSelect(user)}
                                className="p-2 hover:bg-indigo-100 cursor-pointer"
                            >
                                {user.name} ({user.email})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isLoading ? <p>Loading...</p> : (
                <div className="space-y-6">
                    {userPackages.map(pkg => (
                        <div key={pkg.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <p className="font-bold text-xl text-indigo-700">{pkg.packageName}</p>
                                    <p className="text-md text-gray-700 mt-1">User: <span className="font-semibold">{pkg.user.firstName} {pkg.user.lastName}</span> ({pkg.user.email})</p>
                                    <p className="text-sm text-gray-500">Status: <span className="font-medium text-gray-800">{pkg.status}</span> | Expires: <span className="font-medium text-gray-800">{new Date(pkg.expiryDate).toLocaleDateString()}</span></p>
                                    <p className="text-sm text-gray-500">Sessions: <span className="font-medium text-gray-800">{pkg.remainingSessions} / {pkg.totalSessions}</span> remaining</p>
                                </div>
                                <button onClick={() => openEditModal(pkg)} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">Manage Package</button>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-semibold text-gray-800">Session Details:</h4>
                                <ul className="mt-2 space-y-2 text-sm">
                                    {pkg.sessionDetails.map((detail) => (
                                        <li key={detail.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                            <span>{detail.courseName}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono bg-gray-200 px-2 py-1 rounded">{detail.remainingSessions} / {detail.totalSessionsAllotted} left</span>
                                                <button onClick={() => { setSelectedPackage(pkg); startEditingSession(detail); }} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Edit</button>
                                                <button 
                                                    onClick={() => openScheduleModal(pkg, detail)}
                                                    disabled={detail.remainingSessions <= 0}
                                                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded disabled:bg-gray-200 disabled:text-gray-500"
                                                >
                                                    Schedule
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => { setSelectedPackage(pkg); setIsAddCourseModalOpen(true); }} className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                    + Add New Course to this Package
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Edit Package & Session Modal */}
            {isEditModalOpen && selectedPackage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Manage Package for {selectedPackage.user.firstName}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Total Sessions</label>
                                <input type="number" name="totalSessions" value={editFormData.totalSessions} onChange={handleEditFormChange} className="w-full p-2 border rounded-md mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Remaining Sessions</label>
                                <input type="number" name="remainingSessions" value={editFormData.remainingSessions} onChange={handleEditFormChange} className="w-full p-2 border rounded-md mt-1" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Expiry Date</label>
                                <input type="date" name="expiryDate" value={editFormData.expiryDate} onChange={handleEditFormChange} className="w-full p-2 border rounded-md mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Status</label>
                                <select name="status" value={editFormData.status} onChange={handleEditFormChange} className="w-full p-2 border rounded-md mt-1">
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="DEPLETED">DEPLETED</option>
                                    <option value="EXPIRED">EXPIRED</option>
                                </select>
                            </div>
                            <button onClick={handleUpdatePackage} className="w-full py-2 bg-blue-600 text-white rounded-md">Save Changes</button>
                            <div className="border-t my-4"></div>
                            <h4 className="font-semibold">Edit Course Sessions</h4>
                            <div className="space-y-2 mt-2">
                                {selectedPackage.sessionDetails.map((session) => (
                                    <div key={session.id} className="p-2 bg-gray-50 rounded-md">
                                        <p className="font-medium">{session.courseName}</p>
                                        {editingSessionId === session.id ? (
                                            <div className="flex items-center gap-2 mt-2">
                                                <input type="number" value={sessionEditData.remainingSessions} onChange={e => setSessionEditData(p => ({...p, remainingSessions: parseInt(e.target.value)}))} className="w-20 p-1 border rounded" />
                                                <span>/</span>
                                                <input type="number" value={sessionEditData.totalSessionsAllotted} onChange={e => setSessionEditData(p => ({...p, totalSessionsAllotted: parseInt(e.target.value)}))} className="w-20 p-1 border rounded" />
                                                <button onClick={() => handleUpdateCourseSession(session.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Save</button>
                                                <button onClick={() => setEditingSessionId(null)} className="text-xs bg-gray-200 px-2 py-1 rounded">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-sm">{session.remainingSessions} / {session.totalSessionsAllotted} sessions</p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => startEditingSession(session)} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Edit</button>
                                                    <button 
                                                        onClick={() => openScheduleModal(selectedPackage, session)}
                                                        disabled={session.remainingSessions <= 0}
                                                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded disabled:bg-gray-200 disabled:text-gray-500"
                                                    >
                                                        Schedule
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Course Modal */}
            {isAddCourseModalOpen && selectedPackage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">Add Course to {selectedPackage.packageName}</h3>
                        <div className="space-y-4">
                            <div>
                                <label>Select Course to Add</label>
                                <select onChange={e => setCourseToAdd(p => ({...p, courseId: parseInt(e.target.value)}))} className="w-full p-2 border rounded-md mt-1">
                                    <option>-- Select a Course --</option>
                                    {allCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label>Number of Sessions</label>
                                <input type="number" value={courseToAdd.sessions} onChange={e => setCourseToAdd(p => ({...p, sessions: parseInt(e.target.value)}))} min="1" className="w-full p-2 border rounded-md mt-1" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setIsAddCourseModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                            <button onClick={handleAddCourseToPackage} className="px-4 py-2 bg-green-600 text-white rounded-md">Add Course</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Schedule Modal */}
            {isScheduleModalOpen && itemToSchedule && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">Schedule {itemToSchedule.session.courseName} for {itemToSchedule.pkg.user.firstName}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Select Date</label>
                                <input 
                                    type="date" 
                                    value={scheduleDate} 
                                    onChange={e => setScheduleDate(e.target.value)} 
                                    min={moment().format('YYYY-MM-DD')} // Only allow future dates
                                    className="w-full p-2 border rounded-md mt-1" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Select Time</label>
                                <input 
                                    type="time" 
                                    value={scheduleTime} 
                                    onChange={e => setScheduleTime(e.target.value)} 
                                    className="w-full p-2 border rounded-md mt-1" 
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                            <button 
                                onClick={handleScheduleSubmit} 
                                disabled={!scheduleDate || !scheduleTime}
                                className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManageUserPackagesPage;