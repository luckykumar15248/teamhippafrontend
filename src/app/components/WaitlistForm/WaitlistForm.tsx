// File: app/components/WaitlistForm.tsx
// A reusable form component for users to join a waitlist for a specific sport.

'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

// --- Type Definitions ---
interface WaitlistSubmission {
    sportName: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    age?: number;
    skillLevel?: string;
    notes?: string;
    userId?: number;
}

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- Reusable Waitlist Form Component ---
const WaitlistForm: React.FC<{ sportName: 'Pickleball' | 'Tennis' }> = ({ sportName }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    // Pre-fill form if a user is logged in
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`${apiUrl}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(response => {
                    const user = response.data;
                    setCurrentUser(user);
                    setName(`${user.firstName} ${user.lastName}`);
                    setEmail(user.email);
                    if (user.phone) setPhone(user.phone);
                });
        }
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!name || !email) {
            toast.error("Please fill in your name and email.");
            return;
        }
        setIsSubmitting(true);

        const payload: WaitlistSubmission = {
            sportName,
            guestName: name,
            guestEmail: email,
            guestPhone: phone,
            age: age ? Number(age) : undefined,
            skillLevel,
            notes,
            userId: currentUser?.id
        };

        try {
            // This endpoint will need to be created on your backend
            await axios.post(`${apiUrl}/api/public/waitlist/join`, payload);
            
            toast.success(`You've been added to the ${sportName} waitlist! We'll be in touch.`);
            
            // Reset form fields after successful submission
            if (!currentUser) {
                setName('');
                setEmail('');
                setPhone('');
            }
            setAge('');
            setSkillLevel('Beginner');
            setNotes('');

        } catch (error) {
            toast.error("There was an error submitting your request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Join the {sportName} Waitlist</h2>
            <p className="text-gray-600 mb-6">Spots are limited. Be the first to know when a new opening is available!</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={`name-${sportName}`} className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input id={`name-${sportName}`} type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full p-3 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor={`email-${sportName}`} className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input id={`email-${sportName}`} type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full p-3 border border-gray-300 rounded-md" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={`phone-${sportName}`} className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input id={`phone-${sportName}`} type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label htmlFor={`age-${sportName}`} className="block text-sm font-medium text-gray-700">Age</label>
                        <input id={`age-${sportName}`} type="number" value={age} onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" />
                    </div>
                </div>
                <div>
                    <label htmlFor={`skill-${sportName}`} className="block text-sm font-medium text-gray-700">Skill Level</label>
                    <select id={`skill-${sportName}`} value={skillLevel} onChange={e => setSkillLevel(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md">
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Not Sure</option>
                    </select>
                </div>
                <div>
                    <label htmlFor={`notes-${sportName}`} className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
                    <textarea id={`notes-${sportName}`} value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-md" rows={3}></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                </button>
            </form>
        </div>
    );
};

export default WaitlistForm;
