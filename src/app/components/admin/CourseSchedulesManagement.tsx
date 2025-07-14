'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from "axios";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// SVG Icon Components
const PlusIcon = ({ className = "mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// --- Type Definitions ---
interface Sport {
    id: number;
    name: string;
}

interface Course {
    id: number;
    name: string;
    sportId: number;
}

interface CourseSchedule {
    schedule_id: number;
    course_id: number;
    scheduleName: string;
    start_date: string;
    end_date: string;
    instructor_name: string | null;
    location: string | null;
    description_override: string | null;
    isActive: boolean; // This matches the backend DTO now
    booking_cutoff_hours: number | null;
    max_bookings_per_day: number | null;
    max_total_bookings: number | null;
    created_at: string;
    updated_at: string;
}

type ScheduleFormData = Omit<CourseSchedule, 'schedule_id' | 'created_at' | 'updated_at'> & { schedule_id?: number };

// --- Component Props ---
interface ScheduleListProps {
    schedules: CourseSchedule[];
    onEdit: (schedule: CourseSchedule) => void;
    onDelete: (schedule: CourseSchedule) => void;
}

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (scheduleData: ScheduleFormData) => void;
    schedule: CourseSchedule | null;
    courses: Course[];
    sports: Sport[];
}

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    schedule: CourseSchedule | null;
}

// --- Main Page Component ---
const CourseSchedulePage = () => {
    const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState<CourseSchedule | null>(null);
    const [scheduleToDelete, setScheduleToDelete] = useState<CourseSchedule | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        
        try {
            // Public endpoints don't require a token
            const [schedulesRes, coursesRes, sportsRes] = await Promise.all([
                axios.get(`${apiUrl}api/admin/course-schedules`),
                axios.get(`${apiUrl}api/public_api/courses`),
                axios.get<Sport[]>(`${apiUrl}api/admin/sports`)
            ]);

           // if (!schedulesRes.ok) throw new Error('Failed to fetch schedules.');
            
           // const schedulesData = await schedulesRes.json();
            setSchedules(schedulesRes.data || []);
            setCourses(coursesRes.data || []);
            setSports(sportsRes.data || []);

        } catch (error) {
            console.error("Failed to fetch data:", error);
            setApiError("Could not load data from the server. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddSchedule = useCallback(() => {
        setCurrentSchedule(null);
        setIsModalOpen(true);
    }, []);

    const handleEditSchedule = useCallback((schedule: CourseSchedule) => {
        setCurrentSchedule(schedule);
        setIsModalOpen(true);
    }, []);

    const openDeleteModal = useCallback((schedule: CourseSchedule) => {
        setScheduleToDelete(schedule);
        setIsDeleteModalOpen(true);
    }, []);
    
    const closeDeleteModal = useCallback(() => {
        setScheduleToDelete(null);
        setIsDeleteModalOpen(false);
    }, []);

    const handleDeleteSchedule = useCallback(async () => {
        if (!scheduleToDelete) return;
        
        // --- UPDATED: Added Authorization header ---
        const token = localStorage.getItem('authToken');
        if (!token) {
            setApiError("Authentication error. Please log in again.");
            closeDeleteModal();
            return;
        }

        try {
            const response = await fetch(`${apiUrl}api/admin/course-schedules/${scheduleToDelete.schedule_id}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                 if (response.status === 401) {
                    setApiError("Your session has expired. Please log in again.");
                } else {
                    throw new Error('Failed to delete schedule.');
                }
            } else {
                setSchedules(prev => prev.filter(s => s.schedule_id !== scheduleToDelete.schedule_id));
            }

        } catch(error) {
            console.error("Delete failed:", error);
            setApiError("Failed to delete schedule. Please try again.");
        } finally {
            closeDeleteModal();
        }
    }, [scheduleToDelete, closeDeleteModal]);

    const handleSaveSchedule = useCallback(async (scheduleData: ScheduleFormData) => {
        const isUpdating = !!scheduleData.schedule_id;
        const url = isUpdating ? `${apiUrl}api/admin/course-schedules/${scheduleData.schedule_id}` : `${apiUrl}api/admin/course-schedules`;
        const method = isUpdating ? 'PUT' : 'POST';
        
        // --- UPDATED: Added Authorization header ---
        const token = localStorage.getItem('authToken');
        if (!token) {
            setApiError("Authentication error. Please log in again.");
            return;
        }

        console.log("form data is-------------", scheduleData);
        try {
            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(scheduleData),
            });

            if (!response.ok) {
                 if (response.status === 401) {
                    setApiError("Your session has expired. Please log in again.");
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to save schedule.');
                }
            } else {
                 // Refetch data to ensure the list is up-to-date
                fetchData();
                setIsModalOpen(false);
            }

        } catch(error) {
            console.error("Save failed:", error);
            if (!apiError) { // Don't overwrite a specific auth error
                setApiError("Failed to save schedule. Please try again.");
            }
        }
    }, [fetchData, apiError]);

    const memoizedScheduleList = useMemo(() => (
        <ScheduleList 
            schedules={schedules} 
            onEdit={handleEditSchedule} 
            onDelete={openDeleteModal} 
        />
    ), [schedules, handleEditSchedule, openDeleteModal]);

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
                        Manage Course Schedules
                    </h1>
                    <button 
                        onClick={handleAddSchedule} 
                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        aria-label="Add new schedule"
                    >
                        <PlusIcon />
                        Add New Schedule
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2">Loading schedules...</p>
                    </div>
                ) : apiError ? (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{apiError}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    memoizedScheduleList
                )}
            </div>

            <ScheduleModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveSchedule}
                schedule={currentSchedule}
                courses={courses}
                sports={sports}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteSchedule}
                schedule={scheduleToDelete}
            />
        </div>
    );
};

const ScheduleList = React.memo<ScheduleListProps>(({ schedules, onEdit, onDelete }) => {
    if (schedules.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">No schedules found. Create your first schedule to get started.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Schedule Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Instructor
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Range
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {schedules.map(schedule => (
                            <tr key={schedule.schedule_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{schedule.scheduleName}</div>
                                    <div className="text-sm text-gray-500">Course ID: {schedule.course_id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {schedule.instructor_name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(schedule.start_date).toLocaleDateString()} to {new Date(schedule.end_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {schedule.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button 
                                        onClick={() => onEdit(schedule)} 
                                        className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                                        aria-label={`Edit ${schedule.scheduleName}`}
                                    >
                                        <EditIcon />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(schedule)} 
                                        className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                        aria-label={`Delete ${schedule.scheduleName}`}
                                    >
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSave, schedule, courses, sports }) => {
    const getInitialData = (): ScheduleFormData => ({
        course_id: 0,
        scheduleName: '',
        start_date: '',
        end_date: '',
        instructor_name: '',
        location: '',
        description_override: '',
        isActive: true,
        booking_cutoff_hours: null,
        max_bookings_per_day: null,
        max_total_bookings: null,
    });
    
    const [formData, setFormData] = useState<ScheduleFormData>(getInitialData);
    const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const filteredCourses = useMemo(() => {
        return selectedSportId ? courses.filter(c => c.sportId === selectedSportId) : [];
    }, [selectedSportId, courses]);

    useEffect(() => {
        if (!isOpen) return;

        if (schedule) {
            const relatedCourse = courses.find(c => c.id === schedule.course_id);
            if (relatedCourse) {
                setSelectedSportId(relatedCourse.sportId);
            }
            setFormData(schedule);
        } else {
            setFormData(getInitialData());
            setSelectedSportId(null);
        }
        setValidationError(null);
    }, [schedule, isOpen, courses]);

    const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sportId = Number(e.target.value);
        setSelectedSportId(sportId);
        setFormData(prev => ({ ...prev, course_id: 0 }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => {
            if (type === 'checkbox') {
                const checked = (e.target as HTMLInputElement).checked;
                return { ...prev, [name]: checked };
            }
            if (name === 'course_id' || type === 'number') {
                return { ...prev, [name]: value === '' ? null : Number(value) };
            } 
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        if (!formData.scheduleName || !formData.start_date || !formData.end_date || formData.course_id === 0) {
            setValidationError("Please fill all required fields, including selecting a course.");
            return;
        }

        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setValidationError("End date must be after start date.");
            return;
        }

        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {schedule ? 'Edit Schedule' : 'Add New Schedule'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-800 focus:outline-none"
                        aria-label="Close modal"
                    >
                        <XIcon />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sport Selection */}
                        <div className="md:col-span-2">
                            <label htmlFor="sport_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Sport <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="sport_id"
                                value={selectedSportId ?? ''}
                                onChange={handleSportChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                aria-required="true"
                            >
                                <option value="" disabled>Select a sport...</option>
                                {sports.map(sport => (
                                    <option key={sport.id} value={sport.id}>
                                        {sport.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Course Selection */}
                        <div className="md:col-span-2">
                            <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Course <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="course_id"
                                id="course_id"
                                value={formData.course_id}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                required
                                disabled={!selectedSportId}
                                aria-required="true"
                            >
                                <option value="0" disabled>Select a course...</option>
                                {filteredCourses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Schedule Name */}
                        <div className="md:col-span-2">
                            <label htmlFor="scheduleName" className="block text-sm font-medium text-gray-700 mb-1">
                                Schedule Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="scheduleName"
                                id="scheduleName"
                                value={formData.scheduleName}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                aria-required="true"
                            />
                        </div>

                        {/* Instructor and Location */}
                        <div>
                            <label htmlFor="instructor_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Instructor Name
                            </label>
                            <input
                                type="text"
                                name="instructor_name"
                                id="instructor_name"
                                value={formData.instructor_name ?? ''}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                value={formData.location ?? ''}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Date Range */}
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                id="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                aria-required="true"
                            />
                        </div>
                        <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="end_date"
                                id="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                aria-required="true"
                                min={formData.start_date}
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label htmlFor="description_override" className="block text-sm font-medium text-gray-700 mb-1">
                                Description Override
                            </label>
                            <textarea
                                name="description_override"
                                id="description_override"
                                rows={3}
                                value={formData.description_override ?? ''}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Booking Limits */}
                        <div>
                            <label htmlFor="max_bookings_per_day" className="block text-sm font-medium text-gray-700 mb-1">
                                Max Bookings Per Day
                            </label>
                            <input
                                type="number"
                                name="max_bookings_per_day"
                                id="max_bookings_per_day"
                                min="0"
                                value={formData.max_bookings_per_day ?? ''}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="max_total_bookings" className="block text-sm font-medium text-gray-700 mb-1">
                                Max Total Bookings
                            </label>
                            <input
                                type="number"
                                name="max_total_bookings"
                                id="max_total_bookings"
                                min="0"
                                value={formData.max_total_bookings ?? ''}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="booking_cutoff_hours" className="block text-sm font-medium text-gray-700 mb-1">
                                Booking Cutoff (Hours)
                            </label>
                            <input
                                type="number"
                                name="booking_cutoff_hours"
                                id="booking_cutoff_hours"
                                min="0"
                                value={formData.booking_cutoff_hours ?? ''}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-900">
                                Is Active
                            </label>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="mt-8 pt-5 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3">
                        {validationError && (
                            <div className="mr-auto text-sm text-red-600 flex items-start">
                                <svg className="h-4 w-4 mt-0.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {validationError}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Save Schedule
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, schedule }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Schedule</h3>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete the schedule <span className="font-semibold">"{schedule?.scheduleName}"</span>? 
                        This action cannot be undone.
                    </p>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Delete Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseSchedulePage;
