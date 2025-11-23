'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';
import ClassPoliciesAndRuleBook from "@/app/components/ClassPoliciesAndRuleBook";

interface Camp {
  id: number;
  campId?: number;
  title: string;
  sportName: string;
  basePriceInfo: string;
  pricePerSlot: number; 
}

interface CampSession {
  sessionId: number;
  sessionName: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  discountPrice?: number;
  maxCapacity: number;
  bookedSlots: number;
  status: string;
  campId: number;
}

interface CampAddonOption {
  optionId: number;
  optionName: string;
  priceAdjustment: number;
  displayOrder: number;
}

interface CampAddonGroup {
  groupId: number;
  groupName: string;
  selectionType: 'SINGLE' | 'MULTIPLE';
  options: CampAddonOption[];
  displayOrder: number;
}

interface Participant {
    id: number; 
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    skillLevel: string;
    medicalNotes: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
}

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

interface SelectedAddOns {
  [groupId: number]: number | number[];
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8091/';

// --- SVG Icons ---
//const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const CampBookingPage: React.FC = () => {
    const [camp, setCamp] = useState<Camp | null>(null);
    const [sessions, setSessions] = useState<CampSession[]>([]);
    const [addonGroups, setAddonGroups] = useState<CampAddonGroup[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOns>({});
    const [loading, setLoading] = useState({
        camp: true,
        sessions: true,
        addons: true
    });
    
    const params = useParams();
    const router = useRouter();
    
    // Get the sessionId from params (this is actually the camp slug)
    const sessionIdParam = params.sessionId as string;

    // Form state
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([
        { id: Date.now(), firstName: '', lastName: '', dateOfBirth: '', gender: 'Prefer not to say', skillLevel: 'Beginner', medicalNotes: '', emergencyContactName: '', emergencyContactPhone: '' }
    ]);
    
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [discount, setDiscount] = useState<{ amount: number; type: 'PERCENTAGE' | 'FIXED_AMOUNT' } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const bookingDataKey = `camp-booking-progress-${sessionIdParam}`;

    useEffect(() => {
        console.log('sessionId from params:', sessionIdParam);
        console.log('All params:', params);
    }, [sessionIdParam, params]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`${apiUrl}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(response => {
                    const user = response.data;
                    setCurrentUser(user);
                    setContactName(`${user.firstName} ${user.lastName}`);
                    setContactEmail(user.email);
                    if (user.phone) setContactPhone(user.phone);
                }).catch(() => {
                    console.log('No user logged in');
                });
        } else {
            const savedData = localStorage.getItem(bookingDataKey);
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    setContactName(data.contactName || '');
                    setContactEmail(data.contactEmail || '');
                    setContactPhone(data.contactPhone || '');
                    setParticipants(data.participants?.length ? data.participants : [{ id: Date.now(), firstName: '', lastName: '', dateOfBirth: '', gender: 'Prefer not to say', skillLevel: 'Beginner', medicalNotes: '', emergencyContactName: '', emergencyContactPhone: '' }]);
                    setSelectedSessionId(data.selectedSessionId || null);
                    setSelectedAddOns(data.selectedAddOns || {});
                    toast.info("Your previous progress has been restored.");
                } catch {
                    localStorage.removeItem(bookingDataKey);
                }
            }
        }
    }, [bookingDataKey]);

    useEffect(() => {
        if (!currentUser) {
            const dataToSave = { 
                contactName, 
                contactEmail, 
                contactPhone, 
                participants, 
                selectedSessionId,
                selectedAddOns
            };
            localStorage.setItem(bookingDataKey, JSON.stringify(dataToSave));
        }
    }, [contactName, contactEmail, contactPhone, participants, selectedSessionId, selectedAddOns, bookingDataKey, currentUser]);
    
    useEffect(() => {
        if (sessionIdParam) {
            console.log('Fetching data for camp slug:', sessionIdParam);
            
            setLoading(prev => ({...prev, camp: true, sessions: true, addons: true}));
            
            axios.get(`${apiUrl}/api/public/camps/${sessionIdParam}`)
                .then(res => {
                    console.log('Full camp data:', res.data);
                    const campData = res.data;
                    
                    // Set camp basic info
                    setCamp({
                        id: campData.campId,
                        campId: campData.campId,
                        title: campData.title,
                        sportName: campData.sportName || '',
                        basePriceInfo: campData.basePriceInfo || '',
                        pricePerSlot: campData.pricePerSlot || 0
                    });

                    // Set sessions
                    const sessionsData = campData.sessions || [];
                    console.log('Sessions data:', sessionsData);
                    setSessions(sessionsData);
                    if (sessionsData.length > 0) {
                        setSelectedSessionId(sessionsData[0].sessionId);
                    }

                    // Set addon groups
                    const addonGroupsData = campData.addonGroups || [];
                    console.log('Addon groups data:', addonGroupsData);
                    setAddonGroups(addonGroupsData);
                })
                .catch((error) => {
                    console.error('Camp fetch error:', error);
                    toast.error("Could not load camp details.");
                })
                .finally(() => setLoading(prev => ({...prev, camp: false, sessions: false, addons: false})));
        }
    }, [sessionIdParam]);

    const addParticipant = () => setParticipants([...participants, { 
        id: Date.now(), 
        firstName: '', 
        lastName: '', 
        dateOfBirth: '', 
        gender: 'Prefer not to say', 
        skillLevel: 'Beginner', 
        medicalNotes: '', 
        emergencyContactName: '', 
        emergencyContactPhone: '' 
    }]);
    
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

    const handleAddOnSelect = (groupId: number, optionId: number, selectionType: 'SINGLE' | 'MULTIPLE') => {
        setSelectedAddOns(prev => {
            const newSelected = { ...prev };
            
            if (selectionType === 'SINGLE') {
                newSelected[groupId] = optionId;
            } else {
                const currentSelection = Array.isArray(newSelected[groupId]) 
                    ? (newSelected[groupId] as number[])
                    : [];
                
                if (currentSelection.includes(optionId)) {
                    newSelected[groupId] = currentSelection.filter(id => id !== optionId);
                } else {
                    newSelected[groupId] = [...currentSelection, optionId];
                }
            }
            
            return newSelected;
        });
    };

    const isOptionSelected = (groupId: number, optionId: number): boolean => {
        const selection = selectedAddOns[groupId];
        if (!selection) return false;
        
        if (Array.isArray(selection)) {
            return selection.includes(optionId);
        } else {
            return selection === optionId;
        }
    };

    const priceDetails = useMemo(() => {
        const selectedSession = sessions.find(s => s.sessionId === selectedSessionId);
        
        const sessionPrice = selectedSession?.discountPrice || selectedSession?.basePrice || camp?.pricePerSlot || 0;
        
        const subtotal = sessionPrice * participants.length;

        let addOnsTotal = 0;
        Object.entries(selectedAddOns).forEach(([groupId, selectedOptions]) => {
            const group = addonGroups.find(g => g.groupId === parseInt(groupId));
            if (!group) return;

            if (Array.isArray(selectedOptions)) {
                selectedOptions.forEach(optionId => {
                    const option = group.options.find(o => o.optionId === optionId);
                    if (option) {
                        addOnsTotal += option.priceAdjustment * participants.length;
                    }
                });
            } else {
                const option = group.options.find(o => o.optionId === selectedOptions);
                if (option) {
                    addOnsTotal += option.priceAdjustment * participants.length;
                }
            }
        });

        const totalSubtotal = subtotal + addOnsTotal;

        let discountAmount = 0;
        if (discount) {
            discountAmount = discount.type === 'PERCENTAGE' ? 
                totalSubtotal * (discount.amount / 100) : 
                discount.amount;
        }
        
        const finalPrice = Math.max(0, totalSubtotal - discountAmount);
        
        return { 
            sessionPrice,
            subtotal, 
            addOnsTotal, 
            totalSubtotal, 
            discountAmount, 
            finalPrice 
        };
    }, [selectedSessionId, sessions, camp, participants, selectedAddOns, addonGroups, discount]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) { 
            toast.warn("Please enter a coupon code."); 
            return; 
        }
        if (!camp) { 
            toast.error("Camp information not loaded."); 
            return; 
        }
        setCouponLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/api/public/booking-data/validate-coupon`, { 
                couponCode, 
                campId: camp.id  
            });
            
            console.log("Coupon validation response:", response.data);
            const { valid, message, discountType, discountValue } = response.data;
            if (valid) {
                toast.success(message);
                setDiscount({ type: discountType, amount: discountValue });
            } else {
                toast.error(message);
                setDiscount(null);
            }
        } catch (error) {
            console.error("Coupon validation failed:", error);
            toast.error("Invalid coupon code.");
            setDiscount(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!contactName || !contactEmail || !contactPhone || !participants[0].firstName || !selectedSessionId) {
            toast.error("Please fill out all required fields and select a session.");
            return;
        }

        const selectedSession = sessions.find(s => s.sessionId === selectedSessionId);
        
        const availableSpots = (selectedSession?.maxCapacity ?? 0) - (selectedSession?.bookedSlots || 0);
        if (selectedSession && availableSpots < participants.length) {
            toast.error(`Only ${availableSpots} spots available in this session.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const bookingPayload = {
                userId: currentUser?.id,
                guestName: contactName,
                guestEmail: contactEmail,
                guestPhone: contactPhone,
                campId: camp?.id,
                sessionId: selectedSessionId,
                participants: participants.map(({ ...p}) => p),
                addOns: selectedAddOns,
                couponCode: discount ? couponCode : null,
                originalAmount: priceDetails.totalSubtotal,
                discountAmount: discount ? priceDetails.discountAmount : 0,
                finalAmount: priceDetails.finalPrice
            };

            console.log('Booking payload:', bookingPayload);

            const response = await axios.post(`${apiUrl}/api/public/booking-data/camp/initiate-booking`, bookingPayload);
            console.log('Booking API response:', response.data);
            if (response.data.success) {
                console.log('Booking response:', response.data);    
                const {secureAccessToken  } = response.data.data;
                toast.success("Camp booking saved. Redirecting to payment...");
                if (!currentUser) localStorage.removeItem(bookingDataKey); 
                console.log('Redirecting to checkout with bookingId:', secureAccessToken);
               router.push(`/checkout/${secureAccessToken}`);
            } else {
                 toast.error(response.data.message || "Booking failed. Please try again.");
            }
        } catch (error: unknown) {
            console.error('Booking error:', error);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "There was an error saving your booking.");
            } else {
                toast.error("There was an error saving your booking.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedSession = sessions.find(s => s.sessionId === selectedSessionId);
    const availableSpots = selectedSession ? selectedSession.maxCapacity - (selectedSession.bookedSlots || 0) : 0;

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">Book Your Camp Spot</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">for {camp?.title || 'our amazing camp'}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-xl p-8 space-y-10">
                        {/* Contact Information Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Your Contact Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Full Name *</label>
                                    <input 
                                        value={contactName} 
                                        onChange={e => setContactName(e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" 
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Email Address *</label>
                                    <input 
                                        type="email" 
                                        value={contactEmail} 
                                        onChange={e => setContactEmail(e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" 
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Phone Number *</label>
                                    <input 
                                        type="tel" 
                                        value={contactPhone} 
                                        onChange={e => setContactPhone(e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" 
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Participants Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Participant(s) Information</h2>
                            <div className="space-y-6">
                                {participants.map((p, index) => (
                                    <div key={p.id} className="p-4 border rounded-lg bg-gray-50/50 relative">
                                        <h3 className="font-semibold text-lg mb-4">Participant #{index + 1}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">First Name *</label>
                                                <input 
                                                    value={p.firstName} 
                                                    onChange={e => handleParticipantChange(index, 'firstName', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 p-3 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" 
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Last Name *</label>
                                                <input 
                                                    value={p.lastName} 
                                                    onChange={e => handleParticipantChange(index, 'lastName', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 p-3 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" 
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Date of Birth *</label>
                                                <input 
                                                    type="date" 
                                                    value={p.dateOfBirth} 
                                                    onChange={e => handleParticipantChange(index, 'dateOfBirth', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 p-3 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" 
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm block font-medium text-gray-700 dark:text-gray-100">Skill Level</label>
                                                <select 
                                                    value={p.skillLevel} 
                                                    onChange={e => handleParticipantChange(index, 'skillLevel', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 p-3 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                                >
                                                    <option>Beginner</option>
                                                    <option>Intermediate</option>
                                                    <option>Advanced</option>
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Medical Notes</label>
                                                <textarea 
                                                    value={p.medicalNotes} 
                                                    onChange={e => handleParticipantChange(index, 'medicalNotes', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" 
                                                    rows={2}
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Emergency Contact Name *</label>
                                                <input 
                                                    value={p.emergencyContactName} 
                                                    onChange={e => handleParticipantChange(index, 'emergencyContactName', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 p-3 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" 
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Emergency Contact Phone *</label>
                                                <input 
                                                    type="tel" 
                                                    value={p.emergencyContactPhone} 
                                                    onChange={e => handleParticipantChange(index, 'emergencyContactPhone', e.target.value)} 
                                                    className="mt-1 block w-full rounded-md border border-gray-300 p-3 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" 
                                                    required
                                                />
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
                                {/*
                                <PlusCircleIcon/> Add Another Participant*/}
                            </button>
                        </section>
                        
                        {/* Sessions Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Select Camp Session</h2>
                            {loading.sessions ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Loading sessions...</p>
                                </div>
                            ) : sessions.length > 0 ? (
                                <>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">Available Sessions *</label>
                                        <select 
                                            value={selectedSessionId || ''} 
                                            onChange={e => setSelectedSessionId(Number(e.target.value))} 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 dark:text-gray-100"
                                            required
                                        >
                                            <option value="">-- Select a Session --</option>
                                            {sessions.map(session => {
                                                const availableSpots = session.maxCapacity - (session.bookedSlots || 0);
                                                const price = session.discountPrice || session.basePrice;
                                                
                                                return (
                                                    <option key={session.sessionId} value={session.sessionId}>
                                                        {session.sessionName} - {new Date(session.startDate).toLocaleDateString()} to {new Date(session.endDate).toLocaleDateString()} - ${price} ({availableSpots} spots left)
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    {selectedSession && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                            <h4 className="font-semibold text-blue-800 mb-2">Selected Session Details:</h4>
                                            <p className="text-blue-700">
                                                <strong>{selectedSession.sessionName}</strong><br />
                                                Duration: {new Date(selectedSession.startDate).toLocaleDateString()} to {new Date(selectedSession.endDate).toLocaleDateString()}<br />
                                                Price: ${priceDetails.sessionPrice} per participant<br />
                                                Available Spots: {availableSpots}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-gray-500">No sessions available for this camp.</p>
                                </div>
                            )}
                        </section>

                        {/* Add-Ons Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Select Add-Ons (Optional)</h2>
                            {loading.addons ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Loading add-ons...</p>
                                </div>
                            ) : addonGroups.length > 0 ? (
                                <div className="space-y-6">
                                    {addonGroups.map(group => (
                                        <div key={group.groupId} className="border rounded-lg p-6 bg-white">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                {group.groupName}
                                                <span className="text-sm font-normal text-gray-500 ml-2">
                                                    ({group.selectionType === 'SINGLE' ? 'Select one' : 'Select multiple'})
                                                </span>
                                            </h3>
                                            <div className="space-y-2">
                                                {group.options.map(option => (
                                                    <div key={option.optionId} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                                                        <div className="flex items-center space-x-3">
                                                            {group.selectionType === 'SINGLE' ? (
                                                                <input
                                                                    type="radio"
                                                                    name={`addon-group-${group.groupId}`}
                                                                    checked={isOptionSelected(group.groupId, option.optionId)}
                                                                    onChange={() => handleAddOnSelect(group.groupId, option.optionId, 'SINGLE')}
                                                                    className="h-4 w-4 text-indigo-600"
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isOptionSelected(group.groupId, option.optionId)}
                                                                    onChange={() => handleAddOnSelect(group.groupId, option.optionId, 'MULTIPLE')}
                                                                    className="h-4 w-4 text-indigo-600 rounded"
                                                                />
                                                            )}
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{option.optionName}</h4>
                                                                {option.priceAdjustment !== 0 && (
                                                                    <p className="text-sm text-gray-600">
                                                                        {option.priceAdjustment > 0 ? '+' : ''}${option.priceAdjustment} per participant
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-gray-500">No add-ons available for this camp.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4 dark:text-gray-100">Booking Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-700 dark:text-gray-100">
                                    <span>Camp:</span>
                                    <span className="font-semibold">{camp?.title}</span>
                                </div>
                                {selectedSession && (
                                    <div className="flex justify-between text-gray-700 dark:text-gray-100">
                                        <span>Session:</span>
                                        <span className="font-semibold text-right max-w-[150px]">
                                            {selectedSession.sessionName}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-700 dark:text-gray-100">
                                    <span>Participants:</span>
                                    <span className="font-semibold">{participants.length}</span>
                                </div>
                                
                                <div className="border-t my-2"></div>
                                
                                <div className="flex justify-between text-gray-700 dark:text-gray-100">
                                    <span>Session Price:</span>
                                    <span>${(priceDetails.sessionPrice * participants.length).toFixed(2)}</span>
                                </div>
                                
                                {priceDetails.addOnsTotal > 0 && (
                                    <div className="flex justify-between text-gray-700 dark:text-gray-100">
                                        <span>Add-ons:</span>
                                        <span>+${priceDetails.addOnsTotal.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-100">
                                    <span>Subtotal:</span>
                                    <span>${priceDetails.totalSubtotal.toFixed(2)}</span>
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
                            <button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting || !selectedSessionId}
                                className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mb-10">
                <ClassPoliciesAndRuleBook href="/images/Rule-book-Website-Updated.pdf">
                    Camp policies / Rule Book
                </ClassPoliciesAndRuleBook>
            </div>
        </div>  
    );
};

export default CampBookingPage;