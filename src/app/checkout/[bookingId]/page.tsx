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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (paymentCompleted.current || !stripe || !elements) {
      toast.error("Payment already processed or system is initializing.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Validate form before submission
      if (!billingDetails.name || !billingDetails.email || !billingDetails.address.line1 ||
          !billingDetails.address.city || !billingDetails.address.postal_code) {
        throw new Error("Please fill in all required fields");
      }

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
        } else if (errorObj.message && errorObj.message.includes('required fields')) {
          errorMessage = errorObj.message;
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
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>
     
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              name="name"
              type="text"
              value={billingDetails.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              autoComplete="name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              name="email"
              type="email"
              value={billingDetails.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            name="phone"
            type="tel"
            value={billingDetails.phone}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            autoComplete="tel"
          />
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Billing Address</h3>
          
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Street address *</label>
              <input
                name="address.line1"
                value={billingDetails.address.line1}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                autoComplete="address-line1"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Apt, suite, etc.</label>
              <input
                name="address.line2"
                value={billingDetails.address.line2}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                autoComplete="address-line2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">City *</label>
                <input
                  name="address.city"
                  value={billingDetails.address.city}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  autoComplete="address-level2"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">ZIP code *</label>
                <input
                  name="address.postal_code"
                  value={billingDetails.address.postal_code}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  autoComplete="postal-code"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">State *</label>
                <input
                  name="address.state"
                  value={billingDetails.address.state}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  readOnly
                  autoComplete="address-level1"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Country *</label>
                <input
                  name="address.country"
                  value={billingDetails.address.country}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  readOnly
                  autoComplete="country"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Payment Method</h3>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
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
          <div className={`p-3 rounded-md ${getMessageClass()}`}>
            <div className="flex items-center">
              {messageType === 'success' && (
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {messageType === 'error' && (
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {messageType === 'info' && (
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message}</span>
            </div>
          </div>
        )}

        <button
          disabled={isLoading || !stripe || !elements}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mt-6"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </>
          ) : (
            `Pay $${bookingDetails.finalAmount.toFixed(2)}`
          )}
        </button>
       </form>
    </div>
  );
};

const CheckoutPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const paymentIntentCreated = useRef(false);

  useEffect(() => {
    const bookingId = params.bookingId as string;
    if (!bookingId || paymentIntentCreated.current) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        paymentIntentCreated.current = true;
       
        // Fetch booking details
        const bookingResponse = await axios.get(`${apiUrl}/api/public/booking-data/details/${bookingId}`);
        const details = bookingResponse.data;
       
        if (!details || !details.finalAmount) {
          throw new Error("Invalid booking details");
        }

        details.currency = 'usd';
       
        setBookingDetails(details);
       
        // Create PaymentIntent with idempotency key
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
      // Cleanup function to cancel payment intent if user leaves page
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
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px'
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Setting up your secure checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-3 text-xl font-medium text-gray-900">Payment Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret || !bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mt-3 text-xl font-medium text-gray-900">Checkout Not Available</h2>
          <p className="mt-2 text-gray-600">We couldn&apos;t set up your payment session.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Complete Your Booking
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Secure payment for your reservation in Gilbert, AZ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm bookingDetails={bookingDetails} clientSecret={clientSecret} />
          </Elements>

          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
           
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium text-gray-900">{bookingDetails.description}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium text-gray-900">#{bookingDetails.bookingId}</span>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total:</span>
                <span>${bookingDetails.finalAmount.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Location</h3>
              <p className="text-sm text-gray-600">
                Gilbert, Arizona, United States
              </p>
              <p className="text-sm text-gray-600 mt-1">
                All transactions are secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;