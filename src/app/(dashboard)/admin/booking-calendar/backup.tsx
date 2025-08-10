// File: app/(dashboard)/admin/calendar/page.tsx
// This version adds a fully functional reschedule modal.

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// --- Type Definitions ---
interface CalendarEvent {
    id: number; // This is now the DailyAvailability ID
    title: string;
    start: Date;
    end: Date;
    resource: any; 
}

interface AdminBookingDetails {
    bookingId: number;
    bookingReference: string;
    customerName: string;
    customerEmail: string;
    bookingStatus: string;
    participants: { firstName: string; lastName: string; }[];
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const localizer = momentLocalizer(moment);

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
};

// --- Main Page Component ---
const AdminCalendarPage: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSlotBookings, setSelectedSlotBookings] = useState<AdminBookingDetails[]>([]);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isRescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [bookingToReschedule, setBookingToReschedule] = useState<AdminBookingDetails | null>(null);
    const [newDate, setNewDate] = useState('');
    const [cancellationReason, setCancellationReason] = useState('');
    const router = useRouter();

    const fetchEvents = useCallback(async (start: Date, end: Date) => {
        const headers = getAuthHeaders();
        if (!headers) { router.push('/login'); return; }
        
        setIsLoading(true);
        try {
            const params = {
                start: moment(start).format('YYYY-MM-DD'),
                end: moment(end).format('YYYY-MM-DD'),
            };
            const response = await axios.get(`${apiUrl}/api/admin/schedule/calendar`, { headers, params });
            
            const formattedEvents = response.data.map((booking: any) => ({
                id: booking.id,
                title: booking.title,
                start: new Date(booking.start),
                end: new Date(booking.end),
                resource: booking,
            }));
            setEvents(formattedEvents);
        } catch (error) {
            toast.error("Could not load calendar bookings.");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();
        fetchEvents(startOfMonth, endOfMonth);
    }, [fetchEvents]);

    const handleSelectEvent = async (event: CalendarEvent) => {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await axios.get<AdminBookingDetails[]>(`${apiUrl}/api/admin/schedule/slot-details/${event.id}`, { headers });
            setSelectedSlotBookings(response.data);
            setDetailsModalOpen(true);
        } catch {
            toast.error("Could not fetch booking details for this class.");
        }
    };

    const openRescheduleModal = (booking: AdminBookingDetails) => {
        setBookingToReschedule(booking);
        setDetailsModalOpen(false); // Close the details modal
        setRescheduleModalOpen(true);
    };

    const handleRescheduleBooking = async () => {
        if (!bookingToReschedule || !newDate) {
            toast.error("Please select a new date.");
            return;
        }
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            await axios.post(`${apiUrl}/api/admin/schedule/bookings/${bookingToReschedule.bookingId}/reschedule`, 
                { newDate }, 
                { headers }
            );
            toast.success("Booking has been rescheduled and users notified.");
            setRescheduleModalOpen(false);
            setBookingToReschedule(null);
            setNewDate('');
            // Refresh the calendar events
            const currentView = new Date();
            const startOfMonth = moment(currentView).startOf('month').toDate();
            const endOfMonth = moment(currentView).endOf('month').toDate();
            fetchEvents(startOfMonth, endOfMonth);
        } catch (error) {
            toast.error("Failed to reschedule booking. There may not be enough slots available.");
        }
    };

    const handleCancelSingleBooking = async (bookingId: number) => {
        if (!cancellationReason) {
            toast.error("Please provide a reason for cancellation.");
            return;
        }
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            await axios.post(`${apiUrl}/api/admin/schedule/bookings/${bookingId}/cancel`, 
                { reason: cancellationReason }, 
                { headers }
            );
            toast.success("Booking has been cancelled and user notified.");
            setDetailsModalOpen(false);
            // Refresh the calendar events
            const currentView = new Date();
            const startOfMonth = moment(currentView).startOf('month').toDate();
            const endOfMonth = moment(currentView).endOf('month').toDate();
            fetchEvents(startOfMonth, endOfMonth);
        } catch (error) {
            toast.error("Failed to cancel booking.");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
                <p className="mt-1 text-sm text-gray-600">View, reschedule, and cancel classes at a glance.</p>
            </header>
            
            <div style={{ height: '70vh' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleSelectEvent}
                    onRangeChange={(range: Date[] | { start: Date; end: Date }) => {
                        const start = Array.isArray(range) ? range[0] : range.start;
                        const end = Array.isArray(range) ? range[range.length - 1] : range.end;
                        fetchEvents(start, end);
                    }}
                />
            </div>

            {/* Details Modal */}
            {isDetailsModalOpen && selectedSlotBookings.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Class Details</h3>
                        <div className="space-y-6">
                            {selectedSlotBookings.map(booking => (
                                <div key={booking.bookingId} className="border p-4 rounded-md">
                                    <p><strong>Booking Ref:</strong> {booking.bookingReference}</p>
                                    <p><strong>Customer:</strong> {booking.customerName} ({booking.customerEmail})</p>
                                    <p><strong>Status:</strong> {booking.bookingStatus}</p>
                                    <div>
                                        <h4 className="font-semibold mt-2">Participants ({booking.participants.length}):</h4>
                                        <ul className="list-disc list-inside text-sm">
                                            {booking.participants.map((p, i) => <li key={i}>{p.firstName} {p.lastName}</li>)}
                                        </ul>
                                    </div>
                                    <div className="mt-4">
                                        <label className="text-xs">Cancellation Reason:</label>
                                        <input 
                                            type="text"
                                            onChange={e => setCancellationReason(e.target.value)}
                                            className="w-full p-1 border rounded-md mt-1 text-sm"
                                            placeholder="Reason for this specific cancellation..."
                                        />
                                        <div className="mt-2 flex gap-2">
                                            <button 
                                                onClick={() => openRescheduleModal(booking)} 
                                                className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs"
                                            >
                                                Reschedule
                                            </button>
                                            <button 
                                                onClick={() => handleCancelSingleBooking(booking.bookingId)} 
                                                className="px-3 py-1 bg-red-600 text-white rounded-md text-xs"
                                            >
                                                Cancel This Booking
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setDetailsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {isRescheduleModalOpen && bookingToReschedule && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Reschedule Booking</h3>
                        <p className="mb-4 text-sm">Rescheduling for {bookingToReschedule.customerName} ({bookingToReschedule.bookingReference})</p>
                        <div>
                            <label htmlFor="newDate" className="block text-sm font-medium text-gray-700">Select New Date</label>
                            <input
                                type="date"
                                id="newDate"
                                value={newDate}
                                onChange={e => setNewDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setRescheduleModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                            <button onClick={handleRescheduleBooking} className="px-4 py-2 bg-green-600 text-white rounded-md">Confirm Reschedule</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendarPage;
