'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

// --- Type Definitions ---
interface PackageRenewalDetails {
    masterPackageId: number;
    packageName: string;
    renewalPrice: number;
    currency: string;
    includedCourses: string[];
    clientSecret: string;
    renewalBookingId: number;
     secureAccessToken: string; // <-- Add token
}

// --- Initialize Stripe ---
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8091';

// --- Checkout Form Component ---
const RenewalCheckoutForm: React.FC<{ details: PackageRenewalDetails }> = ({ details }) => {
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
                return_url: `${window.location.origin}/renew-success?booking_id=${details.renewalBookingId}&token=${details.secureAccessToken}`,
                receipt_email: email,
            },
        });

        if (error) {
            toast.error(error.message || "An unexpected payment error occurred.");
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
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : `Pay $${(details.renewalPrice).toFixed(2)} ${details.currency}`}
            </button>
        </form>
    );
};

// --- Main Page Content Component ---
const RenewPackageContent: React.FC = () => {
    const [renewalDetails, setRenewalDetails] = useState<PackageRenewalDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const purchasedPackageId = searchParams.get('id');

        if (!purchasedPackageId) {
            setError("No package specified for renewal.");
            setIsLoading(false);
            return;
        }
        
        const getAuthHeaders = () => {
            const token = localStorage.getItem('authToken');
            if (!token) return null;
            return { 'Authorization': `Bearer ${token}` };
        };

        const prepareRenewal = async () => {
            const headers = getAuthHeaders();
            if (!headers) {
                toast.error("You must be logged in to renew a package.");
                router.push('/login');
                return;
            }

            try {
                const response = await axios.get(`${apiUrl}/api/users/packages/renewal-details/${purchasedPackageId}`, { headers });
                setRenewalDetails(response.data);
            } catch (err: any) {
                setError(err.response?.data || "Could not prepare your package renewal.");
            } finally {
                setIsLoading(false);
            }
        };

        prepareRenewal();
    }, [searchParams, router]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>;
    }
    if (error) {
        return <div className="text-center py-20 text-xl text-red-600">{error}</div>;
    }
    if (!renewalDetails?.clientSecret) {
        return <div className="text-center py-20 text-xl text-gray-600">Could not initialize payment session.</div>;
    }

    const options: StripeElementsOptions = { clientSecret: renewalDetails.clientSecret, appearance: { theme: 'stripe' } };

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto py-12 px-4">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900">Renew Package</h1>
                    <p className="mt-2 text-lg text-gray-600">Securely renew your package and continue your training.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <Elements options={options} stripe={stripePromise}>
                            <RenewalCheckoutForm details={renewalDetails} />
                        </Elements>
                    </div>
                    <div className="bg-gray-50 rounded-lg shadow-lg p-8 h-fit">
                        <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">Order Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Package:</span>
                                <span className="font-semibold text-gray-800 text-right">{renewalDetails.packageName}</span>
                            </div>
                            <div className="mt-2">
                                <span className="text-sm font-medium text-gray-600">Included Courses:</span>
                                <ul className="list-disc list-inside text-sm text-gray-500 pl-4">
                                    {renewalDetails.includedCourses.map(course => <li key={course}>{course}</li>)}
                                </ul>
                            </div>
                             <div className="border-t my-4"></div>
                            <div className="flex justify-between text-2xl font-bold text-gray-900">
                                <span>Total:</span>
                                <span>${renewalDetails.renewalPrice.toFixed(2)} {renewalDetails.currency}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RenewPackagePage = () => (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading Renewal...</div>}>
        <RenewPackageContent />
    </Suspense>
);

export default RenewPackagePage;