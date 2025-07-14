// File: app/package-checkout/[packageId]/page.tsx
// This page now initiates the booking and payment intent when it loads.

'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

// --- Type Definitions ---
interface PackageCheckoutDetails {
    packageBookingId: number;
    packageName: string;
    includedCourses: string[];
    finalAmount: number;
}

// --- Initialize Stripe ---
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error("Missing Stripe Publishable Key in .env.local");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8091';

// --- Checkout Form Component ---
const CheckoutForm: React.FC<{ bookingDetails: PackageCheckoutDetails }> = ({ bookingDetails }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/booking-success?package_booking_id=${bookingDetails.packageBookingId}`,
                receipt_email: email,
            },
        });

        if (error) {
            toast.error(error.message || "An unexpected error occurred.");
        }
        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address for Receipt</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div className="pt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Payment Details</h3>
                <div className="p-4 border rounded-md bg-gray-50">
                    <PaymentElement id="payment-element" />
                </div>
            </div>
            <button disabled={isLoading || !stripe || !elements} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg flex justify-center items-center">
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : `Pay $${(bookingDetails.finalAmount).toFixed(2)} USD`}
            </button>
        </form>
    );
};

// --- Main Page Content Component ---
const PackageCheckoutContent: React.FC = () => {
    const [clientSecret, setClientSecret] = useState('');
    const [bookingDetails, setBookingDetails] = useState<PackageCheckoutDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const params = useParams();
    const router = useRouter();
    const hasInitiatedCheckout = useRef(false);

    useEffect(() => {
        const packageId = params.packageId as string;
        if (!packageId) {
            toast.error("No package ID found.");
            router.push('/');
            return;
        }
        
        if (hasInitiatedCheckout.current) return;
        hasInitiatedCheckout.current = true;

        const initiateCheckout = async () => {
             try {
                // Call the new backend endpoint to create the booking and payment intent
                const response = await axios.post(`${apiUrl}api/public/package-bookings/initiate-checkout`, {
                    packageId: parseInt(packageId),
                });

                if (!response.data.success) {
                    throw new Error(response.data.message || "Failed to initiate checkout.");
                }

                const details = response.data.data;
                setBookingDetails(details);
                setClientSecret(details.clientSecret);

             } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Could not start the checkout process.");
                toast.error("Could not start the checkout process.");
             } finally {
                 setIsLoading(false);
             }
        };
        initiateCheckout();
    }, [params.packageId, router]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>;
    }
    if (error) {
        return <div className="text-center py-20 text-xl text-red-600">{error}</div>;
    }
    if (!clientSecret || !bookingDetails) {
        return <div className="text-center py-20 text-xl text-gray-600">Could not initialize payment session.</div>;
    }

    const options: StripeElementsOptions = { clientSecret, appearance: { theme: 'stripe' } };

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto py-12 px-4">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900">Checkout Package</h1>
                    <p className="mt-2 text-lg text-gray-600">Securely finalize your package booking.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-white rounded-lg shadow-xl p-8">
                         <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm bookingDetails={bookingDetails} />
                        </Elements>
                    </div>
                    <div className="bg-gray-50 rounded-lg shadow-lg p-8 h-fit">
                        <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">Order Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Package:</span>
                                <span className="font-semibold text-gray-800 text-right">{bookingDetails.packageName}</span>
                            </div>
                            <div className="mt-2">
                                <span className="text-sm font-medium text-gray-600">Included Courses:</span>
                                <ul className="list-disc list-inside text-sm text-gray-500 pl-4">
                                    {bookingDetails.includedCourses.map(course => <li key={course}>{course}</li>)}
                                </ul>
                            </div>
                             <div className="border-t my-4"></div>
                            <div className="flex justify-between text-2xl font-bold text-gray-900">
                                <span>Total:</span>
                                <span>${bookingDetails.finalAmount.toFixed(2)} USD</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PackageCheckoutPage = () => (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <PackageCheckoutContent />
    </Suspense>
);

export default PackageCheckoutPage;
