'use client';

import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';

// --- SVG Icons ---
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const ChevronDownIcon = ({ className = "h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m0 0v10l8 4" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

// --- Type Definitions ---
interface ParticipantDetails {
    firstName: string;
    lastName: string;
}

interface PackageCourse {
    id: number;
    name: string;
}

interface UserBookingDetails {
    bookingId: number;
    bookingReference: string;
    bookingType: 'COURSE' | 'PACKAGE';
    bookingStatus: string;
    finalAmount: number;
    currency: string;
    createdAt: string;
    participants: ParticipantDetails[];
    courseName?: string | null;
    bookedDates?: string[] | null;
    packageName?: string | null;
    includedCourses?: PackageCourse[] | null;
}

interface CourseSchedule {
    schedule_id: number;
    scheduleName: string;
}

interface PurchasedPackage {
    id: number;
    masterPackageId: number; // Required for the renewal redirect
    packageName: string;
    expiryDate: string;
    totalSessions: number;
    remainingSessions: number;
    status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
    sessionDetails: {
        courseName: string;
        totalSessionsAllotted: number;
        remainingSessions: number;
        courseId: number;
    }[];
}

interface Notification {
    id: number;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
}

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roleName: 'USER' | 'ADMIN' | 'VISITOR_REGISTERED';
}

interface AvailabilitySlot {
    date: string;
    availableSlots: number;
    price: number;
    isBookingOpen: boolean;
}

// --- Child Components ---
const BookingCard: React.FC<{ booking: UserBookingDetails }> = ({ booking }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isPackage = booking.bookingType === 'PACKAGE';
    const title = isPackage ? booking.packageName : booking.courseName;

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-800';
            case 'Completed': return 'bg-blue-100 text-blue-800';
            case 'Rescheduled': return 'bg-orange-100 text-orange-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getTypeClass = (type: string) => {
        return type === 'PACKAGE' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800';
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 text-left focus:outline-none hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                    <div className="flex-grow">
                        <p className="font-semibold text-indigo-600">{title}</p>
                        <p className="text-sm text-gray-500">Ref: {booking.bookingReference}</p>
                        <p className="text-xs text-gray-400 mt-1">Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                        <div className={`mb-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeClass(booking.bookingType)}`}>
                            {booking.bookingType}
                        </div>
                        <p className="font-semibold text-gray-900">${booking.finalAmount.toFixed(2)}</p>
                        <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(booking.bookingStatus)}`}>
                            {booking.bookingStatus}
                        </span>
                    </div>
                    <div className="pl-4">
                        <ChevronDownIcon className={`h-6 w-6 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Participants ({booking.participants.length})</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {booking.participants.map((p, i) => (
                                    <li key={i}>{p.firstName} {p.lastName}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            {isPackage ? (
                                <>
                                    <h4 className="font-semibold text-gray-700 mb-2">Included Courses</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        {booking.includedCourses?.map((course, index) => (
                                            <li key={`${course.id}-${index}`}>{course.name}</li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <>
                                    <h4 className="font-semibold text-gray-700 mb-2">Booked Dates</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        {booking.bookedDates?.map(date => (
                                            <li key={date}>{new Date(date + 'T00:00:00').toLocaleDateString()}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PackageCard: React.FC<{
    pkg: PurchasedPackage,
    onSchedule: (pkg: PurchasedPackage) => void,
    onRenew: (pkg: PurchasedPackage, packageId: number) => void,
    isHistory?: boolean
}> = ({ pkg, onSchedule, onRenew, isHistory = false }) => {
    const progress = pkg.totalSessions > 0 ? (pkg.remainingSessions / pkg.totalSessions) * 100 : 0;
    const isExpired = new Date(pkg.expiryDate) < new Date(new Date().setHours(0,0,0,0));
    const isDepleted = pkg.remainingSessions === 0;

    if (isHistory) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-gray-700">{pkg.packageName}</p>
                        <p className="text-sm text-gray-500">
                            {pkg.status === 'EXPIRED' ? `Expired on: ${new Date(pkg.expiryDate).toLocaleDateString()}` : 'Sessions Depleted'}
                        </p>
                    </div>
                    <button
                        onClick={() => onRenew(pkg, pkg.masterPackageId)}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isExpired}
                    >
                        Buy Again
                    </button>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <ul className="text-xs text-gray-600 space-y-1">
                        {pkg.sessionDetails.map(detail => (
                            <li key={detail.courseId} className="flex justify-between">
                                <span>{detail.courseName}</span>
                                <span>{detail.totalSessionsAllotted - detail.remainingSessions} / {detail.totalSessionsAllotted} used</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
   
    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
                <h3 className="font-bold text-lg text-indigo-700">{pkg.packageName}</h3>
                <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${pkg.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{pkg.status}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Expires on:</span>
                        <span className="font-semibold text-gray-800">{new Date(pkg.expiryDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Total Sessions Remaining:</span>
                            <span className="font-semibold text-gray-800">{pkg.remainingSessions} / {pkg.totalSessions}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <div className="pt-2">
                        <p className="font-semibold text-gray-600 mb-1">Session Details:</p>
                        <ul className="text-xs text-gray-600 space-y-1 pl-2">
                             {pkg.sessionDetails.map(detail => (
                                <li key={detail.courseId} className="flex justify-between">
                                    <span>- {detail.courseName}</span>
                                    <span>{detail.remainingSessions} / {detail.totalSessionsAllotted} remaining</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
           
            <div className="w-full text-white py-2.5 rounded-b-lg text-center font-semibold">
                {isDepleted ? (
                    <button
                        onClick={() => onRenew(pkg, pkg.masterPackageId)}
                        className="w-full bg-green-600 hover:bg-green-700 transition-colors"
                    >
                        Renew Package
                    </button>
                ) : (
                    <button
                        onClick={() => onSchedule(pkg)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        Schedule a Class
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---
const UserDashboardPage: React.FC = () => {
    const { setIsLoggedIn } = useContext(AuthContext);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'packages'>('packages');
    const [allUpcomingBookings, setAllUpcomingBookings] = useState<UserBookingDetails[]>([]);
    const [allPastBookings, setAllPastBookings] = useState<UserBookingDetails[]>([]);
    const [packages, setPackages] = useState<PurchasedPackage[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', bookingType: '' });
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 5;
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<PurchasedPackage | null>(null);
    const [courseToSchedule, setCourseToSchedule] = useState<number | null>(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    const [availableDates, setAvailableDates] = useState<AvailabilitySlot[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isCalendarLoading, setIsCalendarLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [courseSchedules, setCourseSchedules] = useState<Record<number, CourseSchedule[]>>({});
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://teamhippa.com';

    const categorizedPackages = useMemo(() => {
        if (!packages) return { active: [], past: [] };

        const active: PurchasedPackage[] = [];
        const past: PurchasedPackage[] = [];
        const today = new Date(new Date().setHours(0,0,0,0));

        for (const pkg of packages) {
            const isExpired = new Date(pkg.expiryDate) < today;
            const hasSessions = pkg.remainingSessions > 0;

            if (!isExpired && hasSessions) {
                active.push(pkg);
            } else {
                past.push(pkg);
            }
        }
       
        active.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        past.sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime());

        return { active, past };
    }, [packages]);

    const getAuthHeaders = () => {
        if (typeof window === 'undefined') return null;
        const token = localStorage.getItem('authToken');
        if (!token) return null;
        return { 'Authorization': `Bearer ${token}` };
    };

    const fetchData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
       
        setIsLoading(true);
        try {
            const [profileRes, upcomingRes, pastRes, packagesRes, notificationsRes] = await Promise.all([
                axios.get(`${apiUrl}/api/auth/me`, { headers }),
                axios.get(`${apiUrl}/api/users/bookings/upcoming`, { headers }),
                axios.get(`${apiUrl}/api/users/bookings/past`, { headers }),
                axios.get(`${apiUrl}/api/users/my-all-packages`, { headers }),
                axios.get(`${apiUrl}/api/users/notifications`, { headers })
            ]);
           
            setUser(profileRes.data);
            setAllUpcomingBookings(upcomingRes.data || []);
            setAllPastBookings(pastRes.data || []);
            setPackages(packagesRes.data || []);
            setNotifications(notificationsRes.data || []);
        } catch {
            toast.error("Could not load all dashboard data.");
        } finally {
            setIsLoading(false);
        }
    }, [router, apiUrl]);

    useEffect(() => { fetchData(); }, [fetchData]);
   
    const fetchCourseSchedules = useCallback(async (courseId: number) => {
        try {
            const response = await axios.get(`${apiUrl}/api/public/course-schedules/course/${courseId}`);
            return response.data || [];
        } catch (error) {
            toast.error("Could not load schedules for this course.");
            return [];
        }
    }, [apiUrl]);

    const handleMarkNotificationAsRead = async (id: number) => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            await axios.post(`${apiUrl}/api/users/notifications/${id}/mark-read`, {}, { headers });
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Notification dismissed.");
        } catch {
            toast.error("Could not dismiss notification.");
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCurrentPage(0);
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilters = () => {
        setCurrentPage(0);
        setFilters({ startDate: '', endDate: '', bookingType: '' });
    };

    const filteredBookings = useMemo(() => {
        const sourceBookings = activeTab === 'upcoming' ? allUpcomingBookings : allPastBookings;
        return sourceBookings.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;
            if (startDate && bookingDate < startDate) return false;
            if (endDate) {
                endDate.setHours(23, 59, 59, 999);
                if (bookingDate > endDate) return false;
            }
            if (filters.bookingType && booking.bookingType !== filters.bookingType) return false;
            return true;
        });
    }, [activeTab, allUpcomingBookings, allPastBookings, filters]);

    const paginatedBookings = useMemo(() => {
        const startIndex = currentPage * ITEMS_PER_PAGE;
        return filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredBookings]);

    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

    const handleTabChange = (tab: 'upcoming' | 'past' | 'packages') => {
        setCurrentPage(0);
        setActiveTab(tab);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        toast.success("You have been logged out.");
        if (setIsLoggedIn) {
            setIsLoggedIn(false);
        }
        router.push("/login");
    };

    const openScheduleModal = (pkg: PurchasedPackage) => {
        setSelectedPackage(pkg);
        setCourseToSchedule(null);
        setSelectedScheduleId(null);
        setAvailableDates([]);
        setSelectedDate(null);
        setIsScheduleModalOpen(true);
    };

    const handleCourseSelectForScheduling = async (courseIdStr: string) => {
        const courseId = parseInt(courseIdStr);
        if (isNaN(courseId)) {
            setCourseToSchedule(null);
            setSelectedScheduleId(null);
            setAvailableDates([]);
            return;
        }
        setCourseToSchedule(courseId);
       
        if (!courseSchedules[courseId]) {
            const schedules = await fetchCourseSchedules(courseId);
            setCourseSchedules(prev => ({ ...prev, [courseId]: schedules }));
            if (schedules.length > 0) {
                setSelectedScheduleId(schedules[0].schedule_id);
                await fetchAvailableDates(schedules[0].schedule_id);
            } else {
                toast.error("No schedules available for this course.");
                setSelectedScheduleId(null);
                setAvailableDates([]);
            }
        } else {
            if (courseSchedules[courseId].length > 0) {
                setSelectedScheduleId(courseSchedules[courseId][0].schedule_id);
                await fetchAvailableDates(courseSchedules[courseId][0].schedule_id);
            } else {
                toast.error("No schedules available for this course.");
                setSelectedScheduleId(null);
                setAvailableDates([]);
            }
        }
    };

    const fetchAvailableDates = async (scheduleId: number) => {
        if (!scheduleId) return;
        setIsCalendarLoading(true);
        try {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;
            const response = await axios.get(`${apiUrl}/api/public/booking-data/availability/schedule/${scheduleId}`, {
                params: { year, month }
            });
            setAvailableDates(response.data || []);
        } catch {
            toast.error("Could not load available dates for this schedule.");
            setAvailableDates([]);
        } finally {
            setIsCalendarLoading(false);
        }
    };

    const handleScheduleSubmit = async () => {
        if (!selectedPackage || !courseToSchedule || !selectedDate || !selectedScheduleId) {
            toast.error("Please select a course and a date.");
            return;
        }
       
        const headers = getAuthHeaders();
        if (!headers) return;

        const requestBody = {
            purchasedPackageId: selectedPackage.id,
            courseId: courseToSchedule,
            scheduleId: selectedScheduleId,
            bookedDates: [selectedDate],
            participants: [{ firstName: user?.firstName, lastName: user?.lastName }]
        };

        try {
            await axios.post(`${apiUrl}/api/users/schedule-from-package`, requestBody, { headers });
            toast.success("Class scheduled successfully!");
            setIsScheduleModalOpen(false);
            fetchData();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to schedule class.");
            } else {
                toast.error("An unknown error occurred.");
            }
        }
    };

    const handleRenewPackage = (pkg: PurchasedPackage, packageId: number) => {
        const actionText = pkg.status === 'DEPLETED' ? 'renew' : 'buy again';
        const isConfirmed = window.confirm(`Are you sure you want to ${actionText} the "${pkg.packageName}" package?`);
       
        if (isConfirmed) {
            if (!packageId) {
                toast.error("Cannot find original package product. Please contact support.");
                return;
            }
            toast.success("Redirecting to booking page...");
            router.push(`/booking/package-booking/${packageId}`);
        }
    };
   
    const toggleHistory = (packageName: string) => {
        setIsHistoryVisible(prev => !prev);
    };

    const calendarDays = useMemo(() => {
        const days: (Date | null)[] = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
       
        for (let i = 0; i < firstDay; i++) { days.push(null); }
        for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(year, month, i)); }
       
        return days;
    }, [currentMonth]);

    const handlePrevMonth = () => {
        const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        setCurrentMonth(prevMonth);
        if (selectedScheduleId) {
            fetchAvailableDates(selectedScheduleId);
        }
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        setCurrentMonth(nextMonth);
        if (selectedScheduleId) {
            fetchAvailableDates(selectedScheduleId);
        }
    };

    if (isLoading || !user) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>;
    }
   
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900">Welcome, {user.firstName}!</h1>
                    <p className="mt-2 text-lg text-gray-600">Here&apos;s your personal dashboard.</p>
                </header>

                {notifications.length > 0 && (
                    <div className="mb-8 space-y-4">
                        {notifications.map(notif => (
                            <div key={notif.id} className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow" role="alert">
                                <div className="flex">
                                    <div className="py-1"><svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/></svg></div>
                                    <div>
                                        <p className="font-bold">{notif.title}</p>
                                        <p className="text-sm">{notif.message}</p>
                                    </div>
                                    <button onClick={() => handleMarkNotificationAsRead(notif.id)} className="ml-auto text-sm font-semibold">Dismiss</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-4 space-y-2 sticky top-24">
                            <button onClick={() => handleTabChange('upcoming')} className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-md transition-colors ${activeTab === 'upcoming' || activeTab === 'past' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <CalendarIcon /> My Bookings
                            </button>
                            <button onClick={() => handleTabChange('packages')} className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-md transition-colors ${activeTab === 'packages' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <PackageIcon /> My Packages
                            </button>
                            <div className="border-t pt-2 mt-2">
                                <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                    <LogoutIcon /> Logout
                                </button>
                            </div>
                        </div>
                    </aside>
                    <main className="lg:col-span-3">
                        <div className="mb-6 border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button onClick={() => handleTabChange('upcoming')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'upcoming' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Upcoming</button>
                                <button onClick={() => handleTabChange('past')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'past' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Past</button>
                                <button onClick={() => handleTabChange('packages')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'packages' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>My Packages</button>
                            </nav>
                        </div>
                       
                        {(activeTab === 'upcoming' || activeTab === 'past') && (
                            <>
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                        <div>
                                            <label className="text-xs text-gray-500">Start Date</label>
                                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">End Date</label>
                                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md" />
                                        </div>
                                        <select name="bookingType" value={filters.bookingType} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md">
                                            <option value="">All Types</option>
                                            <option value="COURSE">Course</option>
                                            <option value="PACKAGE">Package</option>
                                        </select>
                                        <button onClick={resetFilters} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium col-span-full md:col-span-1">Reset Filters</button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {isLoading ? <p>Loading bookings...</p> : paginatedBookings.length > 0 ? (
                                        paginatedBookings.map(booking => <BookingCard key={booking.bookingId} booking={booking} />)
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No bookings found for the selected filters.</p>
                                    )}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-6 flex items-center justify-between">
                                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Previous</button>
                                        <span className="text-sm text-gray-700">Page {currentPage + 1} of {totalPages}</span>
                                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Next</button>
                                    </div>
                                )}
                            </>
                        )}
                       
                        {activeTab === 'packages' && (
                             <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Packages</h2>
                                <div className="space-y-4">
                                    {categorizedPackages.active.length > 0 ? (
                                        categorizedPackages.active.map(pkg => (
                                            <PackageCard
                                                key={pkg.id}
                                                pkg={pkg}
                                                onSchedule={openScheduleModal}
                                                onRenew={handleRenewPackage}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">You have no active packages to use.</p>
                                    )}
                                </div>

                                {categorizedPackages.past.length > 0 && (
                                    <div className="mt-12">
                                        <div className="border-t pt-8">
                                            <button onClick={() => setIsHistoryVisible(prev => !prev)} className="text-lg font-semibold text-indigo-600 flex items-center w-full justify-between">
                                                <span>Purchase History</span>
                                                <ChevronDownIcon className={`h-5 w-5 transform transition-transform ${isHistoryVisible ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isHistoryVisible && (
                                                <div className="mt-4 space-y-3">
                                                    {categorizedPackages.past.map(histPkg => (
                                                        <PackageCard
                                                            key={histPkg.id}
                                                            pkg={histPkg}
                                                            onRenew={handleRenewPackage}
                                                            onSchedule={openScheduleModal}
                                                            isHistory={true}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {isScheduleModalOpen && selectedPackage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <h3 className="text-xl font-bold mb-4">Schedule a Class from {selectedPackage.packageName}</h3>
                        <div className="space-y-4">
                            <div>
                                <label>Select a Course:</label>
                                <select
                                    onChange={(e) => handleCourseSelectForScheduling(e.target.value)}
                                    className="w-full p-2 border rounded-md mt-1"
                                >
                                    <option value="">-- Select a course --</option>
                                    {selectedPackage.sessionDetails
                                        .filter(detail => detail.remainingSessions > 0)
                                        .map(detail => (
                                            <option key={detail.courseId} value={detail.courseId}>
                                                {detail.courseName} ({detail.remainingSessions} sessions left)
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                           
                            {courseToSchedule && courseSchedules[courseToSchedule]?.length > 0 && (
                                <div>
                                    <label>Select a Schedule:</label>
                                    <select
                                        value={selectedScheduleId || ''}
                                        onChange={(e) => {
                                            const scheduleId = Number(e.target.value);
                                            setSelectedScheduleId(scheduleId);
                                            fetchAvailableDates(scheduleId);
                                        }}
                                        className="w-full p-2 border rounded-md mt-1"
                                    >
                                        {courseSchedules[courseToSchedule].map(schedule => (
                                            <option key={schedule.schedule_id} value={schedule.schedule_id}>
                                                {schedule.scheduleName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {isCalendarLoading ? (
                                <p>Loading available dates...</p>
                            ) : selectedScheduleId ? (
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-md border">
                                        <div className="flex items-center justify-between mb-4">
                                            <button
                                                onClick={handlePrevMonth}
                                                className="p-2 rounded-full hover:bg-gray-100"
                                            >
                                                <ChevronLeftIcon />
                                            </button>
                                            <h3 className="text-lg font-semibold">
                                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </h3>
                                            <button
                                                onClick={handleNextMonth}
                                                className="p-2 rounded-full hover:bg-gray-100"
                                            >
                                                <ChevronRightIcon />
                                            </button>
                                        </div>
                                       
                                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
                                            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                                        </div>
                                       
                                        <div className="grid grid-cols-7 gap-1 mt-2">
                                            {calendarDays.map((day, index) => {
                                                if (!day) return <div key={`empty-${index}`} className="border rounded-md h-16"></div>;
                                               
                                                const dayString = moment(day).format('YYYY-MM-DD');
                                                const slot = availableDates.find(d => d.date === dayString);
                                                const isSelected = selectedDate === dayString;
                                                const isAvailable = slot && slot.isBookingOpen && slot.availableSlots > 0;
                                                const isFutureOrToday = day >= new Date(new Date().setHours(0, 0, 0, 0));
                                               
                                                let dayClass = 'bg-gray-100 text-gray-400 cursor-not-allowed';
                                                if (isAvailable && isFutureOrToday) {
                                                    dayClass = isSelected
                                                        ? 'bg-indigo-600 text-white font-bold'
                                                        : 'bg-green-100 hover:bg-green-200 cursor-pointer';
                                                } else if (slot) {
                                                    dayClass = 'bg-red-100 text-red-400 line-through cursor-not-allowed';
                                                }
                                               
                                                return (
                                                    <div
                                                        key={dayString}
                                                        onClick={() => {
                                                            if (isAvailable && isFutureOrToday) {
                                                                setSelectedDate(dayString);
                                                            }
                                                        }}
                                                        className={`p-2 border rounded-md h-16 flex flex-col justify-center items-center text-sm transition-colors ${dayClass}`}
                                                    >
                                                        <span>{day.getDate()}</span>
                                                        {slot && (
                                                            <span className="text-xs">
                                                                ({slot.availableSlots} left)
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                   
                                    {selectedDate && (
                                        <p className="text-center font-medium">
                                            Selected Date: {moment(selectedDate).format('LL')}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    {courseToSchedule
                                        ? "No schedules available for the selected course"
                                        : "Please select a course to see available schedules"}
                                </p>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                            <button
                                onClick={handleScheduleSubmit}
                                disabled={!selectedDate}
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

export default UserDashboardPage;