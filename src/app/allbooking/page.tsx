'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

interface Booking {
    bookingId: number;
    bookingReference: string;
    courseName: string;
    bookingDate: string;
    finalAmount: number;
    currency: string;
    bookingStatus: 'Confirmed' | 'Completed' | 'Cancelled' | 'Awaiting Payment' | 'CancelledBySystem';
}

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roleName: 'USER' | 'ADMIN' | 'VISITOR_REGISTERED';
}

// --- SVG Icons ---
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;


// --- Main Dashboard Component ---
const UserDashboardPage: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [pastBookings, setPastBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8091';

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Using a single, public test endpoint to fetch all data.
            // This allows us to verify the UI without dealing with authentication issues.
            const response = await axios.get(`${apiUrl}/api/public/booking-data/test-all-bookings`);
            const allBookings: Booking[] = response.data || [];

            // We can still set a mock user for display purposes
            setUser({
                id: 26,
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                roleName: "USER"
            });

            // Filter the bookings on the client side for this test
            setUpcomingBookings(allBookings.filter(b => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Awaiting Payment'));
            setPastBookings(allBookings.filter(b => b.bookingStatus !== 'Confirmed' && b.bookingStatus !== 'Awaiting Payment'));

        } catch (error) {
            toast.error("Could not load booking data from the test API.");
            console.error("Test API fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        toast.success("You have been logged out.");
        router.push('/');
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
                    {/* Left Navigation Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-4 space-y-2 sticky top-24">
                            <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-md transition-colors ${activeTab === 'bookings' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <CalendarIcon /> My Bookings
                            </button>
                             <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-md transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <UserCircleIcon /> My Profile
                            </button>
                            <div className="border-t pt-2 mt-2">
                                <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                    <LogoutIcon /> Logout
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-3">
                        {activeTab === 'bookings' && (
                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Bookings</h2>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        {upcomingBookings.length > 0 ? (
                                            <ul className="divide-y divide-gray-200">
                                                {upcomingBookings.map(booking => (
                                                    <li key={booking.bookingId} className="py-4 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-indigo-600">{booking.courseName}</p>
                                                            <p className="text-sm text-gray-500">Ref: {booking.bookingReference}</p>
                                                            <p className="text-sm text-gray-500">Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-gray-900">${booking.finalAmount.toFixed(2)}</p>
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{booking.bookingStatus}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center text-gray-500 py-8">You have no upcoming bookings.</p>
                                        )}
                                    </div>
                                </section>
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Past Bookings</h2>
                                     <div className="bg-white rounded-lg shadow p-6">
                                        {pastBookings.length > 0 ? (
                                            <ul className="divide-y divide-gray-200">
                                                 {pastBookings.map(booking => (
                                                    <li key={booking.bookingId} className="py-4 flex items-center justify-between opacity-70">
                                                        <div>
                                                            <p className="font-semibold text-gray-600">{booking.courseName}</p>
                                                            <p className="text-sm text-gray-500">Ref: {booking.bookingReference}</p>
                                                            <p className="text-sm text-gray-500">Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-gray-700">${booking.finalAmount.toFixed(2)}</p>
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.bookingStatus === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{booking.bookingStatus}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center text-gray-500 py-8">You have no past bookings.</p>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}
                        {activeTab === 'profile' && (
                             <div className="bg-white rounded-lg shadow p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h2>
                                <div className="space-y-4">
                                    <div><span className="font-semibold">Name:</span> {user.firstName} {user.lastName}</div>
                                    <div><span className="font-semibold">Email:</span> {user.email}</div>
                                    {/* Add more profile fields and an "Edit Profile" button here */}
                                </div>
                             </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;
