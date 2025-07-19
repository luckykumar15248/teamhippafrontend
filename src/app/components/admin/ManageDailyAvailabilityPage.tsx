'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  name: string;
}

interface CourseSchedule {
  schedule_id: number;
  scheduleName: string;
}

interface DailyAvailability {
    availabilityId: number;
    availableDate: string;
    maxSlots: number;
    bookedSlots: number;
    pricePerSlot: number;
    isBookingOpen: boolean;
    notesAdmin?: string;
}
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// --- API Helper ---
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
        toast.error("Authentication session expired. Please log in again.");
        return null;
    }
    return { 'Authorization': `Bearer ${token}` };
};

// --- SVG Icon Components ---
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

// CORRECTED: Timezone-safe date formatter helper function
const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Availability Modal Component ---
interface AvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<DailyAvailability>) => void;
    onDelete: (availabilityId: number) => void;
    dayData: { date: Date; availability: DailyAvailability | null };
    isSubmitting: boolean;
}

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({ isOpen, onClose, onSave, onDelete, dayData, isSubmitting }) => {
    const [maxSlots, setMaxSlots] = useState(dayData.availability?.maxSlots ?? 10);
    const [price, setPrice] = useState(dayData.availability?.pricePerSlot ?? 0);
    const [isBookingOpen, setIsBookingOpen] = useState(dayData.availability?.isBookingOpen ?? true);
    const [remarks, setRemarks] = useState(dayData.availability?.notesAdmin || '');
    
    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave({
            availabilityId: dayData.availability?.availabilityId,
            availableDate: toYYYYMMDD(dayData.date),
            maxSlots,
            pricePerSlot: price,
            isBookingOpen,
            notesAdmin: remarks,
        });
    };

    const handleDelete = () => {
        if (dayData.availability?.availabilityId) {
            onDelete(dayData.availability.availabilityId);
        } else {
            toast.warn("This date has no specific override to delete.");
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Manage Availability for {dayData.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div><label htmlFor="maxSlots" className="block text-sm font-medium text-gray-700">Max Slots</label><input type="number" id="maxSlots" value={maxSlots} onChange={e => setMaxSlots(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    <div><label htmlFor="price" className="block text-sm font-medium text-gray-700">Price per Slot (₹)</label><input type="number" id="price" value={price} onChange={e => setPrice(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Booking Status</label>
                        <button onClick={() => setIsBookingOpen(!isBookingOpen)} className={`mt-2 w-full flex items-center justify-center py-2 px-4 rounded-md text-white font-semibold transition-colors ${isBookingOpen ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            {isBookingOpen ? 'Open (Click to Close)' : 'Closed (Click to Open)'}
                        </button>
                    </div>
                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Admin Remarks</label>
                        <textarea id="remarks" value={remarks} onChange={e => setRemarks(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows={3} placeholder="Reason for closing, special notes, etc." />
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                    <button type="button" onClick={handleDelete} disabled={!dayData.availability?.availabilityId || isSubmitting} className="text-red-600 hover:text-red-800 disabled:text-gray-400 font-medium text-sm flex items-center gap-1">
                        <TrashIcon /> Delete Override
                    </button>
                    <div className="space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                        <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const ManageDailyAvailabilityPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
    const [availability, setAvailability] = useState<DailyAvailability[]>([]);
    
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<{ date: Date; availability: DailyAvailability | null } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const router = useRouter();
    
    useEffect(() => {
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        axios.get(`${apiUrl}/api/admin/courses`, { headers })
            .then(res => setCourses(res.data.data))
            .catch(() => toast.error("Failed to load courses."));
    }, [router]);

    useEffect(() => {
        if (!selectedCourseId) {
            setSchedules([]);
            setSelectedScheduleId(null);
            return;
        }
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        axios.get(`${apiUrl}/api/admin/course-schedules/course/${selectedCourseId}`, { headers })
            .then(res => {
                setSchedules(res.data);
                if (res.data.length > 0) {
                    setSelectedScheduleId(res.data[0].schedule_id);
                } else {
                    setSelectedScheduleId(null);
                }
            })
            .catch(() => toast.error("Failed to load schedules for this course."));
    }, [selectedCourseId, router]);

    const fetchAvailability = useCallback(async () => {
        if (!selectedScheduleId) {
            setAvailability([]);
            return;
        }
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const response = await axios.get(`${apiUrl}/api/admin/daily-availability/schedule/${selectedScheduleId}`, {
                params: { year, month },
                headers
            });
            setAvailability(response.data);
        } catch (error) {
            toast.error("Failed to load availability data.");
            console.error(error);
        } 
    }, [selectedScheduleId, currentDate, router]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const daysArray: (Date | null)[] = [];
        for (let i = 0; i < firstDayOfMonth; i++) { daysArray.push(null); }
        for (let i = 1; i <= daysInMonth; i++) { daysArray.push(new Date(year, month, i)); }
        return daysArray;
    }, [currentDate]);
    
    const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

    const handleDayClick = (day: Date) => {
        const availabilityForDay = availability.find(a => a.availableDate === toYYYYMMDD(day));
        setSelectedDay({ date: day, availability: availabilityForDay || null });
        setIsModalOpen(true);
    };

    const handleSaveAvailability = async (data: Partial<DailyAvailability>) => {
        if (!selectedScheduleId || !selectedCourseId) return;
        const headers = getAuthHeaders();
        if (!headers) return;
        
        setIsSubmitting(true);
        try {
            const selectedSchedule = schedules.find(s => s.schedule_id === selectedScheduleId);
            const payload = { 
                ...data, 
                scheduleId: selectedScheduleId, 
                courseId: selectedCourseId,
                courseName: courses.find(c => c.id === selectedCourseId)?.name || '',
                scheduleName: selectedSchedule?.scheduleName || ''
            };
            
            await axios.post(`${apiUrl}/api/admin/daily-availability`, payload, { headers });
            toast.success("Availability updated successfully!");
            fetchAvailability();
        } catch (error) {
            toast.error("Failed to save changes.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
            setIsModalOpen(false);
        }
    };

    const handleDeleteAvailability = async (availabilityId: number) => {
        if (window.confirm("Are you sure you want to delete this specific daily setting? Availability will revert to the general schedule rules.")) {
            const headers = getAuthHeaders();
            if (!headers) return;

            setIsSubmitting(true);
            try {
                await axios.delete(`${apiUrl}/api/admin/daily-availability/${availabilityId}`, { headers });
                toast.success("Daily override deleted.");
                fetchAvailability();
            } catch (error) {
                toast.error("Failed to delete override.");
                console.error(error);
            } finally {
                setIsSubmitting(false);
                setIsModalOpen(false);
            }
        }
    };
    
    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Daily Availability Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
                <div>
                    <label htmlFor="courseSelector" className="block text-sm font-medium text-gray-700">1. Select Course</label>
                    <select id="courseSelector" value={selectedCourseId || ''} onChange={e => setSelectedCourseId(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">-- Select Course --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="scheduleSelector" className="block text-sm font-medium text-gray-700">2. Select Schedule</label>
                    <select id="scheduleSelector" value={selectedScheduleId || ''} onChange={e => setSelectedScheduleId(Number(e.target.value))} disabled={!selectedCourseId} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100">
                        <option value="">-- Select Schedule --</option>
                        {schedules.map(s => <option key={s.schedule_id} value={s.schedule_id}>{s.scheduleName}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon /></button>
                    <h3 className="text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                    {daysInMonth.map((day, index) => {
                        if (!day) return <div key={`empty-${index}`} className="border rounded-md h-24"></div>;
                        const dayString = toYYYYMMDD(day);
                        const availabilityData = availability.find(a => a.availableDate === dayString);
                        let dayClass = 'bg-gray-100 text-gray-400 cursor-not-allowed';
                        let remarks = '';
                        if (availabilityData) {
                            if (!availabilityData.isBookingOpen) {
                                dayClass = 'bg-red-200 hover:bg-red-300 cursor-pointer';
                                remarks = availabilityData.notesAdmin || 'Closed';
                            } else {
                                dayClass = availabilityData.bookedSlots >= availabilityData.maxSlots 
                                    ? 'bg-orange-200 hover:bg-orange-300 cursor-pointer' 
                                    : 'bg-green-200 hover:bg-green-300 cursor-pointer';
                            }
                        }
                        return (
                            <div key={dayString} onClick={() => handleDayClick(day)} className={`p-2 border rounded-md h-24 flex flex-col justify-between text-sm transition-colors ${dayClass}`}>
                                <span className="font-semibold self-start">{day.getDate()}</span>
                                {availabilityData && (
                                    <div className="w-full flex justify-between items-end text-xs">
                                        <span>{availabilityData.bookedSlots} / {availabilityData.maxSlots}</span>
                                        {remarks && (
                                            <div className="group relative">
                                                <InfoIcon />
                                                <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">{remarks}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            {isModalOpen && selectedDay && (
                <AvailabilityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAvailability} onDelete={handleDeleteAvailability} dayData={selectedDay} isSubmitting={isSubmitting} />
            )}
        </div>
    );
};

export default ManageDailyAvailabilityPage;
