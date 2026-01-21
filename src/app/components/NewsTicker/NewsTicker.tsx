// components/AnnouncementTicker.tsx (Simplified)
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface AnnouncementDto {
    announcementId: number;
    title: string;
    content: string;
    displayType: string;
    linkUrl?: string;
    isActive: boolean;
}

export default function AnnouncementTicker() {
    const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/content/ticker`)
            .then(response => {
                if (Array.isArray(response.data)) {
                    const tickers = response.data.filter(ann => 
                        ann.displayType === 'TICKER' && ann.isActive
                    );
                    setAnnouncements(tickers);
                }
            })
            .catch(() => {
                // Silent fail - don't show anything on error
                setAnnouncements([]);
            });
    }, []);

    useEffect(() => {
        if (announcements.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % announcements.length);
        }, 5000);
        
        return () => clearInterval(interval);
    }, [announcements.length]);

    // Don't render anything if no announcements
    if (announcements.length === 0) {
        return null;
    }

    const currentAnnouncement = announcements[currentIndex];

    return (
        <div className="bg-blue-600 text-white py-2 px-4 overflow-hidden">
            <div className="container mx-auto flex items-center">
                <span className="mr-3">📢</span>
                <div className="flex-1 overflow-hidden">
                    <div className="whitespace-nowrap animate-marquee">
                        {currentAnnouncement.linkUrl ? (
                            <a 
                                href={currentAnnouncement.linkUrl}
                                className="hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {currentAnnouncement.content}
                            </a>
                        ) : (
                            <span>{currentAnnouncement.content}</span>
                        )}
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                    display: inline-block;
                    padding-left: 100%;
                }
                @keyframes marquee {
                    from { transform: translateX(5); }
                    to { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
}