// File: app/booking-success/page.tsx
// A single, unified confirmation page for both course and package bookings.

'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Type Definitions (Updated) ---
interface UnifiedBookingDetails {
    bookingId: number;
    bookingReference: string;
    bookingType: 'COURSE' | 'PACKAGE';
    participantCount: number;
    finalAmount: number;
    currency: string;
    // Course fields (optional)
    courseName?: string;
    bookedDates?: string[];
    // Package fields (optional)
    packageName?: string;
    includedCourses?: string[];
}

// --- SVG Icons ---
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// --- Main Content Component ---
const BookingSuccessContent: React.FC = () => {
    const [bookingDetails, setBookingDetails] = useState<UnifiedBookingDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://teamhippa.com' || 'http://teamhippa.com';

    const fetchBookingConfirmation = useCallback(async (bookingId: string, retries = 3) => {
        try {
            const response = await axios.get(`${apiUrl}/api/public/booking-data/confirmation/${bookingId}`);
            setBookingDetails(response.data);
            setIsLoading(false);
        } catch (err) {
            const axiosError = err as AxiosError;
            if (axiosError.response?.status === 403 && retries > 0) {
                setTimeout(() => fetchBookingConfirmation(bookingId, retries - 1), 3000);
            } else {
                setError("Failed to retrieve booking confirmation details. Please check your email for a receipt.");
                setIsLoading(false);
            }
        }
    }, [apiUrl]);

    useEffect(() => {
        // CORRECTED: Check for either booking_id or package_booking_id
        const bookingId = searchParams.get('booking_id') || searchParams.get('package_booking_id');

        if (!bookingId) {
            toast.error("Could not find booking information.");
            router.push('/');
            return;
        }
        fetchBookingConfirmation(bookingId);
    }, [searchParams, router, fetchBookingConfirmation]);

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Finalizing your booking...</p>
            </div>
        );
    }

    if (error || !bookingDetails) {
        return (
            <div className="text-center py-20 max-w-lg mx-auto">
                <h2 className="text-2xl font-semibold text-red-600">Could not load booking details.</h2>
                <p className="mt-2 text-gray-600">{error}</p>
                <button onClick={() => router.push('/')} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg">
                    Back to Home
                </button>
            </div>
        );
    }
    
    return (
        <div className="text-center py-10 px-4 sm:px-6 lg:px-8">
            <CheckCircleIcon />
            <h1 className="mt-4 text-4xl font-extrabold text-gray-900">Payment Successful!</h1>
            <p className="mt-2 text-lg text-gray-600">Thank you for your booking. A confirmation email has been sent to you.</p>

            <div className="mt-10 max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8 text-left space-y-4">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">Booking Summary</h2>
                <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Booking Reference:</span>
                    <span className="font-mono text-gray-800">{bookingDetails.bookingReference}</span>
                </div>
                
                {/* CORRECTED: Conditional Rendering based on bookingType */}
                {bookingDetails.bookingType === 'PACKAGE' ? (
                    <>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600">Item:</span>
                            <span className="text-gray-800 font-medium">{bookingDetails.packageName}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">Included Courses:</span>
                            <ul className="list-disc list-inside text-sm text-gray-500 pl-4">
                                {bookingDetails.includedCourses?.map(course => <li key={course}>{course}</li>)}
                            </ul>
                        </div>
                    </>
                ) : (
                    <>
                         <div className="flex justify-between">
                            <span className="font-semibold text-gray-600">Item:</span>
                            <span className="text-gray-800 font-medium">{bookingDetails.courseName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600">Dates:</span>
                            <span className="text-gray-800 font-medium">{bookingDetails.bookedDates?.join(', ')}</span>
                        </div>
                    </>
                )}

                <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Participants:</span>
                    <span className="text-gray-800 font-medium">{bookingDetails.participantCount}</span>
                </div>

                <div className="border-t pt-4 mt-4 flex justify-between text-xl">
                    <span className="font-bold text-gray-900">Total Paid:</span>
                    <span className="font-extrabold text-gray-900">${bookingDetails.finalAmount.toFixed(2)} {bookingDetails.currency}</span>
                </div>
            </div>

            <div className="mt-10 flex justify-center gap-x-4">
                 <button onClick={() => router.push('/')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg">
                    Back to Homepage
                </button>
                <button onClick={() => router.push('/my-account')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg">
                    View My Bookings
                </button>
            </div>
        </div>
    );
};


// The main page component uses Suspense to handle the use of searchParams
const BookingSuccessPage = () => {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading Confirmation...</div>}>
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="max-w-4xl w-full">
                    <BookingSuccessContent />
                </div>
            </div>
        </Suspense>
    );
};

export default BookingSuccessPage;
