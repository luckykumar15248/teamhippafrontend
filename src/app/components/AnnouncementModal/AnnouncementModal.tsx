// components/AnnouncementModal.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface AnnouncementDto {
    announcementId: number;
    title: string;
    content: string;
    displayType: string;
    linkUrl?: string;
    bannerImageUrl?: string;
    modalTitle?: string;
    modalButtonText?: string;
    modalSize?: string;
    scope: string;
    sportId?: number;
    courseId?: number;
    scheduleId?: number;
    startDatetime: string;
    endDatetime?: string;
    isActive: boolean;
    createdByName?: string;
    createdAt: string;
    updatedAt: string;
}

export default function AnnouncementModal() {
    const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [currentModalIndex, setCurrentModalIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchModalAnnouncements = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                console.log('Fetching modal announcements from:', `${apiUrl}/api/public/content/modal`);
                
                const response = await axios.get(`${apiUrl}/api/public/content/modal`);
                console.log('Modal API Response:', response.data);
                
                if (Array.isArray(response.data)) {
                    const activeModals = response.data.filter(ann => 
                        ann.displayType === 'MODAL' && 
                        ann.isActive
                    );
                    
                    setAnnouncements(activeModals);
                    console.log(`Found ${activeModals.length} modal announcements`);
                    
                    // Show modal if there are active modal announcements
                    if (activeModals.length > 0) {
                        // Check if modal was already shown today
                        const lastShownDate = localStorage.getItem(`modal_last_shown_${activeModals[0].announcementId}`);
                        const today = new Date().toDateString();
                        
                        if (lastShownDate !== today) {
                            setShowModal(true);
                        }
                    }
                } else {
                    console.error('Unexpected response format:', response.data);
                    setError('Invalid response format from server');
                }
            } catch (error: unknown) {
                console.error('Failed to fetch modal announcements:', error);
                if (axios.isAxiosError(error) && error.response) {
                    console.error('Error status:', error.response.status);
                    console.error('Error data:', error.response.data);
                }
                setAnnouncements([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchModalAnnouncements();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        // Store that modal was shown today
        if (announcements[currentModalIndex]) {
            localStorage.setItem(
                `modal_last_shown_${announcements[currentModalIndex].announcementId}`, 
                new Date().toDateString()
            );
        }
    };

    const handleNext = () => {
        if (currentModalIndex < announcements.length - 1) {
            setCurrentModalIndex(currentModalIndex + 1);
        } else {
            handleClose();
        }
    };

    const handlePrevious = () => {
        if (currentModalIndex > 0) {
            setCurrentModalIndex(currentModalIndex - 1);
        }
    };

    if (loading || error || announcements.length === 0) {
        return null;
    }

    const currentAnnouncement = announcements[currentModalIndex];
    const modalTitle = currentAnnouncement.modalTitle || currentAnnouncement.title;
    const modalButtonText = currentAnnouncement.modalButtonText || 'OK';
    const modalSize = currentAnnouncement.modalSize || 'MEDIUM';

    const sizeClasses = {
        SMALL: 'max-w-sm',
        MEDIUM: 'max-w-md',
        LARGE: 'max-w-lg',
        XLARGE: 'max-w-xl'
    };

    return (
        <>
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={handleClose}
                    />
                    
                    {/* Modal Container */}
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <div className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full ${sizeClasses[modalSize as keyof typeof sizeClasses] || sizeClasses.MEDIUM}`}>
                            {/* Modal Header */}
                            <div className="bg-blue-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">
                                        {modalTitle}
                                    </h3>
                                    <button
                                        onClick={handleClose}
                                        className="text-white hover:text-gray-200 text-2xl font-bold"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                            
                            {/* Modal Body */}
                            <div className="px-6 py-4">
                                <div className="mt-2">
                                    <div className="text-gray-700 whitespace-pre-line">
                                        {currentAnnouncement.content}
                                    </div>
                                    
                                    {/* Show link if available */}
                                    {currentAnnouncement.linkUrl && (
                                        <div className="mt-4">
                                            <a 
                                                href={currentAnnouncement.linkUrl}
                                                className="text-blue-600 hover:text-blue-800 underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Learn more →
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-between">
                                <div className="flex items-center space-x-2">
                                    {announcements.length > 1 && (
                                        <>
                                            <button
                                                onClick={handlePrevious}
                                                disabled={currentModalIndex === 0}
                                                className={`px-3 py-1 rounded ${currentModalIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                                            >
                                                Previous
                                            </button>
                                            <span className="text-gray-600">
                                                {currentModalIndex + 1} / {announcements.length}
                                            </span>
                                            <button
                                                onClick={handleNext}
                                                className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                {currentModalIndex === announcements.length - 1 ? 'Close' : 'Next'}
                                            </button>
                                        </>
                                    )}
                                </div>
                                
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    {modalButtonText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}