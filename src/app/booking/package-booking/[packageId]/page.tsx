'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

// --- Type Definitions ---
interface PackageBookingRule {
    minParticipants: number | null;
    maxParticipants: number | null;
}

interface PackageDetails {
  id: number;
  name: string;
  price: number; 
  bookingRule: PackageBookingRule | null;
}

interface PackageSchedule {
  scheduleId: number;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

interface Participant {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    skillLevel: string;
    medicalNotes: string;
}

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8091';

// --- SVG Icons ---
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

// --- Main Page Component ---
const PackageBookingPage: React.FC = () => {
    const [pkg, setPkg] = useState<PackageDetails | null>(null);
    const [schedules, setSchedules] = useState<PackageSchedule[]>([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    const params = useParams();
    const router = useRouter();

    // Form state
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([
        { id: Date.now(), firstName: '', lastName: '', dateOfBirth: '', gender: 'Prefer not to say', skillLevel: 'Beginner', medicalNotes: '' }
    ]);
    
    // Coupon & Price State
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [discount, setDiscount] = useState<{ amount: number; type: 'PERCENTAGE' | 'FIXED_AMOUNT' } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const bookingDataKey = `package-booking-progress-${params.packageId}`;

    // --- Data Fetching and State Management ---
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`${apiUrl}api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(response => {
                    const user = response.data;
                    setCurrentUser(user);
                    setContactName(`${user.firstName} ${user.lastName}`);
                    setContactEmail(user.email);
                    if (user.phone) setContactPhone(user.phone);
                }).catch(() => localStorage.removeItem('authToken'));
        } else {
            const savedData = localStorage.getItem(bookingDataKey);
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    setContactName(data.contactName || '');
                    setContactEmail(data.contactEmail || '');
                    setContactPhone(data.contactPhone || '');
                    setParticipants(data.participants?.length ? data.participants : [{ id: Date.now(), firstName: '', lastName: '', dateOfBirth: '', gender: 'Prefer not to say', skillLevel: 'Beginner', medicalNotes: '' }]);
                    toast.info("Your previous progress has been restored.");
                } catch {
                    localStorage.removeItem(bookingDataKey);
                }
            }
        }
    }, [bookingDataKey]);

    useEffect(() => {
        if (!currentUser) {
            const dataToSave = { contactName, contactEmail, contactPhone, participants };
            localStorage.setItem(bookingDataKey, JSON.stringify(dataToSave));
        }
    }, [contactName, contactEmail, contactPhone, participants, bookingDataKey, currentUser]);
    
    useEffect(() => {
        const packageId = params.packageId as string;
        if (packageId) {
            axios.get(`${apiUrl}api/public/packages/${packageId}`)
                .then(res => setPkg(res.data))
                .catch(() => toast.error("Could not load package details."));
            
            axios.get(`${apiUrl}api/public/package-schedules/package/${packageId}`)
                .then(res => {
                    // Filter out any schedules with undefined or null IDs
                    const validSchedules = (res.data || []).filter((schedule: PackageSchedule) => schedule.scheduleId != null);
                    setSchedules(validSchedules);
                    if (validSchedules.length > 0) {
                        setSelectedScheduleId(validSchedules[0].scheduleId);
                    }
                })
                .catch(() => toast.error("Could not load schedules for this package."));
        }
    }, [params.packageId]);
    
    // --- Helper Functions ---
    const addParticipant = () => setParticipants([...participants, { id: Date.now(), firstName: '', lastName: '', dateOfBirth: '', gender: 'Prefer not to say', skillLevel: 'Beginner', medicalNotes: '' }]);
    
    const removeParticipant = (id: number) => { 
        if (participants.length > 1) {
            setParticipants(participants.filter(p => p.id !== id));
        } else {
            toast.error("At least one participant is required.");
        }
    };
    
    const handleParticipantChange = (index: number, field: keyof Omit<Participant, 'id'>, value: string) => {
        const newParticipants = [...participants];
        newParticipants[index] = { ...newParticipants[index], [field]: value };
        setParticipants(newParticipants);
    };

    // --- Price Calculations ---
    const priceDetails = useMemo(() => {
        const subtotal = (pkg?.price || 0) * participants.length;
        let discountAmount = 0;
        if (discount) {
            discountAmount = discount.type === 'PERCENTAGE' ? subtotal * (discount.amount / 100) : discount.amount;
        }
        const finalPrice = Math.max(0, subtotal - discountAmount);
        return { subtotal, discountAmount, finalPrice };
    }, [participants.length, pkg, discount]);

    // --- Coupon Code Handling ---
    const handleApplyCoupon = async () => {
        if (!couponCode.trim() || !pkg) return;
        setCouponLoading(true);
        try {
            
            const response = await axios.post(`${apiUrl}api/public/package-bookings/validate-coupon`, { 
                couponCode, 
                packageId: pkg.id 
            });
            const { valid, message, discountType, discountValue } = response.data;
            if (valid) {
                toast.success(message);
                setDiscount({ type: discountType, amount: discountValue });
            } else {
                toast.error(message);
                setDiscount(null);
            }
        } catch (error) {
            toast.error("Invalid coupon code.");
            console.error(error);
            setDiscount(null);
        } finally {
            setCouponLoading(false);
        }
    };
    
    // --- Schedule Validation ---
    const isScheduleActive = useMemo(() => {
        if (!selectedScheduleId || schedules.length === 0) return false;
        const selectedSchedule = schedules.find(s => s.scheduleId === selectedScheduleId);
        if (!selectedSchedule) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const scheduleStartDate = new Date(selectedSchedule.startDate + 'T00:00:00');
        const scheduleEndDate = new Date(selectedSchedule.endDate + 'T00:00:00');
        
        return today >= scheduleStartDate && today <= scheduleEndDate;
    }, [selectedScheduleId, schedules]);

    // --- Booking Validation ---
    const isBookingValid = useMemo(() => {
        const rule = pkg?.bookingRule;
        if (!rule) return true;
        const numParticipants = participants.length;
        if (rule.minParticipants && numParticipants < rule.minParticipants) return false;
        if (rule.maxParticipants && numParticipants > rule.maxParticipants) return false;
        return true;
    }, [pkg, participants.length]);

    const getBookingRuleMessage = () => {
        if (selectedScheduleId) {
            const selectedSchedule = schedules.find(s => s.scheduleId === selectedScheduleId);
            if (selectedSchedule) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const scheduleStartDate = new Date(selectedSchedule.startDate + 'T00:00:00');
                const scheduleEndDate = new Date(selectedSchedule.endDate + 'T00:00:00');

                if (today < scheduleStartDate) {
                    return `This schedule will be available from ${scheduleStartDate.toLocaleDateString()}.`;
                }
                if (today > scheduleEndDate) {
                    return "This schedule has ended and is no longer available for booking.";
                }
            }
        }
        
        const rule = pkg?.bookingRule;
        if (!rule || isBookingValid) return null;
        
        const numParticipants = participants.length;
        if (rule.minParticipants && numParticipants < rule.minParticipants) {
            return `This package requires a minimum of ${rule.minParticipants} participants.`;
        }
        if (rule.maxParticipants && numParticipants > rule.maxParticipants) {
            return `This package allows a maximum of ${rule.maxParticipants} participants.`;
        }
        return null;
    };

    // --- Form Submission ---
    const handleSubmit = async () => {
        if (!contactName || !contactEmail || !participants[0].firstName || !selectedScheduleId) {
            toast.error("Please fill out all required fields and select a schedule.");
            return;
        }
        setIsSubmitting(true);
        try {
            const bookingPayload = {
                userId: currentUser?.id,
                guestName: contactName,
                guestEmail: contactEmail,
                guestPhone: contactPhone,
                packageId: pkg?.id,
                scheduleId: selectedScheduleId,
                participants: participants.map(({...p}) => p),
                finalAmount: priceDetails.finalPrice,
                originalAmount: priceDetails.subtotal,
                discountAmount: priceDetails.discountAmount,
                couponCode: discount ? couponCode : null,
            };

            const response = await axios.post(`${apiUrl}api/public/package-bookings/initiate`, bookingPayload);
            
            if (response.data.success) {
                const { bookingToken } = response.data.data;
                toast.success("Package booking saved. Redirecting to payment...");
                if (!currentUser) localStorage.removeItem(bookingDataKey); 
                router.push(`/checkout/${bookingToken}`);
            } else {
                 toast.error(response.data.message || "Booking failed. Please try again.");
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("There was an error saving your booking.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900">Book Your Package</h1>
                    <p className="mt-2 text-lg text-gray-600">for {pkg?.name || 'our amazing package'}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-xl p-8 space-y-10">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Your Contact Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input 
                                        value={contactName} 
                                        onChange={e => setContactName(e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={contactEmail} 
                                        onChange={e => setContactEmail(e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        value={contactPhone} 
                                        onChange={e => setContactPhone(e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" 
                                    />
                                </div>
                            </div>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Participant(s) Information</h2>
                            <div className="space-y-6">
                                {participants.map((p, index) => (
                                    <div key={p.id} className="p-4 border rounded-lg bg-gray-50/50 relative">
                                        <h3 className="font-semibold text-lg mb-4">Participant #{index + 1}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium">First Name</label>
                                                <input 
                                                    value={p.firstName} 
                                                    onChange={e => handleParticipantChange(index, 'firstName', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 p-3" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Last Name</label>
                                                <input 
                                                    value={p.lastName} 
                                                    onChange={e => handleParticipantChange(index, 'lastName', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 p-3" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Date of Birth</label>
                                                <input 
                                                    type="date" 
                                                    value={p.dateOfBirth} 
                                                    onChange={e => handleParticipantChange(index, 'dateOfBirth', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 p-3" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm block font-medium">Skill Level</label>
                                                <select 
                                                    value={p.skillLevel} 
                                                    onChange={e => handleParticipantChange(index, 'skillLevel', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 p-3"
                                                >
                                                    <option>Beginner</option>
                                                    <option>Intermediate</option>
                                                    <option>Advanced</option>
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="text-sm font-medium">Medical Notes</label>
                                                <textarea 
                                                    value={p.medicalNotes} 
                                                    onChange={e => handleParticipantChange(index, 'medicalNotes', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 p-3" 
                                                    rows={2}
                                                ></textarea>
                                            </div>
                                        </div>
                                        {participants.length > 1 && (
                                            <button 
                                                onClick={() => removeParticipant(p.id)} 
                                                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                            >
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={addParticipant} 
                                className="mt-4 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                                <PlusCircleIcon/> Add Another Participant
                            </button>
                        </section>
                        
                        {/* Schedule Selection Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Select a Schedule</h2>
                            <div className="mb-4">
                                <select 
                                    value={selectedScheduleId || ''} 
                                    onChange={e => setSelectedScheduleId(Number(e.target.value))} 
                                    className="mt-1 block w-full md:w-1/2 rounded-md border-gray-300 shadow-sm p-3"
                                >
                                    <option key="default" value="">-- Select an Available Schedule --</option>
                                    {schedules.map((schedule, index) => (
                                        <option 
                                            key={`schedule-${schedule.scheduleId || index}`} 
                                            value={schedule.scheduleId}
                                        >
                                            {schedule.name} ({new Date(schedule.startDate + 'T00:00:00').toLocaleDateString()} - {new Date(schedule.endDate + 'T00:00:00').toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </section>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-xl p-6 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">Booking Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Package:</span>
                                    <span className="font-semibold">{pkg?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Participants:</span>
                                    <span className="font-semibold">{participants.length}</span>
                                </div>
                                <div className="border-t my-2"></div>
                                <div className="flex justify-between font-semibold text-gray-700">
                                    <span>Subtotal:</span>
                                    <span>${priceDetails.subtotal.toFixed(2)}</span>
                                </div>
                                
                                <div className="pt-4 space-y-2">
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Coupon Code" 
                                            value={couponCode} 
                                            onChange={e => setCouponCode(e.target.value.toUpperCase())} 
                                            className="w-full text-sm rounded-md border border-gray-300 shadow-sm p-2" 
                                        />
                                        <button 
                                            onClick={handleApplyCoupon} 
                                            disabled={couponLoading} 
                                            className="bg-gray-200 text-gray-700 px-3 py-1 text-sm font-semibold rounded-md hover:bg-gray-300"
                                        >
                                            {couponLoading ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {discount && (
                                        <div className="flex justify-between text-green-600 font-semibold">
                                            <span>Discount ({couponCode}):</span>
                                            <span>- ${priceDetails.discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="border-t my-2"></div>
                                <div className="flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total:</span>
                                    <span>${priceDetails.finalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            {getBookingRuleMessage() && (
                                <div className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                    {getBookingRuleMessage()}
                                </div>
                            )}

                            <button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting || !isBookingValid || !selectedScheduleId || !isScheduleActive} 
                                className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm & Book Package'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageBookingPage;