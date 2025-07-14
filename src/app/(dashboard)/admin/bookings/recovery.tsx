// File: app/(dashboard)/admin/bookings/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

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
    totalAmount: number;
    discountAmount: number;
    paymentStatus: string;
    finalAmount: number;
    courseName: string;
    bookedDates: string[];
    participants: AdminParticipantDetails[];
    paymentTransactions: AdminPaymentTransaction[];
    createdAt: string;
}

interface Course {
    id: number;
    name: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8091';
const ITEMS_PER_PAGE = 10;

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
        sesecureAccessToken: '' // New filter for sesecureAccessToken
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return null;
        }
        return { 'Authorization': `Bearer ${token}` };
    };

    const fetchData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) return;

        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}api/admin/bookings`, { headers });
            const sortedBookings = response.data.sort((a: AdminBookingDetails, b: AdminBookingDetails) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setBookings(sortedBookings);
        } catch (error) {
            toast.error("Could not load bookings");
            console.error("Error fetching bookings:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchCourses = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await axios.get(`${apiUrl}api/public_api/courses`, { headers });
            setAllCourses(response.data || []);
        } catch (error) {
            toast.error("Could not load courses");
            console.error("Error fetching courses:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchCourses();
    }, [fetchData, fetchCourses]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({
            searchTerm: '',
            startDate: '',
            endDate: '',
            paymentStatus: '',
            bookingStatus: '',
            courseId: '',
            transactionId: '',
            sesecureAccessToken: ''
        });
        setCurrentPage(1);
    };

    const bookingStats = useMemo(() => {
        return {
            total: bookings.length,
            confirmed: bookings.filter(b => b.bookingStatus === 'Confirmed').length,
            pending: bookings.filter(b => b.bookingStatus === 'Awaiting Payment').length,
            cancelled: bookings.filter(b => 
                b.bookingStatus === 'CancelledByUser' || 
                b.bookingStatus === 'CancelledByAdmin'
            ).length,
            completed: bookings.filter(b => b.bookingStatus === 'Completed').length,
            totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
            totalDiscounts: bookings.reduce((sum, booking) => sum + booking.discountAmount, 0)
        };
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const matchesTransactionId = filters.transactionId === '' || 
                booking.paymentTransactions?.some(t => 
                    t.stripePaymentIntentId?.toLowerCase().includes(filters.transactionId.toLowerCase())
                );

            const matchesSesecureToken = filters.sesecureAccessToken === '' ||
                booking.sesecureAccessToken?.toLowerCase().includes(filters.sesecureAccessToken.toLowerCase());

            return (
                matchesTransactionId &&
                matchesSesecureToken &&
                (filters.searchTerm === '' || 
                 booking.bookingReference.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                 booking.customerName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                 booking.customerEmail.toLowerCase().includes(filters.searchTerm.toLowerCase())) &&
                (filters.bookingStatus === '' || booking.bookingStatus === filters.bookingStatus) &&
                (filters.paymentStatus === '' || booking.paymentStatus === filters.paymentStatus) &&
                (filters.courseId === '' || booking.courseName === filters.courseId) &&
                (filters.startDate === '' || new Date(booking.createdAt) >= new Date(filters.startDate)) &&
                (filters.endDate === '' || new Date(booking.createdAt) <= new Date(filters.endDate))
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
            await axios.put(
                `${apiUrl}api/admin/bookings/${bookingId}/status`,
                { status: newStatus },
                { headers }
            );
            toast.success('Booking status updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update booking status');
            console.error("Error updating status:", error);
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
            console.error("Error deleting booking:", error);
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
                    <input 
                        type="text" 
                        name="searchTerm" 
                        value={filters.searchTerm} 
                        onChange={handleFilterChange} 
                        placeholder="Search by Ref, Name, Email..." 
                        className="w-full p-2 border border-gray-300 rounded-md" 
                    />
                    <input
                        type="text"
                        name="transactionId"
                        value={filters.transactionId}
                        onChange={handleFilterChange}
                        placeholder="Search by Payment ID..."
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                        type="text"
                        name="sesecureAccessToken"
                        value={filters.sesecureAccessToken}
                        onChange={handleFilterChange}
                        placeholder="Search by Sesecure Token..."
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
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
                    <button 
                        onClick={resetFilters} 
                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sesecure Token</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
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
                            <tr>
                                <td colSpan={10} className="text-center py-12">Loading bookings...</td>
                            </tr>
                        ) : filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="text-center py-12 text-gray-500">
                                    {bookings.length === 0 ? 'No bookings found' : 'No bookings match your filters'}
                                </td>
                            </tr>
                        ) : (
                            paginatedBookings.map(booking => (
                                <BookingRow 
                                    key={booking.bookingId} 
                                    booking={booking}
                                    onStatusUpdate={updateBookingStatus}
                                    onDelete={deleteBooking}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {filteredBookings.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                        <span className="font-medium">
                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredBookings.length}</span> results
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const BookingRow: React.FC<{
    booking: AdminBookingDetails;
    onStatusUpdate: (bookingId: number, newStatus: string) => Promise<void>;
    onDelete: (bookingId: number) => Promise<void>;
}> = ({ booking, onStatusUpdate, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newStatus, setNewStatus] = useState(booking.bookingStatus);

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

    const handleStatusUpdate = async () => {
        await onStatusUpdate(booking.bookingId, newStatus);
        setIsEditing(false);
    };

    return (
        <>
            <tr onClick={() => setIsOpen(!isOpen)} className="cursor-pointer hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.bookingReference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                    {booking.sesecureAccessToken || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.customerEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {booking.courseName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(booking.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                    ${booking.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                    ${booking.discountAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ${booking.finalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="border rounded p-1 text-xs"
                            >
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="CancelledByUser">Cancelled By User</option>
                                <option value="CancelledByAdmin">Cancelled By Admin</option>
                            </select>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate();
                                }}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                            >
                                Save
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(false);
                                }}
                                className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(booking.bookingStatus)}`}>
                                {booking.bookingStatus}
                            </span>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                className="text-blue-500 hover:text-blue-700 text-xs"
                            >
                                Edit
                            </button>
                        </div>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this booking?')) {
                                    onDelete(booking.bookingId);
                                }
                            }}
                            className="text-red-500 hover:text-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
            {isOpen && (
                <tr className="bg-gray-50">
                    <td colSpan={10} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="font-bold text-gray-700 mb-2">Participants</h4>
                                {booking.participants?.map((p: any) => (
                                    <div key={p.participantId} className="text-xs text-gray-600 mb-2 border-l-2 pl-2">
                                        <p><strong>{p.firstName} {p.lastName}</strong></p>
                                        <p>DOB: {new Date(p.dateOfBirth).toLocaleDateString()}</p>
                                        <p>Skill: {p.skillLevel}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-700 mb-2">Booked Dates</h4>
                                <ul className="list-disc list-inside text-xs text-gray-600">
                                    {booking.bookedDates?.map(date => (
                                        <li key={date}>{new Date(date).toLocaleDateString()}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-700 mb-2">Payment History</h4>
                                {booking.paymentTransactions?.map((t: any) => (
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

export default AdminAllBookingsPage;