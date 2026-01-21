'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';
import ClassPoliciesAndRuleBook from '@/app/components/ClassPoliciesAndRuleBook';

// --- Interfaces ---
interface Course {
  id: number;
  name: string;
  sportName: string;
  basePriceInfo: string;
  pricePerSlot: number;
}

interface CourseSchedule {
  schedule_id: number;
  scheduleName: string;
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
  dailyHours: number;
}

interface AvailabilitySlot {
  date: string;
  availableSlots: number;
  price: number;
  isBookingOpen: boolean;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8091/';

// --- SVG Icons ---
const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// Timezone-safe date formatter
const toYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BookingPage: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const params = useParams();
  const router = useRouter();

  // Form state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // Initialize with one empty participant
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: Date.now(),
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Prefer not to say',
      skillLevel: 'Beginner',
      medicalNotes: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      dailyHours: 1,
    },
  ]);
  
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<Map<string, AvailabilitySlot>>(new Map());
  const [fetchedMonths, setFetchedMonths] = useState<Set<string>>(new Set());
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState<{ amount: number; type: 'PERCENTAGE' | 'FIXED_AMOUNT' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State to track if we have finished restoring from localStorage
  const [isRestored, setIsRestored] = useState(false);

  const bookingDataKey = `booking-progress-${params.courseId}`;

  // --- 1. INITIALIZATION & RESTORE LOGIC ---
  useEffect(() => {
    const initialize = async () => {
      let userProfile: UserProfile | null = null;
      const token = localStorage.getItem('authToken');

      // A. Try to fetch user profile if token exists
      if (token) {
        try {
          const response = await axios.get(`${apiUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          userProfile = response.data;
          setCurrentUser(userProfile);
          
          // Pre-fill contact info from DB immediately (Source of Truth)
          setContactName(`${userProfile?.firstName} ${userProfile?.lastName}`);
          setContactEmail(userProfile?.email || '');
          if (userProfile?.phone) setContactPhone(userProfile?.phone);
        } catch {
          localStorage.removeItem('authToken');
        }
      }

      // B. Restore Draft Data from LocalStorage
      const savedData = localStorage.getItem(bookingDataKey);
      if (savedData) {
        try {
          const data = JSON.parse(savedData);

          // 1. Restore Booking Details (Participants & Dates) - Applies to everyone
          if (data.participants && data.participants.length > 0) {
            setParticipants(data.participants);
          }

          // 2. Smart Date Validation (The "Stale Date" Fix)
          // Ensure we don't restore dates that have already passed
          const todayStr = toYYYYMMDD(new Date()); 
          const validDates = (data.selectedDates || []).filter((dateStr: string) => {
             return dateStr >= todayStr;
          });
          setSelectedDates(new Set(validDates));

          // 3. Restore Contact Info ONLY if Guest (DB data takes priority for logged-in users)
          if (!userProfile) {
            if (data.contactName) setContactName(data.contactName);
            if (data.contactEmail) setContactEmail(data.contactEmail);
            if (data.contactPhone) setContactPhone(data.contactPhone);
          }
          
          if (validDates.length > 0 || (data.participants && data.participants.length > 0)) {
               toast.info("Restored your previous booking session.");
          }

        } catch (e) {
          console.error("Error restoring booking data", e);
          localStorage.removeItem(bookingDataKey);
        }
      }
      
      // Mark initialization as complete so we can start saving updates
      setIsRestored(true);
    };

    initialize();
  }, [bookingDataKey]); // Only run once on mount

  // --- 2. PERSISTENCE LOGIC (Save on Change) ---
  useEffect(() => {
    // Only save if initialization is complete. 
    // This prevents overwriting valid localStorage data with empty state on initial render.
    if (isRestored) {
      const dataToSave = {
        contactName,
        contactEmail,
        contactPhone,
        participants,
        selectedDates: Array.from(selectedDates),
      };
      localStorage.setItem(bookingDataKey, JSON.stringify(dataToSave));
    }
  }, [
    contactName,
    contactEmail,
    contactPhone,
    participants,
    selectedDates,
    bookingDataKey,
    isRestored // Critical dependency
  ]);


  // --- Course & Schedule Fetching ---
  useEffect(() => {
    const courseId = params.courseId as string;
    if (courseId) {
      axios
        .get(`${apiUrl}/api/public_api/courses/${courseId}`)
        .then((res) => setCourse(res.data))
        .catch(() => toast.error('Could not load course details.'));

      axios
        .get(`${apiUrl}/api/public/course-schedules/course/${courseId}`)
        .then((res) => {
          setSchedules(res.data || []);
          if (res.data && res.data.length > 0) {
            setSelectedScheduleId(res.data[0].schedule_id);
          }
        })
        .catch(() => toast.error('Could not load schedules for this course.'));
    }
  }, [params.courseId]);

  const fetchAvailability = useCallback(async () => {
    if (!selectedScheduleId) {
      setAvailabilityData(new Map());
      return;
    }

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const monthKey = `${year}-${month}`;

    if (fetchedMonths.has(monthKey)) return;
    try {
      const response = await axios.get(
        `${apiUrl}/api/public/booking-data/availability/schedule/${selectedScheduleId}`,
        { params: { year, month } }
      );
      const dataMap = new Map<string, AvailabilitySlot>();
      (response.data || []).forEach((slot: AvailabilitySlot) =>
        dataMap.set(slot.date, slot)
      );

      setAvailabilityData((prevData) => new Map([...prevData, ...dataMap]));
      setFetchedMonths((prev) => new Set(prev).add(monthKey));
    } catch (error) {
      toast.error('Failed to load availability for this month.');
      console.error(error);
    }
  }, [currentMonth, selectedScheduleId, fetchedMonths]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // --- Form Handlers ---
  const addParticipant = () =>
    setParticipants([
      ...participants,
      {
        id: Date.now(),
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'Prefer not to say',
        skillLevel: 'Beginner',
        medicalNotes: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        dailyHours: 1,
      },
    ]);
  const removeParticipant = (id: number) => {
    if (participants.length > 1)
      setParticipants(participants.filter((p) => p.id !== id));
    else toast.error('At least one participant is required.');
  };
  const handleParticipantChange = (
    index: number,
    field: keyof Omit<Participant, 'id'>,
    value: string | number
  ) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);
  };
  
  const handleDateSelect = (dateString: string) => {
    setSelectedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dateString)) newSet.delete(dateString);
      else newSet.add(dateString);
      return newSet;
    });
  };

  const priceDetails = useMemo(() => {
    let subtotalPerParticipant = 0;
    Array.from(selectedDates).forEach((date) => {
      subtotalPerParticipant +=
        availabilityData.get(date)?.price || course?.pricePerSlot || 0;
    });

    let totalSubtotal = 0;
    participants.forEach((p) => {
      totalSubtotal += subtotalPerParticipant * (p.dailyHours || 1);
    });

    let discountAmount = 0;
    if (discount) {
      discountAmount =
        discount.type === 'PERCENTAGE'
          ? totalSubtotal * (discount.amount / 100)
          : discount.amount;
    }

    const finalPrice = Math.max(0, totalSubtotal - discountAmount);
    return { subtotal: totalSubtotal, discountAmount, finalPrice };
  }, [selectedDates, participants, course, discount, availabilityData]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.warn('Please enter a coupon code.');
      return;
    }
    if (!course) {
      toast.error('Course information not loaded.');
      return;
    }
    setCouponLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/public/booking-data/validate-coupon`,
        { couponCode, courseId: course.id }
      );
      console.log('Coupon validation response:', response.data);
      const { valid, message, discountType, discountValue } = response.data;
      if (valid) {
        toast.success(message);
        setDiscount({ type: discountType, amount: discountValue });
      } else {
        toast.error(message);
        setDiscount(null);
      }
    } catch (error) {
      console.error('Coupon validation failed:', error);
      toast.error('Invalid coupon code.');
      setDiscount(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !contactName ||
      !contactEmail ||
      !contactPhone ||
      !participants[0].firstName ||
      selectedDates.size === 0
    ) {
      toast.error(
        'Please fill out all required fields and select at least one date.'
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const bookingPayload = {
        userId: currentUser?.id,
        guestName: contactName,
        guestEmail: contactEmail,
        guestPhone: contactPhone,
        courseId: course?.id,
        scheduleId: selectedScheduleId,
        participants: participants.map(({ ...p }) => p),
        bookedDates: Array.from(selectedDates),
        couponCode: discount ? couponCode : null,
        originalAmount: priceDetails.subtotal,
        discountAmount: discount ? priceDetails.discountAmount : 0,
        finalAmount: priceDetails.finalPrice,
      };

      const response = await axios.post(
        `${apiUrl}/api/public/booking-data/initiate-booking`,
        bookingPayload
      );

      if (response.data.success) {
        const { bookingId } = response.data.data;
        toast.success('Booking saved. Redirecting to payment...');
        
        // Clear local storage ONLY on successful submission
        localStorage.removeItem(bookingDataKey);
        
        router.push(`/checkout/${bookingId}`);
      } else {
        toast.error(
          response.data.message || 'Booking failed. Please try again.'
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            'There was an error saving your booking.'
        );
      } else {
        toast.error('There was an error saving your booking.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Calendar Rendering ---
  const handlePrevMonth = () =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  const handleNextMonth = () =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            Book Your Spot
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            for {course?.name || 'our amazing course'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                1. Your Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-white">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Full Name
                  </label>
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full Name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email Address"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                2. Participant(s) Information
              </h2>
              <div className="space-y-6">
                {participants.map((p, index) => (
                  <div
                    key={p.id}
                    className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 relative"
                  >
                    <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">
                      Participant #{index + 1}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          First Name
                        </label>
                        <input
                          value={p.firstName}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              'firstName',
                              e.target.value
                            )
                          }
                          placeholder="First Name"
                          className="mt-1 block w-full rounded-md border border-gray-300 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          Last Name
                        </label>
                        <input
                          value={p.lastName}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              'lastName',
                              e.target.value
                            )
                          }
                          placeholder="Last Name"
                          className="mt-1 block w-full rounded-md border border-gray-300 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                        />
                      </div>
                      <div className="dark-date-birth">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={p.dateOfBirth}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              'dateOfBirth',
                              e.target.value
                            )
                          }
                          placeholder="Date of Birth"
                          className="mt-1 block w-full rounded-md border border-gray-300 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="text-sm block font-medium text-gray-700 dark:text-gray-200">
                          Skill Level
                        </label>
                        <select
                          value={p.skillLevel}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              'skillLevel',
                              e.target.value
                            )
                          }
                           
                          className="mt-1 block w-full rounded-md border border-gray-300 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                        >
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                        </select>
                      </div>
                      <div className="hidden">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          Hours Required per Day
                        </label>
                        <select
                          value={p.dailyHours || ''}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              'dailyHours',
                              Number(e.target.value)
                            )
                          }
                          className="mt-1 block w-full rounded-md border border-gray-300 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select hours</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} Hour{i > 0 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          Medical Notes
                        </label>
                        <textarea
                          value={p.medicalNotes}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              'medicalNotes',
                              e.target.value
                            )
                          }
                          placeholder="Notes"
                          className="mt-1 p-3 block w-full rounded-md border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                        ></textarea>
                      </div>
                    </div>
                    {participants.length > 1 && (
                      <button
                        onClick={() => removeParticipant(p.id)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addParticipant}
                className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                <PlusCircleIcon /> Add Another Participant
              </button>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                3. Select Booking Dates
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Available Schedules
                </label>
                <select
                  value={selectedScheduleId || ''}
                  onChange={(e) =>
                    setSelectedScheduleId(Number(e.target.value))
                  }
                  className="mt-1 block w-full md:w-1/2 rounded-md border-gray-300 shadow-sm p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">-- Select a Schedule --</option>
                  {schedules.map((s) => (
                    <option key={s.schedule_id} value={s.schedule_id}>
                      {s.scheduleName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentMonth.toLocaleString('default', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2 ">
                  {calendarDays.map((day, index) => {
                    if (!day)
                      return (
                        <div
                          key={`empty-${index}`}
                          className="border rounded-md h-16 dark:border-gray-700"
                        ></div>
                      );

                    const dayString = toYYYYMMDD(day);
                    const slot = availabilityData.get(dayString);
                    const isSelected = selectedDates.has(dayString);
                    const isAvailable =
                      slot && slot.isBookingOpen && slot.availableSlots > 0;
                    const isFutureOrToday = day >= today;

                    let dayClass =
                      'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500';
                    if (isAvailable && isFutureOrToday) {
                      dayClass = isSelected
                        ? 'bg-indigo-600 text-white font-bold dark:bg-indigo-500'
                        : 'bg-green-100 hover:bg-green-200 cursor-pointer dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50';
                    } else if (slot) {
                      dayClass =
                        'bg-red-100 text-red-400 line-through cursor-not-allowed dark:bg-red-900/20 dark:text-red-400';
                    }

                    return (
                      <div
                        key={dayString}
                        onClick={() =>
                          isAvailable &&
                          isFutureOrToday &&
                          handleDateSelect(dayString)
                        }
                        className={`p-2 border rounded-md h-16 flex flex-col justify-center items-center text-sm transition-colors ${dayClass} dark:border-gray-700`}
                      >
                        <span>{day.getDate()}</span>
                        {slot && (
                          <span className="text-xs">
                            ({slot.availableSlots} left) (${slot.price})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sticky top-24 border dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4 dark:text-white dark:border-gray-700">
                Booking Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Course:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{course?.name}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Participants:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{participants.length}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Dates Selected:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedDates.size}</span>
                </div>
                <div className="border-t my-2 dark:border-gray-700"></div>
                <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-300">
                  <span>Subtotal:</span>
                  <span>${priceDetails.subtotal.toFixed(2)}</span>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      className="w-full text-sm rounded-md border border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="bg-gray-200 text-gray-700 px-3 py-1 text-sm font-semibold rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {discount && (
                    <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                      <span>Discount ({couponCode}):</span>
                      <span>- ${priceDetails.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t my-2 dark:border-gray-700"></div>
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                  <span>Total:</span>
                  <span>${priceDetails.finalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedDates.size === 0}
                className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
              >
                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-10">
        <ClassPoliciesAndRuleBook href="/images/Rule-book-Website-Updated.pdf">
          Class policies / Rule Book
        </ClassPoliciesAndRuleBook>
      </div>
    </div>
  );
};

export default BookingPage;