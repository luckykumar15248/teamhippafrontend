// File: app/(dashboard)/admin/bookings/page.tsx
// A complete admin dashboard with a unified display for courses and packages,
// full filtering, and working action buttons.

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

// --- Type Definitions (Updated & Unified) ---
interface AdminParticipantDetails {
    participantId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    skillLevel: string;
}

interface AdminPaymentTransaction {
    transactionId: number;
    stripePaymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
}

interface AdminBookingDetails {
    bookingId: number;
    bookingReference: string;
    sesecureAccessToken: string;
    customerName: string;
    customerEmail: string;
    bookingStatus: string;
    paymentStatus: string;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    createdAt: string;
    participants: AdminParticipantDetails[];
    paymentTransactions: AdminPaymentTransaction[];
    
    // Unified Fields
    bookingType: 'COURSE' | 'PACKAGE';
    itemName: string; // A single field for Course Name or Package Name
    bookedDates?: string[]; // Optional: for COURSE type
    includedCourses?: string[]; // Optional: for PACKAGE type
}

interface Course {
    id: number;
    name: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8091';
const ITEMS_PER_PAGE = 10;

// --- API Helper ---
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
};

// --- SVG Icons ---
const ChevronDownIcon = ({ className = "h-5 w-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

// --- Booking Row Component (Updated) ---
const BookingRow: React.FC<{
    booking: AdminBookingDetails;
    onStatusUpdate: (bookingId: number, newStatus: string) => Promise<void>;
    onDelete: (bookingId: number) => Promise<void>;
}> = ({ booking, onStatusUpdate, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newStatus, setNewStatus] = useState(booking.bookingStatus);

    const isPackage = booking.bookingType === 'PACKAGE';

    const getStatusClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelledbyuser':
            case 'cancelledbyadmin':
                return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    
    const getTypeClass = (type: string) => {
        return type === 'PACKAGE' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800';
    };

    const handleStatusUpdate = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await onStatusUpdate(booking.bookingId, newStatus);
        setIsEditing(false);
    };

    return (
        <>
            <tr onClick={() => setIsOpen(!isOpen)} className="cursor-pointer hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.bookingReference}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{booking.sesecureAccessToken || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.customerEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.itemName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(booking.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">${booking.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">${booking.discountAmount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">${booking.finalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} onClick={e => e.stopPropagation()} className="border rounded p-1 text-xs">
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="CancelledByUser">Cancelled By User</option>
                                <option value="CancelledByAdmin">Cancelled By Admin</option>
                            </select>
                        </div>
                    ) : (
                        <>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(booking.bookingStatus)}`}>
                                {booking.bookingStatus}
                            </span>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeClass(booking.bookingType)}`}>
                                {booking.bookingType}
                            </span>
                        </>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                         {isEditing ? (
                            <>
                                <button onClick={handleStatusUpdate} className="text-green-600 hover:text-green-800">Save</button>
                                <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="text-gray-600 hover:text-gray-800">Cancel</button>
                            </>
                         ) : (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="text-blue-600 hover:text-blue-800">Edit</button>
                                <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Are you sure you want to delete this booking?')) { onDelete(booking.bookingId); } }} className="text-red-600 hover:text-red-800">Delete</button>
                            </>
                         )}
                         <ChevronDownIcon className={`h-6 w-6 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </td>
            </tr>
            {isOpen && (
                <tr className="bg-gray-50">
                    <td colSpan={10} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="font-bold text-gray-700 mb-2">Participants</h4>
                                {booking.participants?.map((p) => (
                                    <div key={p.participantId} className="text-xs text-gray-600 mb-2 border-l-2 pl-2">
                                        <p><strong>{p.firstName} {p.lastName}</strong></p>
                                        <p>DOB: {new Date(p.dateOfBirth).toLocaleDateString()}</p>
                                        <p>Skill: {p.skillLevel}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                {isPackage ? (
                                    <>
                                        <h4 className="font-bold text-gray-700 mb-2">Included Courses</h4>
                                        <ul className="list-disc list-inside text-xs text-gray-600">
                                            {booking.includedCourses?.map(course => <li key={course}>{course}</li>)}
                                        </ul>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="font-bold text-gray-700 mb-2">Booked Dates</h4>
                                        <ul className="list-disc list-inside text-xs text-gray-600">
                                            {booking.bookedDates?.map(date => <li key={date}>{new Date(date).toLocaleDateString()}</li>)}
                                        </ul>
                                    </>
                                )}
                            </div>
                             <div>
                                <h4 className="font-bold text-gray-700 mb-2">Payment History</h4>
                                {booking.paymentTransactions?.map((t) => (
                                    <div key={t.transactionId} className="text-xs text-gray-600 mb-2 border-l-2 pl-2">
                                        <p><strong>${t.amount?.toFixed(2)}</strong> - {t.status}</p>
                                        <p className="truncate">ID: {t.stripePaymentIntentId}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};


// --- Main Admin Dashboard Component ---
const AdminAllBookingsPage: React.FC = () => {
    const [bookings, setBookings] = useState<AdminBookingDetails[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    const [filters, setFilters] = useState({
        searchTerm: '',
        startDate: '',
        endDate: '',
        paymentStatus: '',
        bookingStatus: '',
        courseId: '',
        transactionId: '',
        sesecureAccessToken: '',
        bookingType: ''
    });

    const fetchData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }

        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}api/admin/bookings`, { headers });
            const sortedBookings = response.data.sort((a: AdminBookingDetails, b: AdminBookingDetails) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setBookings(sortedBookings);
        } catch (error) {
            toast.error("Could not load bookings");
        } finally {
            setIsLoading(false);
        }
    }, [router, apiUrl]);

    const fetchCourses = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            const response = await axios.get(`${apiUrl}api/public_api/courses`, { headers });
            setAllCourses(response.data || []);
        } catch (error) {
            toast.error("Could not load courses");
        }
    }, [apiUrl]);

    useEffect(() => {
        fetchData();
        fetchCourses();
    }, [fetchData, fetchCourses]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({ searchTerm: '', startDate: '', endDate: '', paymentStatus: '', bookingStatus: '', courseId: '', transactionId: '', sesecureAccessToken: '', bookingType: '' });
        setCurrentPage(1);
    };

    const bookingStats = useMemo(() => {
        return {
            total: bookings.length,
            confirmed: bookings.filter(b => b.bookingStatus === 'Confirmed').length,
            pending: bookings.filter(b => b.bookingStatus === 'Awaiting Payment').length,
            cancelled: bookings.filter(b => b.bookingStatus?.includes('Cancelled')).length,
            completed: bookings.filter(b => b.bookingStatus === 'Completed').length,
            totalRevenue: bookings.reduce((sum, booking) => sum + (booking.paymentStatus === 'Paid' ? booking.finalAmount : 0), 0),
            totalDiscounts: bookings.reduce((sum, booking) => sum + booking.discountAmount, 0)
        };
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            const matchesTransactionId = filters.transactionId === '' || 
                booking.paymentTransactions?.some(t => 
                    t.stripePaymentIntentId?.toLowerCase().includes(filters.transactionId.toLowerCase())
                );

            const matchesSecureToken = filters.sesecureAccessToken === '' ||
                booking.sesecureAccessToken?.toLowerCase().includes(filters.sesecureAccessToken.toLowerCase());

            return (
                matchesTransactionId &&
                matchesSecureToken &&
                (filters.searchTerm === '' || 
                 booking.bookingReference.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                 booking.customerName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                 booking.customerEmail.toLowerCase().includes(filters.searchTerm.toLowerCase())) &&
                (filters.bookingStatus === '' || booking.bookingStatus === filters.bookingStatus) &&
                (filters.paymentStatus === '' || booking.paymentStatus === filters.paymentStatus) &&
                (filters.bookingType === '' || booking.bookingType === filters.bookingType) &&
                (filters.courseId === '' || booking.itemName === filters.courseId) &&
                (!startDate || bookingDate >= startDate) &&
                (!endDate || bookingDate <= endDate)
            );
        });
    }, [bookings, filters]);

    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    const paginatedBookings = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredBookings, currentPage]);

    const updateBookingStatus = async (bookingId: number, newStatus: string) => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            await axios.put(`${apiUrl}api/admin/bookings/${bookingId}/status`, { status: newStatus }, { headers });
            toast.success('Booking status updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update booking status');
        }
    };

    const deleteBooking = async (bookingId: number) => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            await axios.delete(`${apiUrl}api/admin/bookings/${bookingId}`, { headers });
            toast.success('Booking deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete booking');
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
                <p className="mt-1 text-sm text-gray-600">View, filter, and manage all customer bookings.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
                    <p className="text-2xl font-semibold text-gray-900">{bookingStats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Confirmed</h3>
                    <p className="text-2xl font-semibold text-green-600">{bookingStats.confirmed}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Pending Payment</h3>
                    <p className="text-2xl font-semibold text-yellow-600">{bookingStats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                    <p className="text-2xl font-semibold text-blue-600">${bookingStats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Discounts</h3>
                    <p className="text-2xl font-semibold text-purple-600">${bookingStats.totalDiscounts.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                    <p className="text-2xl font-semibold text-blue-600">{bookingStats.completed}</p>
                </div>
            </div>

            <div className="mb-6 p-4 bg-white rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder="Search by Ref, Name, Email..." className="w-full p-2 border border-gray-300 rounded-md" />
                    <input type="text" name="transactionId" value={filters.transactionId} onChange={handleFilterChange} placeholder="Search by Payment ID..." className="w-full p-2 border border-gray-300 rounded-md" />
                    <input type="text" name="sesecureAccessToken" value={filters.sesecureAccessToken} onChange={handleFilterChange} placeholder="Search by Secure Token..." className="w-full p-2 border border-gray-300 rounded-md" />
                    <select name="bookingType" value={filters.bookingType} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">All Types</option>
                        <option value="COURSE">Course</option>
                        <option value="PACKAGE">Package</option>
                    </select>

                     <div>
                        <label className="text-xs text-gray-500">Start Date</label>
                        <input 
                            type="date" 
                            name="startDate" 
                            value={filters.startDate} 
                            onChange={handleFilterChange} 
                            className="w-full p-2 border border-gray-300 rounded-md" 
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">End Date</label>
                        <input 
                            type="date" 
                            name="endDate" 
                            value={filters.endDate} 
                            onChange={handleFilterChange} 
                            className="w-full p-2 border border-gray-300 rounded-md" 
                        />
                    </div>

                    <select 
                        name="courseId" 
                        value={filters.courseId} 
                        onChange={handleFilterChange} 
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">All Courses</option>
                        {allCourses.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                    <select 
                        name="bookingStatus" 
                        value={filters.bookingStatus} 
                        onChange={handleFilterChange} 
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">All Booking Statuses</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Awaiting Payment">Awaiting Payment</option>
                        <option value="Completed">Completed</option>
                        <option value="CancelledByUser">Cancelled By User</option>
                        <option value="CancelledByAdmin">Cancelled By Admin</option>
                    </select>
                    <select 
                        name="paymentStatus" 
                        value={filters.paymentStatus} 
                        onChange={handleFilterChange} 
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">All Payment Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                    {/* ... other filter inputs ... */}
                    <button onClick={resetFilters} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium">Reset Filters</button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secure Token</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={10} className="text-center py-12">Loading...</td></tr>
                        ) : paginatedBookings.length > 0 ? (
                            paginatedBookings.map(booking => <BookingRow key={booking.bookingId} booking={booking} onStatusUpdate={updateBookingStatus} onDelete={deleteBooking} />)
                        ) : (
                            <tr><td colSpan={10} className="text-center py-12 text-gray-500">No bookings match your filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
};

export default AdminAllBookingsPage;
