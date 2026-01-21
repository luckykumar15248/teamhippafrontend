'use client';

import React, { useState, useEffect, useRef } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

// Type Definitions
interface BookingDetails {
  bookingId: number;
  description: string;
  finalAmount: number;
  currency: string;
}

interface BillingAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface BillingDetails {
  name: string;
  email: string;
  phone: string;
  address: BillingAddress;
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const CheckoutForm: React.FC<{ bookingDetails: BookingDetails; clientSecret: string }> = ({ bookingDetails, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const paymentCompleted = useRef(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = 
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => checkDarkMode();
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    name: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: 'AZ',
      postal_code: '',
      country: 'US'
    }
  });

  const [step, setStep] = useState(1);
  const [showPaymentRequiredAlert, setShowPaymentRequiredAlert] = useState(true);

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    const query = new URLSearchParams(window.location.search);
    const paymentIntentClientSecret = query.get('payment_intent_client_secret');
    
    if (paymentIntentClientSecret) {
      const checkPaymentStatus = async () => {
        const { paymentIntent } = await stripe.retrievePaymentIntent(paymentIntentClientSecret);
        
        if (window.history.replaceState) {
          const newUrl = window.location.pathname + window.location.search
            .replace(/payment_intent_client_secret=[^&]*&?/, '')
            .replace(/&$/, '');
          window.history.replaceState({}, document.title, newUrl);
        }

        switch (paymentIntent?.status) {
          case "succeeded":
            if (!paymentCompleted.current) {
              paymentCompleted.current = true;
              setMessage("Payment succeeded! Redirecting...");
              setMessageType('success');
              setTimeout(() => router.push(`/booking-success?booking_id=${bookingDetails.bookingId}`), 2000);
            }
            break;
          case "processing":
            setMessage("Your payment is processing. We'll update you when complete.");
            setMessageType('info');
            break;
          case "requires_payment_method":
            if (!initialLoad) {
              setMessage("Payment failed. Please try another payment method.");
              setMessageType('error');
            }
            break;
          default:
            setMessage(null);
            break;
        }
        setInitialLoad(false);
      };

      checkPaymentStatus();
    } else {
      setInitialLoad(false);
    }
  }, [stripe, bookingDetails.bookingId, router, clientSecret, initialLoad]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
   
    if (name.startsWith('address.')) {
      const field = name.split('.')[1] as keyof BillingAddress;
      setBillingDetails(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setBillingDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBillingInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!billingDetails.name || !billingDetails.email || !billingDetails.address.line1 ||
        !billingDetails.address.city || !billingDetails.address.postal_code) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setStep(2);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (paymentCompleted.current || !stripe || !elements) {
      toast.error("Payment already processed or system is initializing.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success?booking_id=${bookingDetails.bookingId}`,
          receipt_email: billingDetails.email,
          payment_method_data: {
            billing_details: {
              name: billingDetails.name,
              email: billingDetails.email,
              phone: billingDetails.phone,
              address: {
                line1: billingDetails.address.line1,
                line2: billingDetails.address.line2 || '',
                city: billingDetails.address.city,
                state: billingDetails.address.state,
                postal_code: billingDetails.address.postal_code,
                country: billingDetails.address.country
              }
            }
          }
        },
        redirect: 'if_required'
      });

      if (error) {
        let errorMessage = error.message || "Payment failed";
       
        if (error.code === 'card_declined') {
          errorMessage = "Card declined. Please try another payment method.";
        } else if (error.code === 'incorrect_zip') {
          errorMessage = "Incorrect ZIP code. Please check your billing address.";
        }
       
        setMessage(errorMessage);
        setMessageType('error');
      } else if (paymentIntent) {
        switch (paymentIntent.status) {
          case 'succeeded':
            paymentCompleted.current = true;
            setMessage("Payment succeeded! Redirecting...");
            setMessageType('success');
            setTimeout(() => router.push(`/booking-success?booking_id=${bookingDetails.bookingId}`), 2000);
            break;
          case 'processing':
            setMessage("Payment processing. We'll notify you when complete.");
            setMessageType('info');
            break;
          case 'requires_payment_method':
            setMessage("Payment failed. Please try another payment method.");
            setMessageType('error');
            break;
          default:
            setMessage("Payment status unknown. Please check your email.");
            setMessageType('info');
            break;
        }
      }
    } catch (err: unknown) {
      console.error("Payment error:", err);

      let errorMessage = "An unexpected error occurred";
      if (typeof err === 'object' && err !== null) {
        const errorObj = err as { code?: string; message?: string };
        if (errorObj.code === 'payment_intent_authentication_failure') {
          errorMessage = "Payment authentication failed. Please try again.";
        } else if (errorObj.code === 'payment_intent_payment_attempt_failed') {
          errorMessage = "Payment attempt failed. Please check your card details.";
        }
      }

      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageClass = () => {
    switch (messageType) {
      case 'success': return isDarkMode ? 'bg-green-900/30 text-green-300 border-l-4 border-green-500' : 'bg-green-100 text-green-800 border-l-4 border-green-500';
      case 'error': return isDarkMode ? 'bg-red-900/30 text-red-300 border-l-4 border-red-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500';
      case 'info': return isDarkMode ? 'bg-blue-900/30 text-blue-300 border-l-4 border-blue-500' : 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
      default: return isDarkMode ? 'bg-gray-800 text-gray-300 border-l-4 border-gray-600' : 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
    }
  };

  return (
    <div className={`rounded-xl shadow-lg p-6 border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className={`flex items-center ${step >= 1 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 
                ? (isDarkMode ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-600')
                : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400')
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Billing Info</span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 
                ? (isDarkMode ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-600')
                : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400')
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
        </div>
      </div>

      {/* PAYMENT REQUIRED ALERT */}
      {showPaymentRequiredAlert && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-yellow-900/20 border-yellow-700/50' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                IMPORTANT: Payment Required to Confirm Booking
              </h3>
              <div className={`mt-2 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                <p className="mb-1">• Your booking is <span className="font-bold">NOT CONFIRMED</span> until payment is completed</p>
                <p className="mb-1">• Complete payment now to secure your spot</p>
                <p className="mb-1">• Payment confirmation email will be sent immediately</p>
                <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  ⚠️ Do not close this page until you see Payment Successful
                </p>
              </div>
              <button
                onClick={() => setShowPaymentRequiredAlert(false)}
                className={`mt-3 font-medium text-sm ${
                  isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-700 hover:text-yellow-800'
                }`}
              >
                I understand, proceed to payment →
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={step === 1 ? handleBillingInfoSubmit : handleSubmit} className="space-y-6">
        {step === 1 ? (
          <>
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Step 1: Enter Billing Information
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Please provide your details to proceed with payment
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={billingDetails.name}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border border-gray-300'
                    }`}
                    required
                    autoComplete="name"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={billingDetails.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border border-gray-300'
                    }`}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={billingDetails.phone}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border border-gray-300'
                  }`}
                  autoComplete="tel"
                />
              </div>

              <div className="pt-2">
                <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Billing Address
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Street address *
                    </label>
                    <input
                      name="address.line1"
                      value={billingDetails.address.line1}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border border-gray-300'
                      }`}
                      required
                      autoComplete="address-line1"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Apt, suite, etc.
                    </label>
                    <input
                      name="address.line2"
                      value={billingDetails.address.line2}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border border-gray-300'
                      }`}
                      autoComplete="address-line2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        City *
                      </label>
                      <input
                        name="address.city"
                        value={billingDetails.address.city}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border border-gray-300'
                        }`}
                        required
                        autoComplete="address-level2"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        ZIP code *
                      </label>
                      <input
                        name="address.postal_code"
                        value={billingDetails.address.postal_code}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border border-gray-300'
                        }`}
                        required
                        autoComplete="postal-code"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        State *
                      </label>
                      <input
                        name="address.state"
                        value={billingDetails.address.state}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-400' 
                            : 'border border-gray-300 bg-gray-100'
                        }`}
                        readOnly
                        autoComplete="address-level1"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Country *
                      </label>
                      <input
                        name="address.country"
                        value={billingDetails.address.country}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-400' 
                            : 'border border-gray-300 bg-gray-100'
                        }`}
                        readOnly
                        autoComplete="country"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-200 mt-6"
              >
                Continue to Payment →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Billing Info
              </button>
            </div>

            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Step 2: Complete Payment
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enter your payment details to confirm your booking
            </p>

            <div className="space-y-4">
              {/* Payment Notice */}
              <div className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-blue-900/20 border-blue-700/50' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      Your booking will be confirmed immediately upon successful payment
                    </p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                      You will receive a confirmation email within minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Payment Method
                </h3>
                <div className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <PaymentElement 
                    options={{
                      layout: "tabs",
                      fields: {
                        billingDetails: 'never'
                      },
                      wallets: {
                        applePay: 'auto',
                        googlePay: 'auto'
                      }
                    }}
                  />
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${getMessageClass()}`}>
                  <div className="flex items-center">
                    <span className="font-medium">{message}</span>
                  </div>
                </div>
              )}

              <button
                disabled={isLoading || !stripe || !elements}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mt-2 text-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    CONFIRM BOOKING - PAY ${bookingDetails.finalAmount.toFixed(2)}
                  </>
                )}
              </button>
              
              <div className={`text-center text-sm mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>🔒 Secure payment powered by Stripe</p>
                <p>Your payment information is encrypted and protected</p>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

const CheckoutPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const params = useParams();
  const router = useRouter();
  const paymentIntentCreated = useRef(false);

  // Check dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = 
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => checkDarkMode();
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const bookingId = params.bookingId as string;
    if (!bookingId || paymentIntentCreated.current) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        paymentIntentCreated.current = true;
       
        const bookingResponse = await axios.get(`${apiUrl}/api/public/booking-data/details/${bookingId}`);
        const details = bookingResponse.data;
       
        if (!details || !details.finalAmount) {
          throw new Error("Invalid booking details");
        }

        details.currency = 'usd';
       
        setBookingDetails(details);
       
        const idempotencyKey = `booking-${details.bookingId}-${Date.now()}`;
        
        const paymentIntentResponse = await axios.post(`${apiUrl}/api/public/payments/create-payment-intent`, {
          amount: Math.round(details.finalAmount * 100),
          bookingId: details.bookingId,
          currency: 'usd',
          description: `Booking #${details.bookingId}`,
          metadata: {
            booking_id: details.bookingId,
            location: 'Gilbert, AZ'
          },
          payment_method_types: ['card'],
          capture_method: 'automatic'
        }, {
          headers: {
            'Idempotency-Key': idempotencyKey
          }
        });

        if (!paymentIntentResponse.data.clientSecret) {
          throw new Error("Failed to get client secret");
        }

        setClientSecret(paymentIntentResponse.data.clientSecret);
      } catch (err: unknown) {
        console.error("Checkout error:", err);

        let errorMessage = "Payment setup failed";
        if (typeof err === 'object' && err !== null) {
          const errorObj = err as { response?: { status?: number; data?: { message?: string } }; message?: string; code?: string };
          if (errorObj.response?.status === 402) {
            errorMessage = "Payment configuration error. Please contact support.";
          } else if (errorObj.message && errorObj.message.includes('currency')) {
            errorMessage = "Only USD payments are accepted";
          } else if (errorObj.code === 'resource_missing') {
            errorMessage = "Payment service unavailable. Please try again later.";
          }
          setError(errorObj.response?.data?.message || errorObj.message || errorMessage);
        } else {
          setError(errorMessage);
        }
        toast.error("Could not initialize payment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (clientSecret) {
        axios.post(`${apiUrl}/api/public/payments/cancel-payment-intent`, {
          clientSecret
        }).catch(console.error);
      }
    };
  }, [params.bookingId, router, clientSecret]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: isDarkMode ? 'night' : 'stripe',
      variables: {
        colorPrimary: isDarkMode ? '#6366f1' : '#2563eb',
        colorBackground: isDarkMode ? '#1f2937' : '#ffffff',
        colorText: isDarkMode ? '#f3f4f6' : '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
        colorTextPlaceholder: isDarkMode ? '#9ca3af' : '#6b7280',
        colorIcon: isDarkMode ? '#9ca3af' : '#6b7280',
      },
      rules: {
        '.Input': {
          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
          borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
          color: isDarkMode ? '#f3f4f6' : '#1f2937',
        },
        '.Input:focus': {
          borderColor: isDarkMode ? '#6366f1' : '#2563eb',
          boxShadow: isDarkMode ? '0 0 0 1px #6366f1' : '0 0 0 1px #2563eb',
        },
        '.Tab': {
          backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
          borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
        },
        '.Tab:hover': {
          backgroundColor: isDarkMode ? '#4b5563' : '#f3f4f6',
        },
        '.Tab--selected': {
          backgroundColor: isDarkMode ? '#6366f1' : '#2563eb',
          borderColor: isDarkMode ? '#6366f1' : '#2563eb',
          color: '#ffffff',
        },
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 rounded-full animate-spin mx-auto ${
            isDarkMode ? 'border-blue-400 border-t-transparent' : 'border-blue-500 border-t-transparent'
          }`}></div>
          <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Setting up your secure checkout...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full p-8 rounded-xl shadow-lg text-center border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
            isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
          }`}>
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className={`mt-4 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Payment Setup Error
          </h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => router.push('/bookings')}
            className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Bookings
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret || !bookingDetails) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full p-8 rounded-xl shadow-lg text-center border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
            isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
          }`}>
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className={`mt-4 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Checkout Not Available
          </h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            We could not set up your payment session.
          </p>
          <button
            onClick={() => router.push('/bookings')}
            className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 to-gray-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header with clear messaging */}
        <div className="text-center mb-10">
          <h1 className={`text-4xl font-extrabold sm:text-5xl mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Complete Payment to Confirm Your Booking
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Your booking is <span className={`font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>PENDING</span> until payment is completed
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm bookingDetails={bookingDetails} clientSecret={clientSecret} />
            </Elements>
          </div>

          <div className={`rounded-xl shadow-lg p-6 border h-fit ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="sticky top-6">
              <h2 className={`text-2xl font-bold pb-3 border-b ${
                isDarkMode ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'
              }`}>
                Booking Summary
              </h2>
              
              {/* Status Alert */}
              <div className={`mb-6 p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-red-900/20 border-red-700/50' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className={`font-bold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                    STATUS: AWAITING PAYMENT
                  </span>
                </div>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  Complete payment to secure this booking
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Service:</span>
                  <span className={`font-medium text-right ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {bookingDetails.description}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Booking ID:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    #{bookingDetails.bookingId}
                  </span>
                </div>

                <div className={`border-t my-4 pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Subtotal:</span>
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                      ${bookingDetails.finalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Tax:</span>
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>$0.00</span>
                  </div>
                </div>

                <div className={`border-t my-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

                <div className={`flex justify-between items-center text-2xl font-bold pt-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <span>Total Amount:</span>
                  <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>
                    ${bookingDetails.finalAmount.toFixed(2)} USD
                  </span>
                </div>

                <div className={`mt-6 p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-green-900/20 border-green-700/50' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                    What happens next?
                  </h3>
                  <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Instant booking confirmation email
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Spot immediately reserved for you
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Payment receipt sent to your email
                    </li>
                  </ul>
                </div>

                <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Location
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Gilbert, Arizona, United States
                  </p>
                  <div className={`mt-4 flex items-center text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    All transactions are secure and encrypted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;