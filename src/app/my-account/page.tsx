'use client';

import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';

// --- Type Definitions ---
interface ParticipantDetails {
    firstName: string;
    lastName: string;
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
    courseName?: string;
    bookedDates?: string[];
    packageName?: string;
    includedCourses?: string[];
}

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roleName: 'USER' | 'ADMIN' | 'VISITOR_REGISTERED';
}


// --- API Helper & SVG Icons ---
const getAuthHeaders = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
};
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const ChevronDownIcon = ({ className = "h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

// --- Booking Card Component (Updated) ---
const BookingCard: React.FC<{ booking: UserBookingDetails }> = ({ booking }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isPackage = booking.bookingType === 'PACKAGE';
    const title = isPackage ? booking.packageName : booking.courseName;

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-800';
            case 'Completed': return 'bg-blue-100 text-blue-800';
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
                        {/* CORRECTED: Added the booking type display */}
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
                                        {booking.includedCourses?.map(course => <li key={course}>{course}</li>)}
                                    </ul>
                                </>
                            ) : (
                                <>
                                    <h4 className="font-semibold text-gray-700 mb-2">Booked Dates</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        {booking.bookedDates?.map(date => <li key={date}>{new Date(date + 'T00:00:00').toLocaleDateString()}</li>)}
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

// --- Main Dashboard Component ---
const UserDashboardPage: React.FC = () => {
      const { setIsLoggedIn } = useContext(AuthContext);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    
    const [allUpcomingBookings, setAllUpcomingBookings] = useState<UserBookingDetails[]>([]);
    const [allPastBookings, setAllPastBookings] = useState<UserBookingDetails[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    
    const [filters, setFilters] = useState({ startDate: '', endDate: '', bookingType: '' });
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 5;

    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8091';

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCurrentPage(0);
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilters = () => {
        setCurrentPage(0);
        setFilters({ startDate: '', endDate: '', bookingType: '' });
    };

    const fetchData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        
        setIsLoading(true);
        try {
            if (!user) {
                const profileRes = await axios.get(`${apiUrl}/api/auth/me`, { headers });
                console.log("auth response is ---------------->",profileRes.data )
                setUser(profileRes.data);
            }
            
            const [upcomingRes, pastRes] = await Promise.all([
                axios.get(`${apiUrl}/api/users/bookings/upcoming`, { headers }),
                axios.get(`${apiUrl}/api/users/bookings/past`, { headers })
            ]);

            setAllUpcomingBookings(upcomingRes.data || []);
            setAllPastBookings(pastRes.data || []);

        } catch (error) {
            toast.error("Could not load your dashboard.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [router, user, apiUrl]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    const handleTabChange = (tab: 'upcoming' | 'past') => {
        setCurrentPage(0);
        setActiveTab(tab);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        toast.success("You have been logged out.");
        setIsLoggedIn(false);
        router.push("/login");
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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-4 space-y-2 sticky top-24">
                            <button onClick={() => { /* Logic is handled by main component */ }} className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-md transition-colors ${activeTab === 'upcoming' || activeTab === 'past' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <CalendarIcon /> My Bookings
                            </button>
                            {/* Add other sidebar items here if needed */}
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
                            </nav>
                        </div>
                        
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
                                <span className="text-sm text-gray-700">
                                    Page {currentPage + 1} of {totalPages}
                                </span>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Next</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;
